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
    pass

class ConsultantServiceUpdate(ConsultantServiceBase):
    pass

class ConsultantServiceInDB(ConsultantServiceBase):
    id: int
    consultant_id: int

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
    rcic_number: str
    location: Optional[str] = None
    timezone: Optional[str] = "America/Toronto"
    languages: Optional[List[str]] = []
    specialties: Optional[List[str]] = []
    bio: Optional[str] = None
    experience: Optional[str] = None
    success_rate: Optional[str] = None
    calendly_url: Optional[str] = None
    is_verified: bool = False
    is_available: bool = True

class ConsultantCreate(ConsultantBase):
    user_id: int

class ConsultantUpdate(ConsultantBase):
    pass

class ConsultantInDB(ConsultantBase):
    id: int
    user_id: int
    rating: float
    review_count: int
    services: List[ConsultantServiceInDB] = []
    reviews: List[ConsultantReviewInDB] = []

    class Config:
        from_attributes = True
