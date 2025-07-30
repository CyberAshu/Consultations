from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from supabase import Client

from app.api import deps
from app.crud import crud_booking
from app.schemas.booking import BookingInDB, BookingCreate, BookingUpdate, BookingDocumentCreate

router = APIRouter()

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
            raise HTTPException(status_code=404, detail="Consultant profile not found")
        consultant_id = consultant_response.data[0]["id"]
        bookings = crud_booking.get_bookings_by_consultant(db, consultant_id=consultant_id)
    else:
        # Admin can see all bookings
        bookings = db.table("bookings").select("*, documents:booking_documents(*)").execute().data
    
    return bookings

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
    
    return booking

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
    # Ensure the client_id matches the current user
    if current_user["role"] == "client":
        booking_in.client_id = current_user["id"]
    
    booking = crud_booking.create_booking(db=db, obj_in=booking_in)
    return booking

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
    return updated_booking

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
