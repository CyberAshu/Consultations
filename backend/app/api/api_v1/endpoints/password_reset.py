from fastapi import APIRouter, Depends, HTTPException, status, Form
from supabase import Client
from app.api import deps
from app.core.config import settings
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()

class PasswordResetRequest(BaseModel):
    email: EmailStr

@router.post("/request-reset")
def request_password_reset(
    email: EmailStr = Form(...),
    db: Client = Depends(deps.get_db)  # Use regular db, not admin
):
    """
    Request a password reset link using Supabase's built-in functionality
    """
    try:
        # Use Supabase's built-in password reset
        # This will send an email directly from Supabase
        reset_response = db.auth.reset_password_email(
            email,
            {
                "redirect_to": f"{settings.FRONTEND_URL}/reset-password"
            }
        )
        
        # Supabase handles the email sending automatically
        return {
            "success": True,
            "message": "If an account with this email exists, you will receive a password reset link shortly."
        }
            
    except Exception as e:
        print(f"Error in password reset request: {str(e)}")
        # Don't reveal whether user exists or not for security
        return {
            "success": True,
            "message": "If an account with this email exists, you will receive a password reset link shortly."
        }

@router.post("/update-password")
def update_password(
    new_password: str = Form(...),
    db: Client = Depends(deps.get_db)
):
    """
    Update user password (called from authenticated frontend after reset)
    """
    try:
        # This endpoint expects the user to be authenticated via Supabase session
        # The frontend will handle the authentication part using Supabase SDK
        response = db.auth.update_user({
            "password": new_password
        })
        
        if response:
            return {
                "success": True,
                "message": "Password has been successfully updated"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
            
    except Exception as e:
        print(f"Error updating password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update password: {str(e)}"
        )

@router.post("/confirm-reset")
def confirm_password_reset(
    new_password: str = Form(...),
    access_token: str = Form(...),
    refresh_token: str = Form(...)
    # NOTE: admin_db dependency removed
):
    """
    Confirm password reset using tokens from email link.
    This function authenticates the user with the tokens and then updates their password.
    """
    try:
        # Create a temporary Supabase client to handle the user's session
        from supabase import create_client
        temp_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        
        # Set the user's session using the tokens from the password reset link
        session_response = temp_client.auth.set_session(access_token, refresh_token)
        
        if not session_response or not session_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired reset token. Please request a new one."
            )
        
        # Now that the user is authenticated in this client, update their password.
        # This action is performed as the user, not as an admin.
        update_response = temp_client.auth.update_user({
            "password": new_password
        })
        
        if update_response and update_response.user:
            # Sign out to invalidate the reset token immediately
            temp_client.auth.sign_out()
            return {
                "success": True,
                "message": "Password has been successfully updated."
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password. The session might have been invalid."
            )
            
    except HTTPException:
        # Re-raise known exceptions
        raise
    except Exception as e:
        # Log the unexpected error for debugging
        print(f"Unexpected error in confirm_password_reset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while resetting the password."
        )
