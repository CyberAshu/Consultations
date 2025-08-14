from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Body
from supabase import Client
from gotrue.errors import AuthApiError

from app.api import deps
from app.schemas.user import UserLogin, UserRegister, UserResponse
from app.core.config import settings
import httpx

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
                },
                # After clicking the confirmation link, send the user to a dedicated page
                "email_redirect_to": f"{settings.FRONTEND_URL}/auth/confirm"
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

@router.post("/resend-confirmation")
def resend_confirmation(
    *, db: Client = Depends(deps.get_db), email: str = Body(..., embed=True)
) -> Any:
    """
    Resend email confirmation for a user via Supabase Auth
    """
    try:
        # Prefer the SDK method when available
        if hasattr(db.auth, "resend"):
            # https://supabase.com/docs/reference/python/auth-resend
            db.auth.resend({
                "type": "signup",
                "email": email,
                "options": {
                    "email_redirect_to": f"{settings.FRONTEND_URL}/auth/confirm"
                },
            })
        else:
            # Fallback to GoTrue REST API for older supabase-py versions
            # https://supabase.com/docs/reference/auth/auth-resend
            url = f"{settings.SUPABASE_URL}/auth/v1/resend"
            headers = {
                "apikey": settings.SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "type": "signup",
                "email": email,
                # GoTrue REST expects 'redirect_to'
                "redirect_to": f"{settings.FRONTEND_URL}/auth/confirm",
            }
            response = httpx.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code >= 400:
                # Forward readable error if provided by GoTrue
                raise HTTPException(status_code=400, detail=response.text)

        return {"message": "Verification email sent if the account exists."}
    except AuthApiError as e:
        # Surface readable message to client
        error_message = str(e)
        if "over_email_send_rate_limit" in error_message:
            # Extract the time remaining from the error message
            import re
            time_match = re.search(r'(\d+)\s+seconds?', error_message)
            if time_match:
                seconds = time_match.group(1)
                error_message = f"Please wait {seconds} seconds before requesting another verification email."
            else:
                error_message = "Please wait a moment before requesting another verification email."
        elif "already been registered" in error_message.lower():
            error_message = "This email is already registered. Please check your inbox for the verification email."
        elif "invalid email" in error_message.lower():
            error_message = "Please enter a valid email address."
        
        raise HTTPException(
            status_code=400,
            detail=error_message
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not resend confirmation: {str(e)}"
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
