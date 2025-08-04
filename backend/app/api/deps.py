from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import ValidationError
from app.core.config import settings
from app.db.supabase import get_supabase, get_supabase_admin
from supabase import Client
import requests

security_bearer = HTTPBearer()

def get_db() -> Generator:
    db = get_supabase()
    try:
        yield db
    finally:
        pass

def get_admin_db() -> Generator:
    """Get admin database client that bypasses RLS for public/admin operations"""
    db = get_supabase_admin()
    print(f"DEBUG: Using admin database client with service role")
    try:
        yield db
    finally:
        pass

def get_current_user(
    db: Client = Depends(get_db), 
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer)
) -> dict:
    """
    Get current user from Supabase Auth JWT token
    """
    try:
        # Get user from Supabase Auth using the JWT token
        user_response = db.auth.get_user(credentials.credentials)
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        
        user = user_response.user
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.user_metadata.get("full_name"),
            "role": user.user_metadata.get("role", "client"),
            "email_verified": user.email_confirmed_at is not None,
            "is_active": True  # Supabase Auth users are active by default
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
