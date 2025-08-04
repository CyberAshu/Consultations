from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class ConsultantOnboardingBase(BaseModel):
    # Step 1: Availability & Booking Preferences
    preferred_session_durations: Optional[List[str]] = None
    available_days: Optional[List[str]] = None
    available_time_slots: Optional[str] = None
    time_zone: Optional[str] = None
    sync_google_calendar: Optional[bool] = False
    
    # Step 2: Pricing (per service type)
    price_30_min: Optional[float] = None
    price_45_min: Optional[float] = None
    price_60_min: Optional[float] = None
    price_file_review: Optional[float] = None
    price_file_review_summary: Optional[float] = None
    price_follow_up: Optional[float] = None
    
    # Optional Add-ons
    add_ons: Optional[List[str]] = None
    
    # Step 3: Public Profile Setup
    profile_photo_url: Optional[str] = None
    short_bio: Optional[str] = None
    years_experience: Optional[int] = None
    education_background: Optional[str] = None
    countries_served: Optional[List[str]] = None
    top_case_types: Optional[List[str]] = None
    display_profile_publicly: Optional[bool] = True
    
    # Optional Additions
    intake_preferences: Optional[str] = None
    auto_request_documents: Optional[bool] = False
    allow_direct_follow_up: Optional[bool] = True
    follow_up_time_limit: Optional[int] = 14

class ConsultantOnboardingCreate(ConsultantOnboardingBase):
    consultant_id: int
    application_id: int

class ConsultantOnboardingUpdate(BaseModel):
    # Step 1: Availability & Booking Preferences
    preferred_session_durations: Optional[List[str]] = None
    available_days: Optional[List[str]] = None
    available_time_slots: Optional[str] = None
    time_zone: Optional[str] = None
    sync_google_calendar: Optional[bool] = None
    
    # Step 2: Pricing (per service type)
    price_30_min: Optional[float] = None
    price_45_min: Optional[float] = None
    price_60_min: Optional[float] = None
    price_file_review: Optional[float] = None
    price_file_review_summary: Optional[float] = None
    price_follow_up: Optional[float] = None
    
    # Optional Add-ons
    add_ons: Optional[List[str]] = None
    
    # Step 3: Public Profile Setup
    profile_photo_url: Optional[str] = None
    short_bio: Optional[str] = None
    years_experience: Optional[int] = None
    education_background: Optional[str] = None
    countries_served: Optional[List[str]] = None
    top_case_types: Optional[List[str]] = None
    display_profile_publicly: Optional[bool] = None
    
    # Optional Additions
    intake_preferences: Optional[str] = None
    auto_request_documents: Optional[bool] = None
    allow_direct_follow_up: Optional[bool] = None
    follow_up_time_limit: Optional[int] = None
    
    # Status tracking
    current_step: Optional[int] = None
    onboarding_completed: Optional[bool] = None

class ConsultantOnboardingInDB(ConsultantOnboardingBase):
    id: int
    consultant_id: int
    application_id: int
    onboarding_completed: bool
    current_step: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConsultantOnboardingResponse(ConsultantOnboardingInDB):
    pass
