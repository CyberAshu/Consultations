from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class ServiceBase(BaseModel):
    icon: str
    title: str
    description: str
    features: Optional[List[str]] = None
    color: Optional[str] = None
    order_index: int = 0
    is_active: str = 'true'


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    icon: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    color: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[str] = None


class ServiceInDB(ServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
