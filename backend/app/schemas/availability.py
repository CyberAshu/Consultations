from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import time, datetime
from enum import Enum
from zoneinfo import ZoneInfo, available_timezones


class DayOfWeek(str, Enum):
    """Days of the week"""
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


# Common timezones for quick reference (not exhaustive)
# System supports ALL valid IANA timezones
COMMON_TIMEZONES_CANADA_INDIA = [
    # Canada
    "America/Toronto",      # EST/EDT - Ontario, Quebec
    "America/Vancouver",    # PST/PDT - British Columbia
    "America/Edmonton",     # MST/MDT - Alberta
    "America/Winnipeg",     # CST/CDT - Manitoba
    "America/Halifax",      # AST/ADT - Nova Scotia
    "America/St_Johns",     # NST/NDT - Newfoundland
    "America/Regina",       # CST - Saskatchewan
    "America/Whitehorse",   # MST - Yukon
    "America/Yellowknife",  # MST - Northwest Territories
    "America/Iqaluit",      # EST - Nunavut
    
    # India
    "Asia/Kolkata",         # IST - All of India
]


def is_valid_timezone(tz: str) -> bool:
    """Check if timezone is a valid IANA timezone."""
    try:
        ZoneInfo(tz)
        return True
    except Exception:
        return False


# ============================================================
# Consultant Availability Schemas
# ============================================================

class AvailabilitySlotBase(BaseModel):
    """Base schema for availability slot"""
    day_of_week: DayOfWeek
    start_time: time = Field(..., description="Start time in HH:MM:SS format")
    end_time: time = Field(..., description="End time in HH:MM:SS format")
    timezone: str = Field(default="America/Toronto", description="Timezone for the time slot")
    slot_interval_minutes: int = Field(default=15, ge=15, le=60, description="Slot interval in minutes (15, 30, or 60)")
    is_active: bool = Field(default=True)
    
    @validator('end_time')
    def end_time_after_start_time(cls, v, values):
        """Validate that end_time is after start_time"""
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v
    
    @validator('timezone')
    def validate_timezone(cls, v):
        """Validate timezone is a valid IANA timezone"""
        if not is_valid_timezone(v):
            raise ValueError(
                f'Invalid timezone: {v}. Must be a valid IANA timezone '
                f'(e.g., {COMMON_TIMEZONES_CANADA_INDIA[0]})'
            )
        return v


class AvailabilitySlotCreate(AvailabilitySlotBase):
    """Schema for creating a new availability slot"""
    pass


class AvailabilitySlotUpdate(BaseModel):
    """Schema for updating an availability slot"""
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None
    
    @validator('timezone')
    def validate_timezone(cls, v):
        """Validate timezone is a valid IANA timezone"""
        if v is not None and not is_valid_timezone(v):
            raise ValueError(
                f'Invalid timezone: {v}. Must be a valid IANA timezone '
                f'(e.g., {COMMON_TIMEZONES_CANADA_INDIA[0]})'
            )
        return v


class AvailabilitySlotInDB(AvailabilitySlotBase):
    """Schema for availability slot from database"""
    id: int
    consultant_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AvailabilitySlotResponse(AvailabilitySlotInDB):
    """Schema for API response"""
    pass


# ============================================================
# Bulk Operations for Weekly Schedule
# ============================================================

class WeeklyScheduleCreate(BaseModel):
    """Schema for creating entire weekly schedule at once"""
    slots: List[AvailabilitySlotCreate] = Field(..., description="List of availability slots for the week")
    
    @validator('slots')
    def validate_no_overlaps(cls, slots):
        """Validate that slots don't overlap on same day"""
        day_slots = {}
        for slot in slots:
            if slot.day_of_week not in day_slots:
                day_slots[slot.day_of_week] = []
            day_slots[slot.day_of_week].append((slot.start_time, slot.end_time))
        
        # Check for overlaps within each day
        for day, times in day_slots.items():
            times.sort()  # Sort by start time
            for i in range(len(times) - 1):
                if times[i][1] > times[i + 1][0]:  # end_time > next start_time
                    raise ValueError(f'Overlapping time slots found for {day}')
        
        return slots


class WeeklyScheduleResponse(BaseModel):
    """Schema for weekly schedule response"""
    consultant_id: int
    timezone: str
    slots: List[AvailabilitySlotResponse]


# ============================================================
# Blocked Time Schemas
# ============================================================

class BlockedTimeBase(BaseModel):
    """Base schema for blocked time"""
    start_datetime: datetime
    end_datetime: datetime
    reason: Optional[str] = None
    
    @validator('end_datetime')
    def end_after_start(cls, v, values):
        """Validate that end is after start"""
        if 'start_datetime' in values and v <= values['start_datetime']:
            raise ValueError('end_datetime must be after start_datetime')
        return v


class BlockedTimeCreate(BlockedTimeBase):
    """Schema for creating blocked time"""
    pass


class BlockedTimeUpdate(BaseModel):
    """Schema for updating blocked time"""
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    reason: Optional[str] = None


class BlockedTimeInDB(BlockedTimeBase):
    """Schema for blocked time from database"""
    id: int
    consultant_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class BlockedTimeResponse(BlockedTimeInDB):
    """Schema for API response"""
    pass


# ============================================================
# Available Time Slots for Client Booking
# ============================================================

class AvailableSlot(BaseModel):
    """Individual available time slot for booking (in client's timezone)"""
    start: datetime = Field(..., description="Start time in client's timezone")
    end: datetime = Field(..., description="End time in client's timezone")
    start_consultant_tz: datetime = Field(..., description="Start time in consultant's timezone (for reference)")
    consultant_timezone: str
    available: bool = True


class AvailableTimeSlots(BaseModel):
    """Available time slots for a specific date"""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    consultant_id: int
    consultant_timezone: str
    client_timezone: str = Field(..., description="Client's timezone for conversion")
    slots: List[AvailableSlot] = Field(..., description="List of available time slots")
    total_slots: int


# ============================================================
# Copy/Repeat Schedule
# ============================================================

class CopyScheduleRequest(BaseModel):
    """Request to copy schedule to next week(s)"""
    weeks_to_copy: int = Field(1, ge=1, le=12, description="Number of weeks to repeat (1-12)")
