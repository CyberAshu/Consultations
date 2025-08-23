from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

# Consultant Service Pricing Schemas (New duration-based pricing)
class ConsultantServicePricingBase(BaseModel):
    consultant_service_id: int
    duration_option_id: int
    price: float
    is_active: bool = True


class ConsultantServicePricingCreate(ConsultantServicePricingBase):
    pass


class ConsultantServicePricingUpdate(BaseModel):
    price: Optional[float] = None
    is_active: Optional[bool] = None


class ConsultantServicePricingInDB(ConsultantServicePricingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Enhanced service schema with duration options and pricing
class ConsultantServiceWithPricing(BaseModel):
    id: int
    consultant_id: int
    service_template_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    is_active: bool = True
    pricing_options: List["ConsultantServicePricingWithDuration"] = []

    class Config:
        from_attributes = True


class ConsultantServicePricingWithDuration(BaseModel):
    id: int
    price: float
    is_active: bool
    duration_option: "ServiceDurationOptionResponse"

    class Config:
        from_attributes = True


# Service Duration Option Response (imported from service_template schemas)
class ServiceDurationOptionResponse(BaseModel):
    id: int
    duration_minutes: int
    duration_label: str
    min_price: float
    max_price: float
    is_active: bool
    order_index: int

    class Config:
        from_attributes = True


# Legacy Consultant Service Schemas (for backward compatibility)
class ConsultantServiceBase(BaseModel):
    name: str
    duration: int # Duration in minutes (legacy)
    price: float # Legacy single price
    description: Optional[str] = None
    is_active: bool = True
    
    @validator('duration')
    def validate_duration(cls, v):
        if v < 15:
            raise ValueError('Duration cannot be less than 15 minutes')
        return v


class ConsultantServiceCreate(ConsultantServiceBase):
    service_template_id: int  # Required for template-based creation


class ConsultantServiceUpdate(BaseModel):
    # Only allow updating price, description, and active status
    duration: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ConsultantServiceInDB(ConsultantServiceBase):
    id: int
    consultant_id: int
    service_template_id: Optional[int] = None
    pricing_options: List[ConsultantServicePricingInDB] = []

    class Config:
        from_attributes = True


# Bulk pricing update schema for RCIC panel
class BulkPricingUpdate(BaseModel):
    consultant_service_id: int
    pricing_options: List[ConsultantServicePricingCreate]

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


# Update forward references
ConsultantServiceWithPricing.model_rebuild()
ConsultantServicePricingWithDuration.model_rebuild()
