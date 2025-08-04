from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class ConsultantOnboarding(Base):
    __tablename__ = "consultant_onboarding"

    id = Column(Integer, primary_key=True, index=True)
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("consultant_applications.id"), nullable=False)
    
    # Step 1: Availability & Booking Preferences
    preferred_session_durations = Column(JSON)  # Array: [30, 45, 60, "File Review"]
    available_days = Column(JSON)  # Array: ["Monday", "Tuesday", ...]
    available_time_slots = Column(String)  # Time range text
    time_zone = Column(String)
    sync_google_calendar = Column(Boolean, default=False)
    
    # Step 2: Pricing (per service type)
    price_30_min = Column(Float)
    price_45_min = Column(Float)
    price_60_min = Column(Float)
    price_file_review = Column(Float)
    price_file_review_summary = Column(Float)
    price_follow_up = Column(Float)
    
    # Optional Add-ons
    add_ons = Column(JSON)  # Array of add-ons
    
    # Step 3: Public Profile Setup
    profile_photo_url = Column(String)
    short_bio = Column(Text)  # 100-300 words
    years_experience = Column(Integer)
    education_background = Column(String)
    countries_served = Column(JSON)  # Array of countries
    top_case_types = Column(JSON)  # Array of top 3 case types
    display_profile_publicly = Column(Boolean, default=True)
    
    # Optional Additions
    intake_preferences = Column(Text)
    auto_request_documents = Column(Boolean, default=False)
    allow_direct_follow_up = Column(Boolean, default=True)
    follow_up_time_limit = Column(Integer, default=14)  # days
    
    # Status tracking
    onboarding_completed = Column(Boolean, default=False)
    current_step = Column(Integer, default=1)  # Track which step user is on
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
