from sqlalchemy import Column, Integer, String, Boolean, DateTime, Time, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base


class DayOfWeek(str, enum.Enum):
    """Days of the week enum"""
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class ConsultantAvailability(Base):
    """
    Stores RCIC's weekly recurring availability schedule.
    Each row represents a time slot on a specific day of the week.
    
    IMPORTANT: All times are stored in the consultant's local timezone.
    When displaying to clients, convert from consultant's timezone to client's timezone.
    
    Example:
    - Monday 9:00 AM - 12:00 PM (in consultant's timezone: America/Toronto)
    - Monday 1:00 PM - 5:00 PM
    - Tuesday 9:00 AM - 5:00 PM
    
    If consultant is in Toronto (EST) and client is in India (IST),
    Monday 9:00 AM EST = Monday 7:30 PM IST (show to client)
    """
    __tablename__ = "consultant_availability"

    id = Column(Integer, primary_key=True, index=True)
    consultant_id = Column(Integer, ForeignKey("consultants.id", ondelete="CASCADE"), nullable=False)
    
    # Day and time configuration (in consultant's timezone)
    day_of_week = Column(Enum(DayOfWeek), nullable=False)
    start_time = Column(Time, nullable=False)  # e.g., 09:00:00 (consultant's local time)
    end_time = Column(Time, nullable=False)    # e.g., 17:00:00 (consultant's local time)
    
    # Timezone reference - stores consultant's timezone at time of creation
    # This is denormalized for performance (also available in consultants.timezone)
    # Common timezones:
    # Canada: America/Toronto (EST), America/Vancouver (PST), America/Edmonton (MST)
    # India: Asia/Kolkata (IST)
    timezone = Column(String, nullable=False, default="America/Toronto")
    
    # Slot interval for bookings within this availability window (in minutes)
    # e.g., 15 means bookings can start every 15 minutes
    # Supports: 15, 30, 60 minute intervals
    # Default 15 allows maximum flexibility for variable service durations
    slot_interval_minutes = Column(Integer, default=15)
    
    # Status and settings
    is_active = Column(Boolean, default=True)  # Can temporarily disable without deleting
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    consultant = relationship("Consultant", backref="availability_slots")
    
    # Ensure no overlapping slots for same consultant on same day
    __table_args__ = (
        UniqueConstraint('consultant_id', 'day_of_week', 'start_time', 
                        name='uq_consultant_day_start_time'),
    )


class ConsultantBlockedTime(Base):
    """
    Stores specific dates/times when consultant is NOT available
    (overrides the weekly schedule for exceptions like holidays, vacations, etc.)
    
    Example:
    - December 25, 2025 (Christmas - all day)
    - January 15, 2025 2:00 PM - 4:00 PM (Doctor's appointment)
    """
    __tablename__ = "consultant_blocked_time"

    id = Column(Integer, primary_key=True, index=True)
    consultant_id = Column(Integer, ForeignKey("consultants.id", ondelete="CASCADE"), nullable=False)
    
    # Blocked time range
    start_datetime = Column(DateTime(timezone=True), nullable=False)
    end_datetime = Column(DateTime(timezone=True), nullable=False)
    
    # Optional reason/note
    reason = Column(String, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    consultant = relationship("Consultant", backref="blocked_times")
