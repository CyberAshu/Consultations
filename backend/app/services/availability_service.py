from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo
from app.models.availability import ConsultantAvailability, ConsultantBlockedTime
from app.models.booking import Booking, BookingStatus
from app.crud.crud_availability import crud_availability
from app.schemas.availability import AvailableSlot, AvailableTimeSlots
from app.core.logging_config import availability_logger, log_timezone_conversion


class AvailabilityService:
    """
    Service for handling availability calculations with timezone conversions.
    
    Focus: Canada & India timezones
    - Canada: EST/PST/MST/CST (Toronto, Vancouver, Edmonton, Winnipeg)
    - India: IST (Kolkata)
    """
    
    # Default slot duration in minutes for generating time slots
    # This can be overridden per booking based on service duration
    DEFAULT_SLOT_DURATION = 15  # 15 minutes (smallest increment)
    
    # Supported slot durations based on service duration options
    SUPPORTED_DURATIONS = [15, 30, 45, 60, 90, 120]  # minutes
    
    def __init__(self):
        # System supports ALL valid IANA timezones
        # No hardcoded list needed - validation happens via zoneinfo
        self.common_timezones = [
            "America/Toronto",      # EST/EDT
            "America/Vancouver",    # PST/PDT
            "America/Edmonton",     # MST/MDT
            "America/Winnipeg",     # CST/CDT
            "America/Halifax",      # AST/ADT
            "America/St_Johns",     # NST/NDT
            "Asia/Kolkata",         # IST
        ]
    
    def get_available_slots_for_date(
        self,
        sql_db: Session,
        supabase_db,  # Supabase Client
        consultant_id: int,
        target_date: date,
        client_timezone: str,
        slot_duration_minutes: Optional[int] = None,
        service_id: Optional[int] = None
    ) -> AvailableTimeSlots:
        """
        Get available time slots for a consultant on a specific date.
        Converts from consultant's timezone to client's timezone.
        
        Args:
            sql_db: SQLAlchemy database session (for availability tables)
            supabase_db: Supabase client (for consultant/service tables)
            consultant_id: ID of the consultant
            target_date: Date to check availability for
            client_timezone: Client's timezone (e.g., "Asia/Kolkata")
            slot_duration_minutes: Duration of each booking slot in minutes (optional)
            service_id: Service ID to determine duration from service settings (optional)
        
        Returns:
            AvailableTimeSlots with slots in client's timezone
        
        Note:
            If service_id is provided, slot duration is fetched from service.
            Otherwise, slot_duration_minutes is used.
            If neither is provided, DEFAULT_SLOT_DURATION (15 min) is used.
        """
        # Determine slot duration
        if slot_duration_minutes is None:
            if service_id is not None:
                # Get service duration from Supabase
                service_response = supabase_db.table("consultant_services").select("duration").eq("id", service_id).execute()
                if service_response.data and len(service_response.data) > 0:
                    slot_duration_minutes = service_response.data[0].get("duration", self.DEFAULT_SLOT_DURATION)
                else:
                    slot_duration_minutes = self.DEFAULT_SLOT_DURATION
            else:
                slot_duration_minutes = self.DEFAULT_SLOT_DURATION
        
        # Get consultant's timezone from Supabase
        consultant_response = supabase_db.table("consultants").select("timezone").eq("id", consultant_id).execute()
        if not consultant_response.data or len(consultant_response.data) == 0:
            raise ValueError(f"Consultant {consultant_id} not found")
        
        consultant_tz = consultant_response.data[0].get("timezone") or "America/Toronto"
        
        # Get day of week for target date
        day_name = target_date.strftime("%A").lower()
        
        # Log fetch operation
        availability_logger.debug(
            f"Fetching slots - Consultant: {consultant_id} ({consultant_tz}) | "
            f"Date: {target_date} ({day_name}) | Duration: {slot_duration_minutes}m"
        )
        
        # Get consultant's availability slots for this day
        availability_slots = crud_availability.get_consultant_availability(
            db=sql_db,
            consultant_id=consultant_id,
            day_of_week=day_name,
            is_active=True
        )
        
        availability_logger.debug(f"Found {len(availability_slots)} availability slot(s) in DB")
        
        if not availability_slots:
            return AvailableTimeSlots(
                date=target_date.isoformat(),
                consultant_id=consultant_id,
                consultant_timezone=consultant_tz,
                client_timezone=client_timezone,
                slots=[],
                total_slots=0
            )
        
        # Get blocked times for this date
        start_of_day = datetime.combine(target_date, time.min).replace(tzinfo=ZoneInfo(consultant_tz))
        end_of_day = datetime.combine(target_date, time.max).replace(tzinfo=ZoneInfo(consultant_tz))
        
        blocked_times = crud_availability.get_consultant_blocked_times(
            db=sql_db,
            consultant_id=consultant_id,
            start_date=start_of_day,
            end_date=end_of_day
        )
        
        # Get existing bookings for this date with their duration info
        from app.models.service_template import ServiceDurationOption
        bookings_with_duration = sql_db.query(Booking, ServiceDurationOption.duration_minutes).outerjoin(
            ServiceDurationOption,
            Booking.duration_option_id == ServiceDurationOption.id
        ).filter(
            Booking.consultant_id == consultant_id,
            Booking.booking_date >= start_of_day,
            Booking.booking_date <= end_of_day,
            Booking.status.in_([
                BookingStatus.pending,
                BookingStatus.confirmed,
                BookingStatus.rescheduled
            ])
        ).all()
        
        # Build list of (booking, duration) tuples
        bookings_info = []
        for booking, duration_minutes in bookings_with_duration:
            if duration_minutes is None:
                # If no duration_option, get from service default duration
                service_response = supabase_db.table("consultant_services").select("duration").eq("id", booking.service_id).execute()
                if not service_response.data or len(service_response.data) == 0:
                    raise ValueError(f"Service {booking.service_id} not found for booking {booking.id}")
                
                duration_minutes = service_response.data[0].get("duration")
                if duration_minutes is None:
                    raise ValueError(f"Service {booking.service_id} has no duration set")
            
            bookings_info.append((booking, duration_minutes))
        
        # Generate available slots
        available_slots = []
        
        for avail_slot in availability_slots:
            # Create datetime objects in consultant's timezone
            slot_start = datetime.combine(target_date, avail_slot.start_time).replace(tzinfo=ZoneInfo(consultant_tz))
            slot_end = datetime.combine(target_date, avail_slot.end_time).replace(tzinfo=ZoneInfo(consultant_tz))
            
            # Use the slot_interval_minutes from the availability slot (e.g., 15 min)
            # This controls how often we generate potential booking start times
            slot_interval = avail_slot.slot_interval_minutes
            
            # Generate time slots within this availability window
            current_time = slot_start
            while current_time + timedelta(minutes=slot_duration_minutes) <= slot_end:
                slot_end_time = current_time + timedelta(minutes=slot_duration_minutes)
                
                # Check if slot is available (not blocked and not booked)
                is_available = self._is_slot_available(
                    current_time,
                    slot_end_time,
                    blocked_times,
                    bookings_info
                )
                
                if is_available:
                    # Convert to client's timezone
                    client_tz = ZoneInfo(client_timezone)
                    start_client_tz = current_time.astimezone(client_tz)
                    end_client_tz = slot_end_time.astimezone(client_tz)
                    
                    # Log first conversion for debugging
                    if len(available_slots) == 0:
                        log_timezone_conversion(
                            consultant_tz, 
                            client_timezone, 
                            f"{current_time} → {start_client_tz}"
                        )
                    
                    available_slots.append(AvailableSlot(
                        start=start_client_tz,
                        end=end_client_tz,
                        start_consultant_tz=current_time,
                        consultant_timezone=consultant_tz,
                        available=True
                    ))
                
                # Move to next slot based on slot_interval (not slot_duration)
                # This allows for overlapping booking opportunities
                current_time += timedelta(minutes=slot_interval)
        
        return AvailableTimeSlots(
            date=target_date.isoformat(),
            consultant_id=consultant_id,
            consultant_timezone=consultant_tz,
            client_timezone=client_timezone,
            slots=available_slots,
            total_slots=len(available_slots)
        )
    
    def _is_slot_available(
        self,
        slot_start: datetime,
        slot_end: datetime,
        blocked_times: List[ConsultantBlockedTime],
        bookings_info: List[Tuple[Booking, int]]
    ) -> bool:
        """
        Check if a time slot is available (not blocked and not booked).
        
        Args:
            slot_start: Start of the slot to check
            slot_end: End of the slot to check
            blocked_times: List of blocked time periods
            bookings_info: List of (booking, duration_minutes) tuples
        
        Returns:
            True if slot is available, False otherwise
        """
        # Check against blocked times
        for blocked in blocked_times:
            if self._time_ranges_overlap(
                slot_start, slot_end,
                blocked.start_datetime, blocked.end_datetime
            ):
                return False
        
        # Check against existing bookings
        for booking, booking_duration in bookings_info:
            booking_end = booking.booking_date + timedelta(minutes=booking_duration)
            if self._time_ranges_overlap(
                slot_start, slot_end,
                booking.booking_date, booking_end
            ):
                return False
        
        # Also check if slot is in the past
        now = datetime.now(slot_start.tzinfo)
        if slot_start < now:
            return False
        
        return True
    
    def _time_ranges_overlap(
        self,
        start1: datetime,
        end1: datetime,
        start2: datetime,
        end2: datetime
    ) -> bool:
        """Check if two time ranges overlap"""
        return start1 < end2 and end1 > start2
    
    def get_consultant_weekly_schedule(
        self,
        db: Session,
        consultant_id: int
    ) -> dict:
        """
        Get consultant's complete weekly schedule organized by day.
        
        Returns:
            Dictionary with days as keys and list of slots as values
        """
        slots = crud_availability.get_consultant_availability(
            db=db,
            consultant_id=consultant_id,
            is_active=True
        )
        
        # Organize by day
        schedule = {
            "monday": [],
            "tuesday": [],
            "wednesday": [],
            "thursday": [],
            "friday": [],
            "saturday": [],
            "sunday": []
        }
        
        for slot in slots:
            schedule[slot.day_of_week.value].append({
                "id": slot.id,
                "start_time": slot.start_time.isoformat(),
                "end_time": slot.end_time.isoformat(),
                "timezone": slot.timezone,
                "is_active": slot.is_active
            })
        
        return schedule
    
    def convert_time_to_timezone(
        self,
        dt: datetime,
        from_tz: str,
        to_tz: str
    ) -> datetime:
        """
        Convert datetime from one timezone to another.
        
        Args:
            dt: Datetime to convert
            from_tz: Source timezone (e.g., "America/Toronto")
            to_tz: Target timezone (e.g., "Asia/Kolkata")
        
        Returns:
            Datetime in target timezone
        """
        if dt.tzinfo is None:
            # If naive datetime, assume it's in from_tz
            dt = dt.replace(tzinfo=ZoneInfo(from_tz))
        
        return dt.astimezone(ZoneInfo(to_tz))
    
    def get_timezone_offset_info(
        self,
        tz1: str,
        tz2: str,
        reference_date: Optional[datetime] = None
    ) -> dict:
        """
        Get offset information between two timezones.
        Useful for displaying timezone difference to users.
        
        Example:
            "Toronto is 10.5 hours behind India"
        """
        if reference_date is None:
            reference_date = datetime.now()
        
        # Create datetime in first timezone
        dt1 = reference_date.replace(tzinfo=ZoneInfo(tz1))
        dt2 = dt1.astimezone(ZoneInfo(tz2))
        
        # Calculate offset
        offset_seconds = (dt2.utcoffset().total_seconds() - dt1.utcoffset().total_seconds())
        offset_hours = offset_seconds / 3600
        
        return {
            "timezone1": tz1,
            "timezone2": tz2,
            "offset_hours": offset_hours,
            "description": self._format_timezone_difference(tz1, tz2, offset_hours)
        }
    
    def _format_timezone_difference(self, tz1: str, tz2: str, offset_hours: float) -> str:
        """Format timezone difference in human-readable format"""
        tz1_name = tz1.split("/")[-1].replace("_", " ")
        tz2_name = tz2.split("/")[-1].replace("_", " ")
        
        if offset_hours > 0:
            return f"{tz1_name} is {abs(offset_hours):.1f} hours ahead of {tz2_name}"
        elif offset_hours < 0:
            return f"{tz1_name} is {abs(offset_hours):.1f} hours behind {tz2_name}"
        else:
            return f"{tz1_name} and {tz2_name} are in the same timezone"


# Create singleton instance
availability_service = AvailabilityService()
