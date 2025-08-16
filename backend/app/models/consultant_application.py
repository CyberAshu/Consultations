from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, JSON, Text
from sqlalchemy.sql import func
from app.db.base import Base

class ConsultantApplication(Base):
    __tablename__ = "consultant_applications"

    id = Column(Integer, primary_key=True, index=True)
    
    # Section 1: Personal & Contact Information
    full_legal_name = Column(String, nullable=False)
    preferred_display_name = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    mobile_phone = Column(String)
    date_of_birth = Column(Date)
    city_province = Column(String)
    time_zone = Column(String)
    
    # Section 2: Licensing & Credentials
    # Allow NULL during initial submission; keep unique to prevent duplicates once provided
    rcic_license_number = Column(String, unique=True, nullable=True)
    year_of_initial_licensing = Column(Integer)
    cicc_membership_status = Column(String)  # Active/Inactive/Suspended/Under Review
    cicc_register_screenshot_url = Column(String)  # Upload: Screenshot or PDF of CICC Public Register Page
    proof_of_good_standing_url = Column(String)    # Upload: Proof of Good Standing
    insurance_certificate_url = Column(String)     # Upload: E&O Insurance Certificate
    government_id_url = Column(String)             # Upload: Government-issued Photo ID
    
    # Section 3: Practice Details
    practice_type = Column(String)  # Independent/Affiliated
    business_firm_name = Column(String)
    website_linkedin = Column(String)
    canadian_business_registration = Column(Boolean)  # Yes/No
    irb_authorization = Column(Boolean)  # L3-RCIC authorization
    taking_clients_private_practice = Column(Boolean)
    representing_clients_ircc_irb = Column(Boolean)
    
    # Section 4: Areas of Expertise (JSON array)
    areas_of_expertise = Column(JSON)  # Array of expertise areas
    other_expertise = Column(Text)     # Other expertise text field
    
    # Section 5: Languages Spoken
    primary_language = Column(String)
    other_languages = Column(JSON)     # Array of other languages
    multilingual_consultations = Column(Boolean)  # Comfortable in multiple languages
    
    # Section 6: Declarations & Agreements
    confirm_licensed_rcic = Column(Boolean, nullable=False)
    agree_terms_guidelines = Column(Boolean, nullable=False)
    agree_compliance_irpa = Column(Boolean, nullable=False)
    agree_no_outside_contact = Column(Boolean, nullable=False)
    consent_session_reviews = Column(Boolean, nullable=False)
    
    # Section 7: Signature & Submission
    digital_signature_name = Column(String, nullable=False)
    submission_date = Column(DateTime(timezone=True), nullable=False)
    
    # Admin fields
    status = Column(String, default="pending")  # pending, approved, rejected
    admin_notes = Column(JSON)  # Timestamped admin notes [{'text': str, 'timestamp': str, 'author': str}]
    additional_documents = Column(JSON)  # Admin uploaded additional documents [{'filename': str, 'original_name': str, 'file_path': str, 'uploaded_by': str, 'uploaded_at': str}]
    reviewed_by = Column(String)  # Admin who reviewed
    reviewed_at = Column(DateTime(timezone=True))
    
    # New fields for section completion tracking
    section_1_completed = Column(Boolean, default=False)  # Personal & Contact Information
    section_2_completed = Column(Boolean, default=False)  # Licensing & Credentials
    section_3_completed = Column(Boolean, default=False)  # Practice Details
    section_4_completed = Column(Boolean, default=False)  # Areas of Expertise
    section_5_completed = Column(Boolean, default=False)  # Languages
    section_6_completed = Column(Boolean, default=False)  # Declarations & Agreements
    section_7_completed = Column(Boolean, default=False)  # Signature & Submission
    
    # Admin action fields
    sections_requested = Column(JSON)  # Array of section numbers requested by admin
    sections_requested_at = Column(DateTime(timezone=True))
    sections_requested_by = Column(String)  # Admin who requested sections
    

    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

