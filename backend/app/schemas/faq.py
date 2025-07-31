from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class FAQBase(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    order_index: int = 0
    is_active: str = 'true'


class FAQCreate(FAQBase):
    pass


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[str] = None


class FAQInDB(FAQBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
