from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, UUID as SQLAlchemyUUID
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class SessionNote(Base):
    __tablename__ = "session_notes"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    
    # Note content
    content = Column(Text, nullable=False)
    note_type = Column(String, default="session_note")  # session_note, follow_up, etc.
    
    # Visibility and sharing
    is_shared_with_client = Column(Boolean, default=False)
    shared_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    booking = relationship("Booking", back_populates="session_notes")
    consultant = relationship("Consultant", back_populates="session_notes")
    
    def __repr__(self):
        return f"<SessionNote(id={self.id}, booking_id={self.booking_id}, created_at={self.created_at})>"
