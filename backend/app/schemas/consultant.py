from pydantic import BaseModel
from typing import List, Optional

# Consultant Service Schemas
class ConsultantServiceBase(BaseModel):
    name: str
    duration: str
    price: float
    description: Optional[str] = None
    is_active: bool = True

class ConsultantServiceCreate(ConsultantServiceBase):
    service_template_id: int  # Required for template-based creation

class ConsultantServiceUpdate(BaseModel):
    # Only allow updating price, description, and active status
    price: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ConsultantServiceInDB(ConsultantServiceBase):
    id: int
    consultant_id: int
    service_template_id: Optional[int] = None

    class Config:
        from_attributes = True

# Consultant Review Schemas
class ConsultantReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None
    outcome: Optional[str] = None

class ConsultantReviewCreate(ConsultantReviewBase):
    consultant_id: int
    client_id: int

class ConsultantReviewInDB(ConsultantReviewBase):
    id: int

    class Config:
        from_attributes = True

# Consultant Schemas
class ConsultantBase(BaseModel):
    name: str
    rcic_number: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = "America/Toronto"
    languages: Optional[List[str]] = []
    specialties: Optional[List[str]] = []
    bio: Optional[str] = None
    experience: Optional[str] = None
    success_rate: Optional[str] = None
    calendly_url: Optional[str] = None
    profile_image_url: Optional[str] = None
    is_verified: bool = False
    is_available: bool = True

class ConsultantCreate(ConsultantBase):
    user_id: str  # UUID string from Supabase

class ConsultantUpdate(BaseModel):
    # All fields optional for partial updates
    name: Optional[str] = None
    rcic_number: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    languages: Optional[List[str]] = None
    specialties: Optional[List[str]] = None
    bio: Optional[str] = None
    experience: Optional[str] = None
    success_rate: Optional[str] = None
    calendly_url: Optional[str] = None
    profile_image_url: Optional[str] = None
    is_verified: Optional[bool] = None
    is_available: Optional[bool] = None

class ConsultantInDB(ConsultantBase):
    id: int
    user_id: str  # UUID field
    rating: Optional[float] = None  # Can be null if no reviews
    review_count: Optional[int] = 0
    services: List[ConsultantServiceInDB] = []
    reviews: List[ConsultantReviewInDB] = []

    class Config:
        from_attributes = True
