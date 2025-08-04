from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "client"
    email_verified: bool = False
    is_active: bool = True
    created_at: Optional[str] = None
    last_sign_in: Optional[str] = None
    consultant_profile: Optional[dict] = None

# New schemas for Supabase Auth
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "client"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "client"
    email_verified: bool = False

class SessionInfo(BaseModel):
    access_token: str
    refresh_token: str
    expires_at: int

class UserResponse(BaseModel):
    user: UserInfo
    session: Optional[SessionInfo] = None
