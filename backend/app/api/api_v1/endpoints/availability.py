from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from sqlalchemy.orm import Session
from datetime import date, datetime

from app.api import deps
from app.crud.crud_availability import crud_availability
from app.services.availability_service import availability_service
from app.core.logging_config import log_availability_creation, log_slot_fetch, log_error
from app.schemas.availability import (
    AvailabilitySlotCreate,
    AvailabilitySlotUpdate,
    AvailabilitySlotResponse,
    WeeklyScheduleCreate,
    WeeklyScheduleResponse,
    BlockedTimeCreate,
    BlockedTimeUpdate,
    BlockedTimeResponse,
    AvailableTimeSlots,
    COMMON_TIMEZONES_CANADA_INDIA,
    is_valid_timezone
)

router = APIRouter()


# ============================================================
# RCIC Endpoints - Manage Own Availability
# ============================================================

@router.get("/my-schedule", response_model=WeeklyScheduleResponse)
def get_my_weekly_schedule(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get RCIC's complete weekly schedule.
    Only accessible by RCIC users.
    """
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCICs can access this endpoint")
    
    # Get consultant profile
    consultant_response = supabase_db.table("consultants").select("id, timezone").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data:
        raise HTTPException(status_code=404, detail="Consultant profile not found")
    
    consultant_id = consultant_response.data[0]["id"]
    consultant_tz = consultant_response.data[0]["timezone"] or "America/Toronto"
    
    # Get all availability slots
    slots = crud_availability.get_consultant_availability(
        db=sql_db,
        consultant_id=consultant_id,
        is_active=True
    )
    
    return WeeklyScheduleResponse(
        consultant_id=consultant_id,
        timezone=consultant_tz,
        slots=[AvailabilitySlotResponse.from_orm(slot) for slot in slots]
    )


@router.post("/my-schedule/slots", response_model=AvailabilitySlotResponse)
def create_availability_slot(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    current_user: dict = Depends(deps.get_current_active_user),
    slot_in: AvailabilitySlotCreate,
) -> Any:
    """
    Create a new availability slot.
    Only accessible by RCIC users.
    """
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCICs can manage availability")
    
    # Get consultant profile
    consultant_response = supabase_db.table("consultants").select("id, timezone").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data:
        raise HTTPException(status_code=404, detail="Consultant profile not found")
    
    consultant_id = consultant_response.data[0]["id"]
    consultant_profile_tz = consultant_response.data[0].get("timezone", "America/Toronto")
    
    # Log incoming request
    log_availability_creation(consultant_id, {
        'day_of_week': slot_in.day_of_week,
        'start_time': slot_in.start_time,
        'end_time': slot_in.end_time,
        'timezone': slot_in.timezone,
        'profile_timezone': consultant_profile_tz
    })
    
    # Create the slot
    try:
        slot = crud_availability.create_availability_slot(
            db=sql_db,
            consultant_id=consultant_id,
            slot=slot_in
        )
        
        # Log successful creation
        log_availability_creation(consultant_id, {}, {
            'id': slot.id,
            'day_of_week': slot.day_of_week.value,
            'start_time': str(slot.start_time),
            'end_time': str(slot.end_time),
            'timezone': slot.timezone
        })
        
        return AvailabilitySlotResponse.from_orm(slot)
    except Exception as e:
        log_error(f"Failed to create availability slot for consultant {consultant_id}", e)
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/my-schedule/slots/{slot_id}", response_model=AvailabilitySlotResponse)
def update_availability_slot(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    current_user: dict = Depends(deps.get_current_active_user),
    slot_id: int,
    slot_in: AvailabilitySlotUpdate,
) -> Any:
    """
    Update an availability slot.
    Only accessible by RCIC users.
    """
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCICs can manage availability")
    
    # Get consultant profile
    consultant_response = supabase_db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data:
        raise HTTPException(status_code=404, detail="Consultant profile not found")
    
    consultant_id = consultant_response.data[0]["id"]
    
    # Verify slot belongs to this consultant
    existing_slot = crud_availability.get_availability_slot(sql_db, slot_id)
    if not existing_slot or existing_slot.consultant_id != consultant_id:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    
    # Update the slot
    updated_slot = crud_availability.update_availability_slot(
        db=sql_db,
        slot_id=slot_id,
        slot_update=slot_in
    )
    
    if not updated_slot:
        raise HTTPException(status_code=404, detail="Failed to update slot")
    
    return AvailabilitySlotResponse.from_orm(updated_slot)


@router.delete("/my-schedule/slots/{slot_id}")
def delete_availability_slot(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    current_user: dict = Depends(deps.get_current_active_user),
    slot_id: int,
) -> Any:
    """
    Delete an availability slot.
    Only accessible by RCIC users.
    """
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCICs can manage availability")
    
    # Get consultant profile
    consultant_response = supabase_db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data:
        raise HTTPException(status_code=404, detail="Consultant profile not found")
    
    consultant_id = consultant_response.data[0]["id"]
    
    # Verify slot belongs to this consultant
    existing_slot = crud_availability.get_availability_slot(sql_db, slot_id)
    if not existing_slot or existing_slot.consultant_id != consultant_id:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    
    # Delete the slot
    success = crud_availability.delete_availability_slot(db=sql_db, slot_id=slot_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Failed to delete slot")
    
    return {"status": "success", "message": "Availability slot deleted"}


@router.post("/my-schedule/replace", response_model=WeeklyScheduleResponse)
def replace_weekly_schedule(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    current_user: dict = Depends(deps.get_current_active_user),
    schedule_in: WeeklyScheduleCreate,
) -> Any:
    """
    Replace entire weekly schedule at once (bulk update).
    Deletes all existing slots and creates new ones.
    Only accessible by RCIC users.
    """
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCICs can manage availability")
    
    # Get consultant profile
    consultant_response = supabase_db.table("consultants").select("id, timezone").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data:
        raise HTTPException(status_code=404, detail="Consultant profile not found")
    
    consultant_id = consultant_response.data[0]["id"]
    consultant_tz = consultant_response.data[0]["timezone"] or "America/Toronto"
    
    # Replace all slots
    try:
        new_slots = crud_availability.replace_consultant_availability(
            db=sql_db,
            consultant_id=consultant_id,
            slots=schedule_in.slots
        )
        
        return WeeklyScheduleResponse(
            consultant_id=consultant_id,
            timezone=consultant_tz,
            slots=[AvailabilitySlotResponse.from_orm(slot) for slot in new_slots]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================
# Blocked Time Management
# ============================================================

@router.get("/my-schedule/blocked", response_model=List[BlockedTimeResponse])
def get_my_blocked_times(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    current_user: dict = Depends(deps.get_current_active_user),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> Any:
    """
    Get RCIC's blocked times (holidays, vacations, etc.).
    Only accessible by RCIC users.
    """
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCICs can access this endpoint")
    
    # Get consultant profile
    try:
        consultant_response = supabase_db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
        if not consultant_response.data:
            raise HTTPException(status_code=404, detail="Consultant profile not found")
        
        consultant_id = consultant_response.data[0]["id"]
        
        blocked_times = crud_availability.get_consultant_blocked_times(
            db=sql_db,
            consultant_id=consultant_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return [BlockedTimeResponse.from_orm(bt) for bt in blocked_times]
    except HTTPException:
        raise
    except Exception as e:
        # Log the actual error for debugging
        print(f"Database error in get_my_blocked_times: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=503,
            detail="Database connection failed. Please try again in a moment."
        )


@router.post("/my-schedule/blocked", response_model=BlockedTimeResponse)
def create_blocked_time(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    current_user: dict = Depends(deps.get_current_active_user),
    blocked_in: BlockedTimeCreate,
) -> Any:
    """
    Create a blocked time period (holiday, vacation, etc.).
    Only accessible by RCIC users.
    """
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCICs can manage blocked times")
    
    # Get consultant profile
    consultant_response = supabase_db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data:
        raise HTTPException(status_code=404, detail="Consultant profile not found")
    
    consultant_id = consultant_response.data[0]["id"]
    
    blocked_time = crud_availability.create_blocked_time(
        db=sql_db,
        consultant_id=consultant_id,
        blocked_time=blocked_in
    )
    
    return BlockedTimeResponse.from_orm(blocked_time)


@router.delete("/my-schedule/blocked/{blocked_id}")
def delete_blocked_time(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    current_user: dict = Depends(deps.get_current_active_user),
    blocked_id: int,
) -> Any:
    """
    Delete a blocked time period.
    Only accessible by RCIC users.
    """
    if current_user["role"] != "rcic":
        raise HTTPException(status_code=403, detail="Only RCICs can manage blocked times")
    
    # Get consultant profile
    consultant_response = supabase_db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
    if not consultant_response.data:
        raise HTTPException(status_code=404, detail="Consultant profile not found")
    
    consultant_id = consultant_response.data[0]["id"]
    
    # Verify blocked time belongs to this consultant
    blocked_time = crud_availability.get_blocked_time(sql_db, blocked_id)
    if not blocked_time or blocked_time.consultant_id != consultant_id:
        raise HTTPException(status_code=404, detail="Blocked time not found")
    
    success = crud_availability.delete_blocked_time(db=sql_db, blocked_id=blocked_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Failed to delete blocked time")
    
    return {"status": "success", "message": "Blocked time deleted"}


# ============================================================
# Public/Client Endpoints - View Available Slots
# ============================================================

@router.get("/consultants/{consultant_id}/slots", response_model=AvailableTimeSlots)
def get_available_slots(
    *,
    supabase_db: Client = Depends(deps.get_db),
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    consultant_id: int,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    client_timezone: str = Query("America/Toronto", description="Client's timezone"),
    service_id: Optional[int] = Query(None, description="Service ID to determine duration"),
    duration_minutes: Optional[int] = Query(None, description="Custom duration in minutes"),
) -> Any:
    """
    Get available time slots for a consultant on a specific date.
    
    This endpoint:
    - Gets RCIC's availability for the day
    - Checks existing bookings
    - Checks blocked times
    - Converts times to client's timezone
    - Returns available slots
    
    Accessible by anyone (no authentication required for browsing).
    """
    # Validate and parse date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Validate timezone
    if not is_valid_timezone(client_timezone):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid timezone: {client_timezone}. Must be a valid IANA timezone. "
                   f"Common options: {', '.join(COMMON_TIMEZONES_CANADA_INDIA[:3])}..."
        )
    
    # Validate duration if provided
    if duration_minutes is not None and duration_minutes < 15:
        raise HTTPException(status_code=400, detail="Duration must be at least 15 minutes")
    
    try:
        available_slots = availability_service.get_available_slots_for_date(
            sql_db=sql_db,
            supabase_db=supabase_db,
            consultant_id=consultant_id,
            target_date=target_date,
            client_timezone=client_timezone,
            slot_duration_minutes=duration_minutes,
            service_id=service_id
        )
        
        # Log successful fetch
        log_slot_fetch(consultant_id, date, client_timezone, available_slots.total_slots)
        
        return available_slots
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch available slots: {str(e)}")


@router.get("/consultants/{consultant_id}/schedule")
def get_consultant_schedule(
    *,
    sql_db: Session = Depends(deps.get_sqlalchemy_db),
    consultant_id: int,
) -> Any:
    """
    Get consultant's weekly schedule (public view).
    Shows when RCIC is generally available (not specific bookings).
    
    Accessible by anyone.
    """
    schedule = availability_service.get_consultant_weekly_schedule(
        db=sql_db,
        consultant_id=consultant_id
    )
    
    return schedule


# ============================================================
# Utility Endpoints
# ============================================================

@router.get("/timezones")
def get_supported_timezones(
    common_only: bool = Query(True, description="Return only common Canada/India timezones")
) -> Any:
    """
    Get list of supported timezones.
    
    By default returns common Canada + India timezones.
    Set common_only=false to get all IANA timezones (600+).
    """
    if common_only:
        # Return curated list of common timezones
        timezones = [
            {
                "value": tz,
                "label": tz.split("/")[-1].replace("_", " "),
                "region": "Canada" if "America" in tz else "India",
                "full_name": tz
            }
            for tz in COMMON_TIMEZONES_CANADA_INDIA
        ]
    else:
        # Return all available IANA timezones
        from zoneinfo import available_timezones
        all_tzs = sorted(available_timezones())
        # Filter to relevant regions
        relevant = [tz for tz in all_tzs if tz.startswith(("America/", "Asia/", "Europe/", "Pacific/"))]
        timezones = [
            {
                "value": tz,
                "label": tz.split("/")[-1].replace("_", " "),
                "region": tz.split("/")[0],
                "full_name": tz
            }
            for tz in relevant[:100]  # Limit to 100 for performance
        ]
    
    return {
        "timezones": timezones,
        "total": len(timezones),
        "note": "System accepts any valid IANA timezone. This is a curated list." if common_only else "Showing first 100 timezones. All IANA timezones are supported."
    }


@router.get("/timezone-offset")
def get_timezone_offset(
    tz1: str = Query(..., description="First timezone"),
    tz2: str = Query(..., description="Second timezone"),
) -> Any:
    """
    Get offset information between two timezones.
    Useful for displaying timezone differences to users.
    """
    if not is_valid_timezone(tz1):
        raise HTTPException(status_code=400, detail=f"Invalid timezone: {tz1}")
    if not is_valid_timezone(tz2):
        raise HTTPException(status_code=400, detail=f"Invalid timezone: {tz2}")
    
    offset_info = availability_service.get_timezone_offset_info(tz1, tz2)
    
    return offset_info
