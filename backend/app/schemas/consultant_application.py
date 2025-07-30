from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class ConsultantApplicationBase(BaseModel):
    full_legal_name: str
    preferred_display_name: Optional[str] = None
    email: EmailStr
    mobile_phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    city_province: Optional[str] = None
    time_zone: Optional[str] = None
    rcic_license_number: str
    year_of_initial_licensing: Optional[int] = None
    cicc_membership_status: Optional[str] = None
    cicc_register_screenshot_url: Optional[str] = None
    status: str = "pending"

class ConsultantApplicationCreate(ConsultantApplicationBase):
    pass

class ConsultantApplicationUpdate(BaseModel):
    status: Optional[str] = None
    preferred_display_name: Optional[str] = None
    mobile_phone: Optional[str] = None
    city_province: Optional[str] = None
    time_zone: Optional[str] = None
    year_of_initial_licensing: Optional[int] = None
    cicc_membership_status: Optional[str] = None
    cicc_register_screenshot_url: Optional[str] = None

class ConsultantApplicationInDB(ConsultantApplicationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConsultantApplicationResponse(ConsultantApplicationInDB):
    pass
