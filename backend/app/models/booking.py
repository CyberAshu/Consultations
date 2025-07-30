from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, JSON, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"
    rescheduled = "rescheduled"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    succeeded = "succeeded"
    failed = "failed"
    refunded = "refunded"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("consultant_services.id"), nullable=False)
    
    # Booking details
    booking_date = Column(DateTime(timezone=True), nullable=False)
    timezone = Column(String, default="America/Toronto")
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    
    # Intake form and documents
    intake_form_data = Column(JSON)
    uploaded_documents = Column(JSON)  # Array of document references
    
    # Payment information
    total_amount = Column(Float, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    payment_intent_id = Column(String)  # Stripe payment intent ID
    
    # Meeting details
    meeting_url = Column(String)
    meeting_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class BookingDocument(Base):
    __tablename__ = "booking_documents"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    file_type = Column(String)
    is_required = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
