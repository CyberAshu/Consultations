from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator
from app.models.intake import (
    IntakeStatus, Location, ClientRole, MaritalStatus, 
    EducationLevel, ECAStatus, ECAProvider, LanguageTestType, 
    TEERLevel, JobOfferStatus, LMIAStatus, CanadianStatus,
    ProofOfFundsRange, UrgencyLevel
)

# Stage-specific request schemas
class Stage1Data(BaseModel):
    location: Optional[Location] = None
    client_role: Optional[ClientRole] = None

class Stage2Data(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    preferred_language_other: Optional[str] = None
    timezone: Optional[str] = None
    consent_acknowledgement: Optional[List[str]] = None

class Stage3Data(BaseModel):
    marital_status: Optional[MaritalStatus] = None
    has_dependants: Optional[bool] = None
    dependants_count: Optional[int] = None
    dependants_accompanying: Optional[str] = None

class Stage4Data(BaseModel):
    highest_education: Optional[EducationLevel] = None
    eca_status: Optional[ECAStatus] = None
    eca_provider: Optional[ECAProvider] = None
    eca_result: Optional[str] = None

class Stage5Data(BaseModel):
    language_test_taken: Optional[str] = None
    test_type: Optional[LanguageTestType] = None
    test_date: Optional[datetime] = None
    language_scores: Optional[Dict[str, float]] = None

class Stage6Data(BaseModel):
    years_experience: Optional[int] = None
    noc_codes: Optional[List[str]] = None
    teer_level: Optional[TEERLevel] = None
    regulated_occupation: Optional[str] = None
    work_country: Optional[List[str]] = None

class Stage7Data(BaseModel):
    job_offer_status: Optional[JobOfferStatus] = None
    employer_name: Optional[str] = None
    job_location: Optional[Dict[str, str]] = None
    wage_offer: Optional[float] = None
    lmia_status: Optional[LMIAStatus] = None

class Stage8Data(BaseModel):
    current_status: Optional[CanadianStatus] = None
    status_expiry: Optional[datetime] = None
    province_residing: Optional[str] = None

class Stage9Data(BaseModel):
    proof_of_funds: Optional[ProofOfFundsRange] = None
    family_ties: Optional[bool] = None
    relationship_type: Optional[str] = None

class Stage10Data(BaseModel):
    prior_applications: Optional[bool] = None
    application_outcomes: Optional[List[str]] = None
    inadmissibility_flags: Optional[List[str]] = None

class Stage11Data(BaseModel):
    program_interest: Optional[List[str]] = None
    province_interest: Optional[List[str]] = None

class Stage12Data(BaseModel):
    urgency: Optional[UrgencyLevel] = None
    target_arrival: Optional[datetime] = None
    docs_ready: Optional[List[str]] = None

# Unified intake update schema
class IntakeUpdateRequest(BaseModel):
    stage: int
    data: Dict[str, Any]
    
    @validator('stage')
    def validate_stage(cls, v):
        if not 1 <= v <= 12:
            raise ValueError('Stage must be between 1 and 12')
        return v

class IntakeCompleteStageRequest(BaseModel):
    stage: int
    
    @validator('stage')
    def validate_stage(cls, v):
        if not 1 <= v <= 12:
            raise ValueError('Stage must be between 1 and 12')
        return v

# Response schemas
class IntakeDocumentResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    stage: Optional[int] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class IntakeResponse(BaseModel):
    id: int
    client_id: str
    status: IntakeStatus
    current_stage: int
    completed_stages: Optional[List[int]] = None
    
    # Stage data
    location: Optional[Location] = None
    client_role: Optional[ClientRole] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    preferred_language_other: Optional[str] = None
    timezone: Optional[str] = None
    consent_acknowledgement: Optional[List[str]] = None
    
    marital_status: Optional[MaritalStatus] = None
    has_dependants: Optional[bool] = None
    dependants_count: Optional[int] = None
    dependants_accompanying: Optional[str] = None
    
    highest_education: Optional[EducationLevel] = None
    eca_status: Optional[ECAStatus] = None
    eca_provider: Optional[ECAProvider] = None
    eca_result: Optional[str] = None
    
    language_test_taken: Optional[str] = None
    test_type: Optional[LanguageTestType] = None
    test_date: Optional[datetime] = None
    language_scores: Optional[Dict[str, float]] = None
    
    years_experience: Optional[int] = None
    noc_codes: Optional[List[str]] = None
    teer_level: Optional[TEERLevel] = None
    regulated_occupation: Optional[str] = None
    work_country: Optional[List[str]] = None
    
    job_offer_status: Optional[JobOfferStatus] = None
    employer_name: Optional[str] = None
    job_location: Optional[Dict[str, str]] = None
    wage_offer: Optional[float] = None
    lmia_status: Optional[LMIAStatus] = None
    
    current_status: Optional[CanadianStatus] = None
    status_expiry: Optional[datetime] = None
    province_residing: Optional[str] = None
    
    proof_of_funds: Optional[ProofOfFundsRange] = None
    family_ties: Optional[bool] = None
    relationship_type: Optional[str] = None
    
    prior_applications: Optional[bool] = None
    application_outcomes: Optional[List[str]] = None
    inadmissibility_flags: Optional[List[str]] = None
    
    program_interest: Optional[List[str]] = None
    province_interest: Optional[List[str]] = None
    
    urgency: Optional[UrgencyLevel] = None
    target_arrival: Optional[datetime] = None
    docs_ready: Optional[List[str]] = None
    
    # Metadata
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Relationships
    documents: Optional[List[IntakeDocumentResponse]] = None

    class Config:
        from_attributes = True

# Create intake request (usually done automatically on signup)
class IntakeCreateRequest(BaseModel):
    client_id: str
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

# Summary response for quick checks
class IntakeSummaryResponse(BaseModel):
    id: int
    client_id: str
    status: IntakeStatus
    current_stage: int
    completed_stages: Optional[List[int]] = None
    completion_percentage: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True