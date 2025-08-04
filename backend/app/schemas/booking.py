from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from app.models.booking import BookingStatus, PaymentStatus
import json

# Booking Document Schemas
class BookingDocumentBase(BaseModel):
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    is_required: bool = False

class BookingDocumentCreate(BookingDocumentBase):
    booking_id: int

class BookingDocumentInDB(BookingDocumentBase):
    id: int

    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    consultant_id: int
    service_id: int
    booking_date: str  # Accept as ISO string from frontend
    timezone: str = "America/Toronto"
    intake_form_data: Optional[Any] = None
    total_amount: float

class BookingCreate(BookingBase):
    client_id: Optional[str] = None  # Will be set from auth context (UUID string)
    payment_intent_id: Optional[str] = None

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    meeting_url: Optional[str] = None
    meeting_notes: Optional[str] = None

class BookingInDB(BookingBase):
    id: int
    client_id: str  # UUID string
    status: BookingStatus
    payment_status: PaymentStatus
    payment_intent_id: Optional[str] = None
    documents: List[BookingDocumentInDB] = []

    class Config:
        from_attributes = True
