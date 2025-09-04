"""
Enhanced user creation service with multiple strategies for RCIC onboarding
"""
import secrets
import string
from typing import Dict, Any, Optional
from supabase import Client
from app.core.email_service import EmailService
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class UserCreationService:
    """Enhanced service for creating RCIC users with multiple fallback strategies"""
    
    @staticmethod
    def generate_secure_password(length: int = 16) -> str:
        """Generate a secure temporary password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    @staticmethod
    def create_rcic_user(db: Client, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create RCIC user with multiple fallback strategies
        
        Returns:
        {
            "success": bool,
            "method": str,  # "direct_creation", "invite", "manual", "existing"
            "message": str,
            "temp_password": str | None,
            "user_id": str | None
        }
        """
        user_email = application_data.get('email')
        full_name = application_data.get('full_legal_name', '')
        first_name = full_name.split()[0] if full_name else 'there'
        
        logger.info(f"Creating RCIC user for {user_email}")
        
        # Strategy 1: Direct User Creation (Preferred)
        try:
            result = UserCreationService._try_direct_creation(db, application_data)
            if result["success"]:
                logger.info(f"Direct user creation successful for {user_email}")
                return result
        except Exception as e:
            logger.warning(f"Direct creation failed for {user_email}: {str(e)}")
        
        # Strategy 2: User Invitation Method
        try:
            result = UserCreationService._try_invitation_method(db, application_data)
            if result["success"]:
                logger.info(f"Invitation method successful for {user_email}")
                return result
        except Exception as e:
            logger.warning(f"Invitation method failed for {user_email}: {str(e)}")
        
        # Strategy 3: Handle Existing Users
        try:
            result = UserCreationService._try_existing_user_update(db, application_data)
            if result["success"]:
                logger.info(f"Existing user updated for {user_email}")
                return result
        except Exception as e:
            logger.warning(f"Existing user update failed for {user_email}: {str(e)}")
        
        # Strategy 4: Manual Setup Fallback
        logger.error(f"All automated methods failed for {user_email}, falling back to manual setup")
        return UserCreationService._manual_setup_fallback(application_data)
    
    @staticmethod
    def _try_direct_creation(db: Client, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Strategy 1: Direct user creation with admin privileges"""
        temp_password = UserCreationService.generate_secure_password()
        user_email = application_data.get('email')
        
        user_response = db.auth.admin.create_user({
            "email": user_email,
            "password": temp_password,
            "email_confirm": True,  # Skip email confirmation for admin-created users
            "user_metadata": {
                "name": application_data.get('full_legal_name'),
                "role": "rcic",
                "rcic_number": application_data.get('rcic_license_number'),
                "created_by": "admin",
                "application_id": application_data.get('id')
            },
            "app_metadata": {
                "role": "rcic",
                "permissions": ["consultant_access"],
                "created_method": "admin_approval"
            }
        })
        
        if user_response and user_response.user:
            # Send welcome email with credentials
            UserCreationService._send_welcome_email(
                application_data, temp_password, "direct_creation"
            )
            
            return {
                "success": True,
                "method": "direct_creation",
                "message": "User created successfully with direct admin method",
                "temp_password": temp_password,
                "user_id": user_response.user.id
            }
        
        raise Exception("User creation response was empty")
    
    @staticmethod
    def _try_invitation_method(db: Client, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Strategy 2: User invitation method"""
        user_email = application_data.get('email')
        
        # Method 2a: Simple invitation
        try:
            invite_response = db.auth.admin.invite_user_by_email(
                user_email,
                {
                    "data": {
                        "name": application_data.get('full_legal_name'),
                        "role": "rcic",
                        "application_id": application_data.get('id')
                    }
                }
            )
            
            if invite_response:
                UserCreationService._send_invite_followup_email(application_data)
                
                return {
                    "success": True,
                    "method": "invite",
                    "message": "Invitation sent successfully. User will receive setup link.",
                    "temp_password": None,
                    "user_id": None
                }
        except Exception as simple_invite_error:
            logger.warning(f"Simple invite failed: {str(simple_invite_error)}")
        
        # Method 2b: Invitation with redirect URL
        if settings.FRONTEND_URL:
            invite_response = db.auth.admin.invite_user_by_email(
                user_email,
                {
                    "redirect_to": f"{settings.FRONTEND_URL}/auth/callback",
                    "data": {
                        "name": application_data.get('full_legal_name'),
                        "role": "rcic"
                    }
                }
            )
            
            if invite_response:
                UserCreationService._send_invite_followup_email(application_data)
                
                return {
                    "success": True,
                    "method": "invite_with_redirect",
                    "message": "Invitation with redirect sent successfully",
                    "temp_password": None,
                    "user_id": None
                }
        
        raise Exception("All invitation methods failed")
    
    @staticmethod
    def _try_existing_user_update(db: Client, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Strategy 3: Handle existing users by updating their information"""
        user_email = application_data.get('email')
        
        # Try to find existing user
        users_response = db.auth.admin.list_users()
        existing_user = None
        
        if users_response and hasattr(users_response, 'users'):
            for user in users_response.users:
                if user.email == user_email:
                    existing_user = user
                    break
        
        if existing_user:
            # Generate new password for existing user
            temp_password = UserCreationService.generate_secure_password()
            
            # Update existing user
            update_response = db.auth.admin.update_user_by_id(
                existing_user.id,
                {
                    "password": temp_password,
                    "user_metadata": {
                        "name": application_data.get('full_legal_name'),
                        "role": "rcic",
                        "rcic_number": application_data.get('rcic_license_number'),
                        "updated_by": "admin_approval",
                        "application_id": application_data.get('id')
                    }
                }
            )
            
            if update_response:
                UserCreationService._send_welcome_email(
                    application_data, temp_password, "existing_user_update"
                )
                
                return {
                    "success": True,
                    "method": "existing_user_update",
                    "message": "Existing user updated successfully with new credentials",
                    "temp_password": temp_password,
                    "user_id": existing_user.id
                }
        
        raise Exception("No existing user found or update failed")
    
    @staticmethod
    def _manual_setup_fallback(application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Strategy 4: Manual setup fallback when all automated methods fail"""
        user_email = application_data.get('email')
        
        # Send manual setup instructions
        EmailService.send_email(
            subject="RCIC Platform - Account Setup Instructions",
            recipient=user_email,
            body=f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Immigration Connect</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Account Setup Required</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2d3748; margin-top: 0;">Hi {application_data.get('full_legal_name', '').split()[0] if application_data.get('full_legal_name') else 'there'},</h2>
        
        <p><strong>Congratulations!</strong> Your RCIC application has been approved.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Manual Setup Required</h3>
            <p>Due to security settings, we need you to complete your account setup manually. This is a one-time process.</p>
        </div>
        
        <h3 style="color: #2d3748;">Next Steps:</h3>
        <ol>
            <li><strong>Visit the Platform:</strong><br/>
                Go to <a href="{settings.FRONTEND_URL if settings.FRONTEND_URL else 'our platform'}" style="color: #4299e1;">{settings.FRONTEND_URL if settings.FRONTEND_URL else 'our platform'}</a>
            </li>
            <li><strong>Create Your Account:</strong><br/>
                Click "Sign Up" and register with this email: <strong>{user_email}</strong>
            </li>
            <li><strong>Contact Support:</strong><br/>
                Email us at <a href="mailto:support@immigrationconnect.com" style="color: #4299e1;">support@immigrationconnect.com</a> with:
                <ul>
                    <li>Your email address: {user_email}</li>
                    <li>Application ID: #{application_data.get('id', 'N/A')}</li>
                    <li>Subject: "RCIC Account Activation Request"</li>
                </ul>
            </li>
        </ol>
        
        <p>Our support team will activate your RCIC permissions within 24 hours of receiving your request.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #0c4a6e; margin-top: 0;">Why Manual Setup?</h3>
            <p style="margin: 0;">This ensures the highest level of security for your professional account and helps us verify your identity properly.</p>
        </div>
        
        <p>We apologize for this extra step and appreciate your understanding. We're excited to have you on the platform!</p>
        
        <p style="margin-top: 30px;">Warm regards,<br/>The Immigration Connect Team</p>
    </div>
</div>
</body>
</html>
            """
        )
        
        return {
            "success": True,
            "method": "manual_setup",
            "message": "Manual setup instructions sent. User needs to register and contact support for role activation.",
            "temp_password": None,
            "user_id": None
        }
    
    @staticmethod
    def _send_welcome_email(application_data: Dict[str, Any], temp_password: str, method: str):
        """Send welcome email with credentials"""
        user_email = application_data.get('email')
        first_name = application_data.get('full_legal_name', '').split()[0] if application_data.get('full_legal_name') else 'there'
        
        # Use the existing welcome email template from consultant_applications.py
        # This ensures consistency with the templates you've already approved
        
        EmailService.send_email(
            subject="Welcome to Immigration Connect – Your Consultant Account is Ready",
            recipient=user_email,
            body=f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Immigration Connect</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Welcome to the Platform</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2d3748; margin-top: 0;">Hi {first_name},</h2>
        
        <p>Congratulations and welcome to Immigration Connect! Your RCIC application has been successfully approved.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #0c4a6e; margin-top: 0;">Your Account Details</h3>
            <p style="margin: 10px 0;">• <strong>Login Email:</strong> {user_email}</p>
            <p style="margin: 10px 0;">• <strong>Temporary Password:</strong> {temp_password}</p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="{settings.FRONTEND_URL if settings.FRONTEND_URL else '#'}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Login to Your Portal
                </a>
            </div>
            <p style="margin: 10px 0; font-size: 14px; color: #6b7280;">Please change your password upon first login.</p>
        </div>
        
        <p>Best regards,<br/>The Immigration Connect Team</p>
    </div>
</div>
</body>
</html>
            """
        )
    
    @staticmethod
    def _send_invite_followup_email(application_data: Dict[str, Any]):
        """Send follow-up email for invitation method"""
        user_email = application_data.get('email')
        first_name = application_data.get('full_legal_name', '').split()[0] if application_data.get('full_legal_name') else 'there'
        
        EmailService.send_email(
            subject="Immigration Connect - Account Invitation Sent",
            recipient=user_email,
            body=f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Immigration Connect</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Account Invitation</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2d3748; margin-top: 0;">Hi {first_name},</h2>
        
        <p>Congratulations! Your RCIC application has been approved.</p>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Check your inbox (and spam folder) for an invitation email from our platform</li>
            <li>Click the invitation link to create your password</li>
            <li>Complete your account setup</li>
            <li>Access your RCIC dashboard</li>
        </ol>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Note:</strong> If you don't receive the invitation email within 10 minutes, please contact support at support@immigrationconnect.com</p>
        </div>
        
        <p>Best regards,<br/>The Immigration Connect Team</p>
    </div>
</div>
</body>
</html>
            """
        )
