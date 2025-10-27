from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from supabase import Client
import asyncio
import json
import time
from typing import AsyncGenerator, Optional
from datetime import datetime, timezone

from app.api import deps

router = APIRouter()

# Store active connections for different users
active_connections = {}

async def get_booking_updates(user_id: str, user_role: str, db: Client) -> AsyncGenerator[str, None]:
    """
    Generate server-sent events for booking status updates.
    Works for both clients and RCICs.
    """
    last_check_dt = datetime.now(timezone.utc)
    
    while True:
        try:
            # Get current bookings based on user role
            if user_role == "client":
                # For clients: get bookings where they are the client
                current_bookings = db.table("bookings").select("id, status, updated_at").eq("client_id", user_id).execute()
            elif user_role == "rcic":
                # For RCICs: get bookings where they are the consultant
                # First get the consultant record for this user
                consultant_query = db.table("consultants").select("id").eq("user_id", user_id).execute()
                if not consultant_query.data:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'RCIC consultant record not found'})}\n\n"
                    await asyncio.sleep(30)
                    continue
                
                consultant_id = consultant_query.data[0]['id']
                current_bookings = db.table("bookings").select("id, status, updated_at").eq("consultant_id", consultant_id).execute()
            else:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Unsupported user role'})}\n\n"
                await asyncio.sleep(30)
                continue
            
            if current_bookings.data:
                # Check for any updates since last check
                updates = []
                current_check_dt = datetime.now(timezone.utc)
                
                for booking in current_bookings.data:
                    # Always check for updates, even if updated_at is null
                    should_include = False
                    
                    if booking.get('updated_at'):
                        try:
                            # Parse the updated_at timestamp
                            if isinstance(booking['updated_at'], str):
                                # Handle different timestamp formats
                                updated_str = booking['updated_at']
                                if updated_str.endswith('Z'):
                                    updated_str = updated_str[:-1] + '+00:00'
                                elif '+' not in updated_str and 'T' in updated_str:
                                    updated_str += '+00:00'
                                
                                booking_updated_dt = datetime.fromisoformat(updated_str)
                            else:
                                booking_updated_dt = booking['updated_at']
                            
                            # Ensure timezone awareness
                            if booking_updated_dt.tzinfo is None:
                                booking_updated_dt = booking_updated_dt.replace(tzinfo=timezone.utc)
                            
                            # Check if booking was updated since last check
                            if booking_updated_dt > last_check_dt:
                                should_include = True
                            
                        except (ValueError, AttributeError) as e:
                            # For safety, include recent bookings if timestamp parsing fails
                            should_include = True
                    
                    if should_include:
                        updates.append({
                            'id': booking['id'],
                            'status': booking['status'],
                            'updated_at': booking.get('updated_at')
                        })
                
                if updates:
                    data = json.dumps({
                        'type': 'booking_status_update',
                        'data': updates,
                        'timestamp': time.time()
                    })
                    yield f"data: {data}\n\n"
                
                last_check_dt = current_check_dt
            
            # Send heartbeat every 10 seconds (reduced for faster testing)
            yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': time.time(), 'last_check': last_check_dt.isoformat()})}\n\n"
            
            # Wait before next check - reduced to 10 seconds for better responsiveness
            await asyncio.sleep(10)
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            await asyncio.sleep(5)

@router.get("/booking-updates")
async def stream_booking_updates(
    token: str = None,
    db: Client = Depends(deps.get_db),
):
    """
    Server-Sent Events endpoint for real-time booking status updates.
    Supports token via query parameter for EventSource compatibility.
    Works for both clients and RCICs.
    """
    # Handle authentication via query parameter for EventSource
    if not token:
        raise HTTPException(status_code=401, detail="Token is required for SSE connection")
    
    try:
        from app.api.deps import verify_token
        current_user = verify_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Support both clients and RCICs
    if current_user["role"] not in ["client", "rcic"]:
        raise HTTPException(status_code=403, detail="This endpoint is only for clients and RCICs")
    
    user_id = current_user["id"]
    user_role = current_user["role"]
    
    return StreamingResponse(
        get_booking_updates(user_id, user_role, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        },
    )

# Alternative: Simple polling endpoint
@router.get("/booking-status/{booking_id}")
async def get_booking_status(
    booking_id: int,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
):
    """
    Simple endpoint to get current status of a specific booking.
    Useful for frontend polling.
    """
    # Get booking
    booking_response = db.table("bookings").select("id, status, updated_at").eq("id", booking_id).execute()
    
    if not booking_response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = booking_response.data[0]
    
    # Check permissions
    if current_user["role"] == "client":
        # Verify this booking belongs to the client
        full_booking = db.table("bookings").select("client_id").eq("id", booking_id).execute()
        if not full_booking.data or full_booking.data[0]["client_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to view this booking")
    elif current_user["role"] == "rcic":
        # Verify this booking belongs to the RCIC's consultant record
        consultant_query = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if not consultant_query.data:
            raise HTTPException(status_code=403, detail="RCIC consultant record not found")
        
        consultant_id = consultant_query.data[0]['id']
        full_booking = db.table("bookings").select("consultant_id").eq("id", booking_id).execute()
        if not full_booking.data or full_booking.data[0]["consultant_id"] != consultant_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this booking")
    
    return {
        "booking_id": booking["id"],
        "status": booking["status"],
        "updated_at": booking.get("updated_at"),
        "timestamp": time.time()
    }
