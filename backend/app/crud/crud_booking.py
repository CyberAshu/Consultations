from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.booking import BookingCreate, BookingUpdate, BookingDocumentCreate

def get_booking(db: Client, booking_id: int) -> Optional[Dict]:
    # Use wildcard but ensure updated_at is included by selecting all fields including it specifically
    response = db.table("bookings").select("*, updated_at, documents:booking_documents(*)").eq("id", booking_id).execute()
    return response.data[0] if response.data else None

def get_bookings_by_client(db: Client, client_id: str) -> List[Dict]:
    response = db.table("bookings").select("*, updated_at, documents:booking_documents(*)").eq("client_id", client_id).execute()
    return response.data

def get_bookings_by_consultant(db: Client, consultant_id: int) -> List[Dict]:
    response = db.table("bookings").select("*, updated_at, documents:booking_documents(*)").eq("consultant_id", consultant_id).execute()
    return response.data

def create_booking(db: Client, *, obj_in: BookingCreate) -> Dict:
    booking_data = obj_in.dict()
    # Set default values for status and payment_status if not provided
    if "status" not in booking_data or booking_data["status"] is None:
        booking_data["status"] = "pending"
    if "payment_status" not in booking_data or booking_data["payment_status"] is None:
        booking_data["payment_status"] = "pending"
    
    response = db.table("bookings").insert(booking_data).execute()
    booking_id = response.data[0]["id"]
    
    # Return the booking with documents included (initially empty)
    return get_booking(db, booking_id)

def update_booking(db: Client, *, booking_id: int, obj_in: BookingUpdate) -> Dict:
    from datetime import datetime, timezone
    
    update_data = obj_in.dict(exclude_unset=True)
    # Always set updated_at timestamp for tracking changes
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    response = db.table("bookings").update(update_data).eq("id", booking_id).execute()
    return response.data[0]

def create_booking_document(db: Client, *, obj_in: BookingDocumentCreate) -> Dict:
    response = db.table("booking_documents").insert(obj_in.dict()).execute()
    return response.data[0]

def get_available_time_slots(db: Client, consultant_id: int, date: str) -> List[Dict]:
    # This would implement logic to check consultant availability
    # For now, returning mock data
    return [
        {"time": "09:00", "available": True},
        {"time": "10:00", "available": False},
        {"time": "11:00", "available": True},
        {"time": "14:00", "available": True},
        {"time": "15:00", "available": True},
    ]
