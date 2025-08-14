from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from supabase import Client
from pydantic import BaseModel

from app.api import deps
from app.crud import crud_booking
from app.schemas.booking import BookingInDB, BookingCreate, BookingUpdate, BookingDocumentCreate
from app.models.booking import BookingStatus, PaymentStatus
from app.utils.email_service import EmailService

router = APIRouter()

def sanitize_booking_data(bookings: List[dict]) -> List[dict]:
    """Sanitize booking data to handle null status and payment_status"""
    sanitized = []
    for booking in bookings:
        # Create a copy to avoid modifying original data
        booking_copy = booking.copy()
        
        # Handle null status and payment_status
        if booking_copy.get('status') is None:
            booking_copy['status'] = BookingStatus.pending.value
        if booking_copy.get('payment_status') is None:
            booking_copy['payment_status'] = PaymentStatus.pending.value
            
        sanitized.append(booking_copy)
    return sanitized

@router.get("/", response_model=List[BookingInDB])
def read_bookings(
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve bookings for the current user.
    """
    if current_user["role"] == "client":
        bookings = crud_booking.get_bookings_by_client(db, client_id=current_user["id"])
    elif current_user["role"] == "rcic":
        # First get consultant profile for this user
        consultant_response = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if not consultant_response.data:
            # Check if there are any consultants at all and what user_ids they have
            all_consultants = db.table("consultants").select("id, user_id, name").execute()
            detail_msg = f"Consultant profile not found for user_id: {current_user['id']}. "
            if all_consultants.data:
                detail_msg += f"Available consultants: {all_consultants.data}"
            else:
                detail_msg += "No consultants found in database."
            raise HTTPException(status_code=404, detail=detail_msg)
        consultant_id = consultant_response.data[0]["id"]
        bookings = crud_booking.get_bookings_by_consultant(db, consultant_id=consultant_id)
    else:
        # Admin can see all bookings
        bookings = db.table("bookings").select("*, documents:booking_documents(*)").execute().data
    
    # Sanitize booking data to handle null values
    return sanitize_booking_data(bookings)

@router.get("/{booking_id}", response_model=BookingInDB)
def read_booking(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get booking by ID.
    """
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if user has permission to view this booking
    if current_user["role"] == "client" and booking["client_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Sanitize booking data to handle null values
    return sanitize_booking_data([booking])[0]

@router.post("/", response_model=BookingInDB)
def create_booking(
    *,
    db: Client = Depends(deps.get_db),
    booking_in: BookingCreate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new booking.
    """
    # Ensure the client_id is set appropriately based on role
    if current_user["role"] == "client":
        # Always set to the authenticated client
        booking_in.client_id = current_user["id"]
    else:
        # For rcic/admin, require explicit client_id in request
        if not booking_in.client_id:
            raise HTTPException(status_code=400, detail="client_id is required when creating a booking as rcic or admin")
    
    booking = crud_booking.create_booking(db=db, obj_in=booking_in)
    # Sanitize booking data to handle null values
    return sanitize_booking_data([booking])[0]

@router.put("/{booking_id}", response_model=BookingInDB)
def update_booking(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    booking_in: BookingUpdate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update booking.
    """
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user["role"] == "client" and booking["client_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_booking = crud_booking.update_booking(
        db=db, booking_id=booking_id, obj_in=booking_in
    )
    # Sanitize booking data to handle null values
    return sanitize_booking_data([updated_booking])[0]

@router.get("/consultants/{consultant_id}/availability")
def get_consultant_availability(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
    date: str,
) -> Any:
    """
    Get available time slots for a consultant on a specific date.
    """
    slots = crud_booking.get_available_time_slots(db, consultant_id=consultant_id, date=date)
    return {"date": date, "slots": slots}

@router.post("/{booking_id}/documents")
def upload_booking_document(
    *,
    db: Client = Depends(deps.get_db),
    booking_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload document for booking.
    """
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user["role"] == "client" and booking["client_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Here you would implement file upload logic to cloud storage
    # For now, we'll create a document record with mock data
    document_data = BookingDocumentCreate(
        booking_id=booking_id,
        file_name=file.filename,
        file_path=f"/uploads/{booking_id}/{file.filename}",
        file_size=file.size,
        file_type=file.content_type
    )
    
    document = crud_booking.create_booking_document(db=db, obj_in=document_data)
    return document


class SendNotesRequest(BaseModel):
    notes: str
    subject: Optional[str] = None


@router.post("/{booking_id}/send-notes")
def send_booking_notes(
    *,
    db: Client = Depends(deps.get_db),
    admin_db: Client = Depends(deps.get_admin_db),
    booking_id: int,
    payload: SendNotesRequest,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Send meeting notes to the booking's client via email.
    Also stores notes in booking.meeting_notes if provided.
    """
    booking = crud_booking.get_booking(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Permissions: RCIC for this booking, the client, or admin
    if current_user["role"] == "client" and booking["client_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if current_user["role"] == "rcic":
        # Ensure rcic owns this booking
        consultant_resp = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if not consultant_resp.data or booking["consultant_id"] != consultant_resp.data[0]["id"]:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    # Fetch client email using admin privileges
    client_resp = admin_db.auth.admin.get_user_by_id(booking["client_id"])  # type: ignore[attr-defined]
    client_user = getattr(client_resp, "user", None)
    client_email = getattr(client_user, "email", None)
    if not client_email:
        raise HTTPException(status_code=404, detail="Client email not found")

    # Persist notes to booking
    try:
        crud_booking.update_booking(db=db, booking_id=booking_id, obj_in=BookingUpdate(meeting_notes=payload.notes))
    except Exception:
        # Non-fatal for email sending; continue
        pass

    # Compose and send email
    subject = payload.subject or "Session Notes from your RCIC"
    body = f"""
        <p>Hello,</p>
        <p>Your RCIC has shared notes from your recent session:</p>
        <div style=\"padding:12px;border-left:4px solid #10b981;background:#f0fdf4;border-radius:6px;\">{payload.notes.replace('\n','<br/>')}</div>
        <p style=\"margin-top:16px;\">You can reply to this email if you have any questions.</p>
        <p>Best regards,<br/>Consultations Team</p>
    """
    EmailService.send_email(subject=subject, recipient=client_email, body=body)

    return {"success": True}
