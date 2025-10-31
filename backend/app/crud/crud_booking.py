from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.booking import BookingCreate, BookingUpdate, BookingDocumentCreate

def get_booking(db: Client, booking_id: int) -> Optional[Dict]:
    # Join with service_duration_options to get duration_minutes
    response = db.table("bookings").select(
        "id, client_id, consultant_id, service_id, booking_date, timezone, status, intake_form_data, total_amount, payment_status, payment_intent_id, meeting_url, meeting_notes, created_at, updated_at, duration_option_id, documents:booking_documents(*), duration_option:service_duration_options(duration_minutes, duration_label)"
    ).eq("id", booking_id).execute()
    
    if response.data:
        booking = response.data[0]
        # Flatten duration_option into booking object for easier access
        if booking.get('duration_option'):
            booking['duration_minutes'] = booking['duration_option'].get('duration_minutes')
            booking['duration_label'] = booking['duration_option'].get('duration_label')
        return booking
    return None

def get_bookings_by_client(db: Client, client_id: str) -> List[Dict]:
    response = db.table("bookings").select(
        "id, client_id, consultant_id, service_id, booking_date, timezone, status, intake_form_data, total_amount, payment_status, payment_intent_id, meeting_url, meeting_notes, created_at, updated_at, duration_option_id, documents:booking_documents(*), duration_option:service_duration_options(duration_minutes, duration_label)"
    ).eq("client_id", client_id).execute()
    
    # Flatten duration_option for each booking
    bookings = response.data
    for booking in bookings:
        if booking.get('duration_option'):
            booking['duration_minutes'] = booking['duration_option'].get('duration_minutes')
            booking['duration_label'] = booking['duration_option'].get('duration_label')
    
    return bookings

def get_bookings_by_consultant(db: Client, consultant_id: int) -> List[Dict]:
    response = db.table("bookings").select(
        "id, client_id, consultant_id, service_id, booking_date, timezone, status, intake_form_data, total_amount, payment_status, payment_intent_id, meeting_url, meeting_notes, created_at, updated_at, duration_option_id, documents:booking_documents(*), duration_option:service_duration_options(duration_minutes, duration_label)"
    ).eq("consultant_id", consultant_id).execute()
    
    # Flatten duration_option for each booking
    bookings = response.data
    for booking in bookings:
        if booking.get('duration_option'):
            booking['duration_minutes'] = booking['duration_option'].get('duration_minutes')
            booking['duration_label'] = booking['duration_option'].get('duration_label')
    
    return bookings

def create_booking(db: Client, *, obj_in: BookingCreate) -> Dict:
    booking_data = obj_in.dict()
    # Set defaults: immediately confirmed; payment stays pending by default
    if "status" not in booking_data or booking_data["status"] is None:
        booking_data["status"] = "confirmed"
    if "payment_status" not in booking_data or booking_data["payment_status"] is None:
        booking_data["payment_status"] = "pending"
    
    # Note: meeting_url will be created when RCIC starts the session via /bookings/{id}/room endpoint
    # This ensures we use real Daily.co API instead of placeholder URLs
    
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
