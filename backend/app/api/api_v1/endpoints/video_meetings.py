"""
Video meetings API endpoint for Daily.co integration
"""

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from supabase import Client
from datetime import datetime

from app.api import deps
from app.crud import crud_booking
from app.crud.crud_consultant import consultant as crud_consultant
from app.services.daily_service import daily_service
from app.models.booking import BookingStatus
from app.db.supabase import get_supabase_admin

router = APIRouter()


class CreateMeetingRequest(BaseModel):
    booking_id: int
    enable_recording: Optional[bool] = True


class MeetingResponse(BaseModel):
    room_name: str
    room_url: str
    client_token: str
    consultant_token: str
    expires: str
    booking_id: int


@router.post("/create-room", response_model=MeetingResponse)
async def create_meeting_room(
    *,
    db: Client = Depends(deps.get_db),
    request: CreateMeetingRequest,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a Daily.co meeting room for a booking.
    Can be called by the consultant (RCIC) or client associated with the booking.
    """
    
    # Get booking details
    booking = crud_booking.get_booking(db=db, booking_id=request.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions - only the client or consultant involved in the booking can create the room
    has_permission = False
    
    if current_user["role"] == "client" and booking["client_id"] == current_user["id"]:
        has_permission = True
    elif current_user["role"] == "rcic":
        # Get consultant profile for this user
        consultant_response = db.table("consultants").select("id, name").eq("user_id", current_user["id"]).execute()
        if consultant_response.data and booking["consultant_id"] == consultant_response.data[0]["id"]:
            has_permission = True
    elif current_user["role"] == "admin":
        has_permission = True
    
    if not has_permission:
        raise HTTPException(status_code=403, detail="You don't have permission to create a meeting room for this booking")
    
    # Check if meeting room already exists
    if booking.get("meeting_url"):
        room_name = booking["meeting_url"].split("/")[-1] if "/" in booking["meeting_url"] else booking["meeting_url"]
        try:
            # Return existing room with fresh tokens
            existing_room_info = await daily_service.get_room_info(room_name)
            
            # Parse booking date
            booking_date = booking["booking_date"]
            if isinstance(booking_date, str):
                booking_date = datetime.fromisoformat(booking_date.replace('Z', '+00:00'))
            
            duration_minutes = booking.get("service", {}).get("duration", 60)
            
            # Get user names
            admin_db = get_supabase_admin()
            client_resp = admin_db.auth.admin.get_user_by_id(booking["client_id"])
            client_user = getattr(client_resp, "user", None)
            client_name = getattr(client_user, "email", "Client").split("@")[0]
            
            consultant = crud_consultant.get(db, consultant_id=booking["consultant_id"])
            consultant_name = consultant.get("name", "Consultant") if consultant else "Consultant"
            
            # Generate fresh tokens
            client_token = await daily_service._create_meeting_token(
                room_name, client_name, "client", booking_date, duration_minutes
            )
            consultant_token = await daily_service._create_meeting_token(
                room_name, consultant_name, "consultant", booking_date, duration_minutes
            )
            
            return MeetingResponse(
                room_name=room_name,
                room_url=booking["meeting_url"],
                client_token=client_token,
                consultant_token=consultant_token,
                expires=existing_room_info.get("config", {}).get("exp", ""),
                booking_id=request.booking_id
            )
            
        except Exception:
            pass
    try:
        admin_db = get_supabase_admin()
        client_resp = admin_db.auth.admin.get_user_by_id(booking["client_id"])
        client_user = getattr(client_resp, "user", None)
        client_name = getattr(client_user, "email", "Client").split("@")[0] if client_user else "Client"
        
        consultant = crud_consultant.get(db, consultant_id=booking["consultant_id"])
        if not consultant:
            raise HTTPException(status_code=404, detail="Consultant not found")
        
        consultant_name = consultant.get("name", "Consultant")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user information: {str(e)}")
    
    # Create the Daily.co room
    try:
        # Parse booking date and duration
        booking_date = booking["booking_date"]
        if isinstance(booking_date, str):
            booking_date = datetime.fromisoformat(booking_date.replace('Z', '+00:00'))
        
        duration_minutes = booking.get("service", {}).get("duration", 60)
        
        room_info = await daily_service.create_room(
            consultation_id=str(request.booking_id),
            client_name=client_name,
            consultant_name=consultant_name,
            start_time=booking_date,
            duration_minutes=duration_minutes,
            enable_recording=request.enable_recording
        )
        
        # Update booking with meeting room URL
        crud_booking.update_booking(
            db=db, 
            booking_id=request.booking_id, 
            obj_in={"meeting_url": room_info["room_url"]}
        )
        
        # Mark meeting as active if created by consultant
        if current_user["role"] == "rcic":
            crud_booking.update_booking(
                db=db, 
                booking_id=request.booking_id, 
                obj_in={
                    "meeting_status": "active",
                    "consultant_joined_at": datetime.utcnow().isoformat()
                }
            )
        
        return MeetingResponse(
            room_name=room_info["room_name"],
            room_url=room_info["room_url"],
            client_token=room_info["client_token"],
            consultant_token=room_info["consultant_token"],
            expires=room_info["expires"],
            booking_id=request.booking_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create meeting room: {str(e)}")


@router.get("/booking/{booking_id}/room-info")
async def get_booking_meeting_info(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get meeting room information for a booking.
    Returns room URL and generates new tokens if needed.
    """
    
    # Get booking details
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    has_permission = False
    user_role = "client"
    
    if current_user["role"] == "client" and booking["client_id"] == current_user["id"]:
        has_permission = True
        user_role = "client"
    elif current_user["role"] == "rcic":
        consultant_response = db.table("consultants").select("id, name").eq("user_id", current_user["id"]).execute()
        if consultant_response.data and booking["consultant_id"] == consultant_response.data[0]["id"]:
            has_permission = True
            user_role = "consultant"
    elif current_user["role"] == "admin":
        has_permission = True
        user_role = "admin"
    
    if not has_permission:
        raise HTTPException(status_code=403, detail="You don't have permission to access this meeting")
    
    # Check if meeting room exists
    if not booking.get("meeting_url"):
        raise HTTPException(
            status_code=404, 
            detail="No meeting room found for this booking. Create one first."
        )
    
    # Extract room name from URL
    room_url = booking["meeting_url"]
    room_name = room_url.split("/")[-1] if "/" in room_url else room_url
    
    try:
        # Get room info from Daily.co
        room_info = await daily_service.get_room_info(room_name)
        
        # Generate new tokens for the current user
        booking_date = booking["booking_date"]
        if isinstance(booking_date, str):
            booking_date = datetime.fromisoformat(booking_date.replace('Z', '+00:00'))
        
        duration_minutes = 60
        if booking.get("service"):
            duration_minutes = booking["service"].get("duration", 60)
        
        # Get user names
        user_name = "User"
        if user_role == "client":
            admin_db = get_supabase_admin()
            client_resp = admin_db.auth.admin.get_user_by_id(booking["client_id"])
            client_user = getattr(client_resp, "user", None)
            user_name = getattr(client_user, "email", "Client").split("@")[0]
        elif user_role == "consultant":
            consultant = crud_consultant.get(db, consultant_id=booking["consultant_id"])
            user_name = consultant.get("name", "Consultant") if consultant else "Consultant"
        
        # Generate token for current user
        token = await daily_service._create_meeting_token(
            room_name=room_name,
            user_name=user_name,
            user_role=user_role,
            start_time=booking_date,
            duration_minutes=duration_minutes
        )
        
        return {
            "room_url": room_url,
            "room_name": room_name,
            "token": token,
            "user_role": user_role,
            "booking_id": booking_id,
            "expires": room_info.get("config", {}).get("exp")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get room information: {str(e)}")


@router.delete("/booking/{booking_id}/room")
async def delete_meeting_room(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete the meeting room for a booking.
    Only the consultant (RCIC) can delete the room.
    """
    
    # Get booking details
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions - only consultant or admin can delete rooms
    has_permission = False
    if current_user["role"] == "rcic":
        consultant_response = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if consultant_response.data and booking["consultant_id"] == consultant_response.data[0]["id"]:
            has_permission = True
    elif current_user["role"] == "admin":
        has_permission = True
    
    if not has_permission:
        raise HTTPException(status_code=403, detail="Only the consultant can delete the meeting room")
    
    # Check if meeting room exists
    if not booking.get("meeting_url"):
        raise HTTPException(status_code=404, detail="No meeting room found for this booking")
    
    # Extract room name from URL
    room_url = booking["meeting_url"]
    room_name = room_url.split("/")[-1] if "/" in room_url else room_url
    
    try:
        # Delete room from Daily.co
        success = await daily_service.delete_room(room_name)
        
        if success:
            # Remove meeting URL from booking
            crud_booking.update_booking(
                db=db, 
                booking_id=booking_id, 
                obj_in={"meeting_url": None}
            )
            
            return {"message": "Meeting room deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete meeting room")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete meeting room: {str(e)}")


@router.get("/booking/{booking_id}/status")
async def get_meeting_status(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get meeting status for a booking.
    Returns whether the meeting is active and participant information.
    """
    
    # Get booking details
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    has_permission = False
    if current_user["role"] == "client" and booking["client_id"] == current_user["id"]:
        has_permission = True
    elif current_user["role"] == "rcic":
        consultant_response = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if consultant_response.data and booking["consultant_id"] == consultant_response.data[0]["id"]:
            has_permission = True
    elif current_user["role"] == "admin":
        has_permission = True
    
    if not has_permission:
        raise HTTPException(status_code=403, detail="You don't have permission to access this meeting status")
    
    # Check if meeting room exists
    if not booking.get("meeting_url"):
        return {
            "is_active": False,
            "started_by": None,
            "started_at": None,
            "participant_count": 0,
            "message": "Meeting room not created yet"
        }
    
    # Extract room name from URL
    room_url = booking["meeting_url"]
    room_name = room_url.split("/")[-1] if "/" in room_url else room_url
    
    try:
        # Get room presence information from Daily.co
        room_info = await daily_service.get_room_info(room_name)
        
        # Check if room has active participants
        is_active = room_info.get("config", {}).get("exp", 0) > 0
        
        # Check if meeting status is stored in booking record
        meeting_status = booking.get("meeting_status", "not_started")  # not_started, active, ended
        consultant_joined = booking.get("consultant_joined_at")
        
        return {
            "is_active": meeting_status == "active",
            "started_by": "consultant" if consultant_joined else None,
            "started_at": consultant_joined,
            "participant_count": 1 if meeting_status == "active" else 0,
            "room_exists": True,
            "room_name": room_name,
            "meeting_status": meeting_status
        }
        
    except Exception as e:
        print(f"Error checking meeting status: {str(e)}")
        return {
            "is_active": False,
            "started_by": None,
            "started_at": None,
            "participant_count": 0,
            "error": str(e)
        }


@router.post("/booking/{booking_id}/join")
async def mark_meeting_joined(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark that a user has joined the meeting.
    Used to track when consultant starts the meeting.
    """
    
    # Get booking details
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    has_permission = False
    if current_user["role"] == "client" and booking["client_id"] == current_user["id"]:
        has_permission = True
    elif current_user["role"] == "rcic":
        consultant_response = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if consultant_response.data and booking["consultant_id"] == consultant_response.data[0]["id"]:
            has_permission = True
    elif current_user["role"] == "admin":
        has_permission = True
    
    if not has_permission:
        raise HTTPException(status_code=403, detail="You don't have permission to join this meeting")
    
    # If consultant is joining, mark meeting as active
    if current_user["role"] == "rcic":
        crud_booking.update_booking(
            db=db, 
            booking_id=booking_id, 
            obj_in={
                "meeting_status": "active",
                "consultant_joined_at": datetime.utcnow().isoformat()
            }
        )
        return {"message": "Meeting marked as active", "status": "active"}
    else:
        return {"message": "Joined meeting", "status": "joined"}


@router.get("/booking/{booking_id}/recordings")
async def get_meeting_recordings(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get recordings for a meeting.
    Only the consultant and client involved can access recordings.
    """
    
    # Get booking details
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    has_permission = False
    if current_user["role"] == "client" and booking["client_id"] == current_user["id"]:
        has_permission = True
    elif current_user["role"] == "rcic":
        consultant_response = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if consultant_response.data and booking["consultant_id"] == consultant_response.data[0]["id"]:
            has_permission = True
    elif current_user["role"] == "admin":
        has_permission = True
    
    if not has_permission:
        raise HTTPException(status_code=403, detail="You don't have permission to access these recordings")
    
    # Check if meeting room exists
    if not booking.get("meeting_url"):
        raise HTTPException(status_code=404, detail="No meeting room found for this booking")
    
    # Extract room name from URL
    room_url = booking["meeting_url"]
    room_name = room_url.split("/")[-1] if "/" in room_url else room_url
    
    try:
        # Get recordings from Daily.co
        recordings = await daily_service.get_recordings(room_name)
        
        return {
            "booking_id": booking_id,
            "room_name": room_name,
            "recordings": recordings
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recordings: {str(e)}")


# Webhook endpoints (optional - only if BACKEND_URL is configured)
@router.post("/webhook/join")
async def meeting_join_webhook(request: Request) -> Any:
    """
    Webhook called when someone joins a meeting
    """
    try:
        payload = await request.json()
        # Log the join event or update booking status
        print(f"Meeting join event: {payload}")
        return {"status": "received"}
    except Exception as e:
        print(f"Error processing join webhook: {e}")
        return {"status": "error"}


@router.post("/webhook/end")
async def meeting_end_webhook(request: Request) -> Any:
    """
    Webhook called when a meeting ends
    """
    try:
        payload = await request.json()
        # Log the end event or update booking status
        print(f"Meeting end event: {payload}")
        
        # Optionally update booking status to completed
        # You can extract room name from payload and find corresponding booking
        
        return {"status": "received"}
    except Exception as e:
        print(f"Error processing end webhook: {e}")
        return {"status": "error"}