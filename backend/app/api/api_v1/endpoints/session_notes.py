from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from supabase import Client
from datetime import datetime, timezone
import traceback

from app.api import deps
from app.crud import crud_booking, crud_session_note
from app.schemas.session_note import (
    SessionNoteCreate, 
    SessionNoteUpdate, 
    SessionNoteInDB,
    SessionNoteResponse,
    ShareNoteRequest
)
from app.utils.email_service import EmailService


router = APIRouter()


def get_time_ago(created_at: str) -> str:
    """Convert datetime to human readable time ago format"""
    try:
        created_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        diff = now - created_time
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    except:
        return "Unknown"


@router.post("/{booking_id}/notes", response_model=SessionNoteResponse)
def create_session_note(
    *,
    request: Request,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    note_in: SessionNoteCreate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new session note for a booking.
    Only RCIC consultants can create notes.
    """
    print(f"DEBUG: Creating session note for booking {booking_id}")
    print(f"DEBUG: User role: {current_user.get('role')}")
    print(f"DEBUG: Note data: {note_in}")
    print(f"DEBUG: Note data dict: {note_in.dict()}")
    
    # Verify user is RCIC
    if current_user["role"] != "rcic":
        print(f"DEBUG: Permission denied - user role is {current_user['role']}, expected 'rcic'")
        raise HTTPException(status_code=403, detail="Only RCIC consultants can create session notes")
    
    # Get booking and verify it exists and belongs to this consultant
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Get consultant profile
    consultant_response = db.table("consultants").select("id, name").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data:
        raise HTTPException(status_code=404, detail="Consultant profile not found")
    
    consultant = consultant_response.data[0]
    
    # Verify this booking belongs to the consultant
    if booking["consultant_id"] != consultant["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to add notes to this booking")
    
    # Override booking_id from URL
    note_in.booking_id = booking_id
    
    # Force sharing with client (ignore request body value)
    note_in.is_shared_with_client = True
    
    # Create the note
    try:
        note = crud_session_note.create_session_note(
            db=db, 
            obj_in=note_in, 
            consultant_id=consultant["id"], 
            client_id=booking["client_id"]
        )
        print(f"DEBUG: Successfully created note: {note}")
    except Exception as e:
        print(f"DEBUG: Error creating note: {str(e)}")
        print(f"DEBUG: Exception type: {type(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create session note: {str(e)}")
    
    # Add consultant info and time_ago for response
    note["consultant_name"] = consultant["name"]
    note["time_ago"] = get_time_ago(note["created_at"])
    
    return note


@router.get("/{booking_id}/notes", response_model=List[SessionNoteResponse])
def get_booking_session_notes(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all session notes for a booking.
    RCIC sees all notes, client only sees shared notes.
    """
    # Get booking and verify access
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check user permissions
    if current_user["role"] == "client":
        if booking["client_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        # Client only sees shared notes
        include_private = False
    elif current_user["role"] == "rcic":
        # Verify RCIC owns this booking
        consultant_response = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if not consultant_response.data or booking["consultant_id"] != consultant_response.data[0]["id"]:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        # RCIC sees all notes
        include_private = True
    else:
        # Admin sees all notes
        include_private = True
    
    # Get notes with consultant details
    notes = crud_session_note.get_session_notes_with_consultant_details(
        db=db, 
        booking_id=booking_id, 
        include_private=include_private
    )
    
    # Add time_ago for each note
    for note in notes:
        note["time_ago"] = get_time_ago(note["created_at"])
    
    return notes


@router.put("/notes/{note_id}", response_model=SessionNoteResponse)
def update_session_note(
    *,
    db: Client = Depends(deps.get_db),
    note_id: int,
    note_in: SessionNoteUpdate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a session note.
    Only the RCIC who created the note can update it.
    """
    # Get the note
    note = crud_session_note.get_session_note(db=db, note_id=note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Session note not found")
    
    # Verify user is RCIC and owns this note
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCIC consultants can update session notes")
    
    consultant_response = db.table("consultants").select("id, name").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data or note["consultant_id"] != consultant_response.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this note")
    
    # Update the note
    updated_note = crud_session_note.update_session_note(db=db, note_id=note_id, obj_in=note_in)
    
    # Add consultant info and time_ago for response
    updated_note["consultant_name"] = consultant_response.data[0]["name"]
    updated_note["time_ago"] = get_time_ago(updated_note["created_at"])
    
    return updated_note


@router.delete("/notes/{note_id}")
def delete_session_note(
    *,
    db: Client = Depends(deps.get_db),
    note_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a session note.
    Only the RCIC who created the note can delete it.
    """
    # Get the note
    note = crud_session_note.get_session_note(db=db, note_id=note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Session note not found")
    
    # Verify user is RCIC and owns this note
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCIC consultants can delete session notes")
    
    consultant_response = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data or note["consultant_id"] != consultant_response.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this note")
    
    # Delete the note
    success = crud_session_note.delete_session_note(db=db, note_id=note_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete session note")
    
    return {"message": "Session note deleted successfully"}


@router.post("/{booking_id}/notes/share")
def share_session_notes(
    *,
    db: Client = Depends(deps.get_db),
    admin_db: Client = Depends(deps.get_admin_db),
    booking_id: int,
    share_request: ShareNoteRequest,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Share session notes with the client.
    Optionally send email notification.
    """
    # Verify user is RCIC
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCIC consultants can share session notes")
    
    # Get booking and verify it exists and belongs to this consultant
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    consultant_response = db.table("consultants").select("id, name").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data or booking["consultant_id"] != consultant_response.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to share notes for this booking")
    
    consultant = consultant_response.data[0]
    
    # Verify all notes belong to this booking and consultant
    for note_id in share_request.note_ids:
        note = crud_session_note.get_session_note(db=db, note_id=note_id)
        if not note:
            raise HTTPException(status_code=404, detail=f"Session note {note_id} not found")
        if note["booking_id"] != booking_id:
            raise HTTPException(status_code=400, detail=f"Note {note_id} does not belong to this booking")
        if note["consultant_id"] != consultant["id"]:
            raise HTTPException(status_code=403, detail=f"Not authorized to share note {note_id}")
    
    # Share the notes
    shared_notes = crud_session_note.share_notes_with_client(db=db, note_ids=share_request.note_ids)
    
    # Send email notification if requested
    if share_request.send_email:
        try:
            # Get client email
            client_resp = admin_db.auth.admin.get_user_by_id(booking["client_id"])
            client_user = getattr(client_resp, "user", None)
            client_email = getattr(client_user, "email", None)
            
            if client_email:
                # Fetch the shared notes content for email
                notes_content = []
                for note_id in share_request.note_ids:
                    note = crud_session_note.get_session_note(db=db, note_id=note_id)
                    if note:
                        created_at = datetime.fromisoformat(note["created_at"].replace('Z', '+00:00'))
                        notes_content.append({
                            "content": note["content"],
                            "created_at": created_at.strftime("%B %d, %Y at %I:%M %p"),
                            "note_type": note.get("note_type", "session_note")
                        })
                
                # Compose email
                subject = share_request.email_subject or f"New Session Notes from {consultant['name']}"
                
                notes_html = ""
                for note in notes_content:
                    notes_html += f"""
                    <div style="padding:12px;border-left:4px solid #10b981;background:#f0fdf4;border-radius:6px;margin-bottom:16px;">
                        <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">
                            {note['created_at']} - {note['note_type'].replace('_', ' ').title()}
                        </div>
                        <div>{note['content'].replace(chr(10), '<br/>')}</div>
                    </div>
                    """
                
                body = f"""
                    <p>Hello,</p>
                    <p>Your RCIC <strong>{consultant['name']}</strong> has shared notes from your recent session:</p>
                    {notes_html}
                    <p style="margin-top:24px;">You can view all your session notes by logging into your account and visiting your bookings.</p>
                    <p>You can reply to this email if you have any questions.</p>
                    <p>Best regards,<br/>Consultations Team</p>
                """
                
                EmailService.send_email(subject=subject, recipient=client_email, body=body)
        except Exception as e:
            # Email sending is non-critical, log the error but don't fail the request
            print(f"Failed to send email notification: {e}")
    
    return {
        "success": True,
        "shared_notes": len(shared_notes),
        "message": f"Successfully shared {len(shared_notes)} note(s) with the client"
    }


@router.get("/client/notes", response_model=List[SessionNoteResponse])
def get_client_session_notes(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    limit: int = 50,
) -> Any:
    """
    Get all session notes shared with the current client.
    """
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="This endpoint is only for clients")
    
    # Get all notes shared with this client
    notes = crud_session_note.get_session_notes_for_client(
        db=db, 
        client_id=current_user["id"], 
        limit=limit
    )
    
    # Enrich with consultant details and time_ago
    for note in notes:
        consultant_response = db.table("consultants").select("name, rcic_number").eq("id", note["consultant_id"]).execute()
        if consultant_response.data:
            note["consultant_name"] = consultant_response.data[0]["name"]
            note["consultant_rcic_number"] = consultant_response.data[0].get("rcic_number")
        
        note["time_ago"] = get_time_ago(note["created_at"])
    
    return notes
