from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class TestimonialBase(BaseModel):
    quote: str
    author: str
    role: str
    rating: float = 5.0
    flag: Optional[str] = None
    outcome: Optional[str] = None
    is_active: str = 'true'


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    quote: Optional[str] = None
    author: Optional[str] = None
    role: Optional[str] = None
    rating: Optional[float] = None
    flag: Optional[str] = None
    outcome: Optional[str] = None
    is_active: Optional[str] = None


class TestimonialInDB(TestimonialBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
