from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.booking import BookingCreate, BookingUpdate, BookingDocumentCreate

def get_booking(db: Client, booking_id: int) -> Optional[Dict]:
    response = db.table("bookings").select("*, documents:booking_documents(*)").eq("id", booking_id).execute()
    return response.data[0] if response.data else None

def get_bookings_by_client(db: Client, client_id: int) -> List[Dict]:
    response = db.table("bookings").select("*, documents:booking_documents(*)").eq("client_id", client_id).execute()
    return response.data

def get_bookings_by_consultant(db: Client, consultant_id: int) -> List[Dict]:
    response = db.table("bookings").select("*, documents:booking_documents(*)").eq("consultant_id", consultant_id).execute()
    return response.data

def create_booking(db: Client, *, obj_in: BookingCreate) -> Dict:
    response = db.table("bookings").insert(obj_in.dict()).execute()
    return response.data[0]

def update_booking(db: Client, *, booking_id: int, obj_in: BookingUpdate) -> Dict:
    response = db.table("bookings").update(obj_in.dict(exclude_unset=True)).eq("id", booking_id).execute()
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
