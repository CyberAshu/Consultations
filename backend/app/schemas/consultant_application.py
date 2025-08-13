from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import date, datetime

class ConsultantApplicationBase(BaseModel):
    # Section 1: Personal & Contact Information
    full_legal_name: str
    preferred_display_name: Optional[str] = None
    email: EmailStr
    mobile_phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    city_province: Optional[str] = None
    time_zone: Optional[str] = None
    
    # Section 2: Licensing & Credentials
    rcic_license_number: str
    year_of_initial_licensing: Optional[int] = None
    cicc_membership_status: Optional[str] = None  # Active/Inactive/Suspended/Under Review
    cicc_register_screenshot_url: Optional[str] = None
    proof_of_good_standing_url: Optional[str] = None
    insurance_certificate_url: Optional[str] = None
    government_id_url: Optional[str] = None
    
    # Section 3: Practice Details
    practice_type: Optional[str] = None  # Independent/Affiliated
    business_firm_name: Optional[str] = None
    website_linkedin: Optional[str] = None
    canadian_business_registration: Optional[bool] = None
    irb_authorization: Optional[bool] = None
    taking_clients_private_practice: Optional[bool] = None
    representing_clients_ircc_irb: Optional[bool] = None
    
    # Section 4: Areas of Expertise
    areas_of_expertise: Optional[List[str]] = None
    other_expertise: Optional[str] = None
    
    # Section 5: Languages Spoken
    primary_language: Optional[str] = None
    other_languages: Optional[List[str]] = None
    multilingual_consultations: Optional[bool] = None
    
    # Section 6: Declarations & Agreements
    confirm_licensed_rcic: bool
    agree_terms_guidelines: bool
    agree_compliance_irpa: bool
    agree_no_outside_contact: bool
    consent_session_reviews: bool
    
    # Section 7: Signature & Submission
    digital_signature_name: str
    submission_date: datetime
    
    status: str = "pending"

class ConsultantApplicationCreate(ConsultantApplicationBase):
    pass

class ConsultantApplicationUpdate(BaseModel):
    # Admin fields
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    additional_documents: Optional[List[dict]] = None  # [{'filename': str, 'original_name': str, 'file_path': str, 'uploaded_by': str, 'uploaded_at': str}]
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    
    # Allow updating other fields if needed
    preferred_display_name: Optional[str] = None
    mobile_phone: Optional[str] = None
    city_province: Optional[str] = None
    time_zone: Optional[str] = None
    year_of_initial_licensing: Optional[int] = None
    cicc_membership_status: Optional[str] = None
    cicc_register_screenshot_url: Optional[str] = None
    proof_of_good_standing_url: Optional[str] = None
    insurance_certificate_url: Optional[str] = None
    government_id_url: Optional[str] = None

class ConsultantApplicationInDB(ConsultantApplicationBase):
    id: int
    # Admin fields
    admin_notes: Optional[str] = None
    additional_documents: Optional[List[dict]] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConsultantApplicationResponse(ConsultantApplicationInDB):
    pass
