from typing import Optional
from pydantic import BaseModel, validator
from datetime import datetime


class ServiceTemplateBase(BaseModel):
    name: str
    default_description: str
    min_price: float
    max_price: float
    default_duration: str
    order_index: int = 0
    is_active: bool = True

    @validator('max_price')
    def validate_price_range(cls, v, values):
        if 'min_price' in values and v <= values['min_price']:
            raise ValueError('max_price must be greater than min_price')
        return v


class ServiceTemplateCreate(ServiceTemplateBase):
    pass


class ServiceTemplateUpdate(BaseModel):
    name: Optional[str] = None
    default_description: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    default_duration: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

    @validator('max_price')
    def validate_price_range(cls, v, values):
        if v is not None and 'min_price' in values and values['min_price'] is not None and v <= values['min_price']:
            raise ValueError('max_price must be greater than min_price')
        return v


class ServiceTemplateInDB(ServiceTemplateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ServiceTemplateResponse(ServiceTemplateInDB):
    pass
