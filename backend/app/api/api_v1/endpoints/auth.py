from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from gotrue.errors import AuthApiError

from app.api import deps
from app.schemas.user import UserLogin, UserRegister, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    *, db: Client = Depends(deps.get_db), user_in: UserRegister
) -> Any:
    """
    Register a new user using Supabase Auth
    """
    try:
        # Register user with Supabase Auth
        auth_response = db.auth.sign_up({
            "email": user_in.email,
            "password": user_in.password,
            "options": {
                "data": {
                    "full_name": user_in.full_name,
                    "role": user_in.role
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=400,
                detail="Registration failed"
            )
        
        return {
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": auth_response.user.user_metadata.get("full_name"),
                "role": auth_response.user.user_metadata.get("role", "client"),
                "email_verified": auth_response.user.email_confirmed_at is not None
            },
            "session": {
                "access_token": auth_response.session.access_token if auth_response.session else None,
                "refresh_token": auth_response.session.refresh_token if auth_response.session else None,
                "expires_at": auth_response.session.expires_at if auth_response.session else None
            } if auth_response.session else None
        }
        
    except AuthApiError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=UserResponse)
def login(
    *, db: Client = Depends(deps.get_db), user_in: UserLogin
) -> Any:
    """
    Login user using Supabase Auth
    """
    try:
        # Login user with Supabase Auth
        auth_response = db.auth.sign_in_with_password({
            "email": user_in.email,
            "password": user_in.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=400,
                detail="Invalid credentials"
            )
        
        return {
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": auth_response.user.user_metadata.get("full_name"),
                "role": auth_response.user.user_metadata.get("role", "client"),
                "email_verified": auth_response.user.email_confirmed_at is not None
            },
            "session": {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "expires_at": auth_response.session.expires_at
            }
        }
        
    except AuthApiError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/logout")
def logout(
    *, db: Client = Depends(deps.get_db), current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """
    Logout user using Supabase Auth
    """
    try:
        db.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Logout failed: {str(e)}"
        )

@router.post("/refresh")
def refresh_token(
    *, db: Client = Depends(deps.get_db), refresh_token: str
) -> Any:
    """
    Refresh access token using Supabase Auth
    """
    try:
        auth_response = db.auth.refresh_session(refresh_token)
        
        if not auth_response.session:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )
        
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "expires_at": auth_response.session.expires_at
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token refresh failed: {str(e)}"
        )

@router.post("/reset-password")
def reset_password(
    *, db: Client = Depends(deps.get_db), email: str
) -> Any:
    """
    Send password reset email using Supabase Auth
    """
    try:
        db.auth.reset_password_email(email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Password reset failed: {str(e)}"
        )

@router.get("/me", response_model=dict)
def get_current_user_info(
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """
    Get current user information
    """
    return current_user
