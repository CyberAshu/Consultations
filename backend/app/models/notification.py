from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base

class NotificationType(str, enum.Enum):
    booking_confirmed = "booking_confirmed"
    booking_cancelled = "booking_cancelled"
    booking_reminder = "booking_reminder"
    payment_received = "payment_received"
    review_request = "review_request"
    application_status = "application_status"
    system_announcement = "system_announcement"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    action_url = Column(String)  # Optional URL for notification action
    notification_data = Column(String)  # JSON string for additional data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
