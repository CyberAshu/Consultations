from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base
from app.models.booking import PaymentStatus  # Reuse existing enum

class PaymentMethod(str, enum.Enum):
    stripe = "stripe"
    paypal = "paypal"
    bank_transfer = "bank_transfer"

class PaymentStatusExtended(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    succeeded = "succeeded"
    failed = "failed"
    refunded = "refunded"
    partially_refunded = "partially_refunded"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=False)
    
    # Payment details
    amount = Column(Float, nullable=False)
    currency = Column(String, default="CAD")
    method = Column(Enum(PaymentMethod), default=PaymentMethod.stripe)
    status = Column(Enum(PaymentStatusExtended), default=PaymentStatusExtended.pending)
    
    # External payment references
    stripe_payment_intent_id = Column(String)
    stripe_charge_id = Column(String)
    paypal_payment_id = Column(String)
    
    # Refund information
    refund_amount = Column(Float, default=0.0)
    refund_reason = Column(Text)
    refunded_at = Column(DateTime(timezone=True))
    
    # Timestamps
    processed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    booking = relationship("Booking", back_populates="payment")
    consultant = relationship("Consultant", back_populates="payments")
