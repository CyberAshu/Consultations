from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from supabase import Client
from app.api import deps
from app.crud.crud_consultant_application import consultant_application
from app.schemas.consultant_application import (
    ConsultantApplicationCreate,
    ConsultantApplicationUpdate,
    ConsultantApplicationResponse,
    ConsultantApplicationInitialCreate
)
import json
from datetime import date, datetime
from app.utils.email_service import EmailService
from app.crud.crud_consultant import consultant
from app.crud.crud_consultant_onboarding import consultant_onboarding
from app.schemas.consultant import ConsultantCreate
from app.schemas.consultant_onboarding import ConsultantOnboardingCreate
import secrets
import string
from app.services.storage_service import storage_service
from app.core.config import settings

router = APIRouter()

@router.post("/section1", response_model=ConsultantApplicationResponse)
async def create_initial_application(
    # Section 1: Personal & Contact Information only
    full_legal_name: str = Form(...),
    preferred_display_name: Optional[str] = Form(None),
    email: str = Form(...),
    mobile_phone: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    city_province: Optional[str] = Form(None),
    time_zone: Optional[str] = Form(None),
    
    db: Client = Depends(deps.get_admin_db)
):
    """
    Create initial application with only Section 1 (Personal & Contact Information)
    """
    # Check if application already exists
    existing_application = consultant_application.get_by_email(db, email=email)
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application with this email already exists"
        )
    
    # Create application data with only Section 1
    application_data = ConsultantApplicationInitialCreate(
        full_legal_name=full_legal_name,
        preferred_display_name=preferred_display_name,
        email=email,
        mobile_phone=mobile_phone,
        date_of_birth=date_of_birth,
        city_province=city_province,
        time_zone=time_zone,
        section_1_completed=True
    )
    
    # Create the application
    result = consultant_application.create(db, obj_in=application_data)
    return result

@router.post("/", response_model=ConsultantApplicationResponse)
async def create_consultant_application(
    # Section 1: Personal & Contact Information
    full_legal_name: str = Form(...),
    preferred_display_name: Optional[str] = Form(None),
    email: str = Form(...),
    mobile_phone: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    city_province: Optional[str] = Form(None),
    time_zone: Optional[str] = Form(None),
    
    # Section 2: Licensing & Credentials
    rcic_license_number: str = Form(...),
    year_of_initial_licensing: Optional[int] = Form(None),
    cicc_membership_status: Optional[str] = Form(None),
    cicc_register_screenshot: Optional[UploadFile] = File(None),
    proof_of_good_standing: Optional[UploadFile] = File(None),
    insurance_certificate: Optional[UploadFile] = File(None),
    government_id: Optional[UploadFile] = File(None),
    
    # Section 3: Practice Details
    practice_type: str = Form(...),  # Independent/Affiliated
    business_firm_name: Optional[str] = Form(None),
    website_linkedin: Optional[str] = Form(None),
    canadian_business_registration: Optional[bool] = Form(None),
    irb_authorization: Optional[bool] = Form(None),
    taking_clients_private_practice: Optional[bool] = Form(None),
    representing_clients_ircc_irb: Optional[bool] = Form(None),
    
    # Section 4: Areas of Expertise
    areas_of_expertise: Optional[str] = Form(None),  # JSON string
    other_expertise: Optional[str] = Form(None),
    
    # Section 5: Languages Spoken
    primary_language: Optional[str] = Form(None),
    other_languages: Optional[str] = Form(None),  # JSON string
    multilingual_consultations: Optional[bool] = Form(None),
    
    # Section 6: Declarations & Agreements
    confirm_licensed_rcic: bool = Form(...),
    agree_terms_guidelines: bool = Form(...),
    agree_compliance_irpa: bool = Form(...),
    agree_no_outside_contact: bool = Form(...),
    consent_session_reviews: bool = Form(...),
    
    # Section 7: Signature & Submission
    digital_signature_name: str = Form(...),
    submission_date: str = Form(...),
    
    db: Client = Depends(deps.get_admin_db)
):
    """
    Create a new consultant application
    """
    # Check if application already exists
    existing_application = consultant_application.get_by_email(db, email=email)
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application with this email already exists"
        )
    
    existing_rcic = consultant_application.get_by_rcic_number(db, rcic_number=rcic_license_number)
    if existing_rcic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application with this RCIC license number already exists"
        )
    
    # Ensure bucket exists
    storage_service.create_bucket_if_not_exists()
    
    # Handle file uploads to Supabase Storage
    cicc_register_screenshot_url = None
    if cicc_register_screenshot:
        cicc_register_screenshot_url = await storage_service.upload_file(
            file=cicc_register_screenshot,
            folder="applications", 
            prefix=f"cicc_{email.replace('@', '_').replace('.', '_')}"
        )
    
    proof_of_good_standing_url = None
    if proof_of_good_standing:
        proof_of_good_standing_url = await storage_service.upload_file(
            file=proof_of_good_standing,
            folder="applications", 
            prefix=f"good_standing_{email.replace('@', '_').replace('.', '_')}"
        )
    
    insurance_certificate_url = None
    if insurance_certificate:
        insurance_certificate_url = await storage_service.upload_file(
            file=insurance_certificate,
            folder="applications", 
            prefix=f"insurance_{email.replace('@', '_').replace('.', '_')}"
        )
    
    government_id_url = None
    if government_id:
        government_id_url = await storage_service.upload_file(
            file=government_id,
            folder="applications", 
            prefix=f"govt_id_{email.replace('@', '_').replace('.', '_')}"
        )
    
    # Parse dates
    parsed_date_of_birth = None
    if date_of_birth:
        try:
            parsed_date_of_birth = date.fromisoformat(date_of_birth)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format for date_of_birth. Use YYYY-MM-DD"
            )
    
    parsed_submission_date = None
    if submission_date:
        try:
            from datetime import datetime
            parsed_submission_date = datetime.fromisoformat(submission_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format for submission_date. Use ISO format"
            )
    
    # Parse JSON fields
    parsed_areas_of_expertise = None
    if areas_of_expertise:
        try:
            parsed_areas_of_expertise = json.loads(areas_of_expertise)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON format for areas_of_expertise"
            )
    
    parsed_other_languages = None
    if other_languages:
        try:
            parsed_other_languages = json.loads(other_languages)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON format for other_languages"
            )
    
    application_data = ConsultantApplicationCreate(
        # Section 1: Personal & Contact Information
        full_legal_name=full_legal_name,
        preferred_display_name=preferred_display_name,
        email=email,
        mobile_phone=mobile_phone,
        date_of_birth=parsed_date_of_birth,
        city_province=city_province,
        time_zone=time_zone,
        
        # Section 2: Licensing & Credentials
        rcic_license_number=rcic_license_number,
        year_of_initial_licensing=year_of_initial_licensing,
        cicc_membership_status=cicc_membership_status,
        cicc_register_screenshot_url=cicc_register_screenshot_url,
        proof_of_good_standing_url=proof_of_good_standing_url,
        insurance_certificate_url=insurance_certificate_url,
        government_id_url=government_id_url,
        
        # Section 3: Practice Details
        practice_type=practice_type,
        business_firm_name=business_firm_name,
        website_linkedin=website_linkedin,
        canadian_business_registration=canadian_business_registration,
        irb_authorization=irb_authorization,
        taking_clients_private_practice=taking_clients_private_practice,
        representing_clients_ircc_irb=representing_clients_ircc_irb,
        
        # Section 4: Areas of Expertise
        areas_of_expertise=parsed_areas_of_expertise,
        other_expertise=other_expertise,
        
        # Section 5: Languages Spoken
        primary_language=primary_language,
        other_languages=parsed_other_languages,
        multilingual_consultations=multilingual_consultations,
        
        # Section 6: Declarations & Agreements
        confirm_licensed_rcic=confirm_licensed_rcic,
        agree_terms_guidelines=agree_terms_guidelines,
        agree_compliance_irpa=agree_compliance_irpa,
        agree_no_outside_contact=agree_no_outside_contact,
        consent_session_reviews=consent_session_reviews,
        
        # Section 7: Signature & Submission
        digital_signature_name=digital_signature_name,
        submission_date=parsed_submission_date
    )
    
    # Create application
    new_application = consultant_application.create(db=db, obj_in=application_data)

    # Send auto-response email
    EmailService.send_email(
        subject="We've Received Your Application to Join [Platform]",
        recipient=email,
        body=f"""
<html>
<body>
<p>Dear {full_legal_name},</p>
<p>Thank you for submitting your application to join [Platform] as a licensed Canadian immigration consultant. We're excited about your interest in becoming part of our growing network of RCICs, and we appreciate the time and care you've taken to complete the application.</p>
<p><strong>Application Details:</strong></p>
<ul>
<li><strong>Application ID:</strong> #{new_application.get('id', 'N/A')}</li>
<li><strong>Full Name:</strong> {full_legal_name}</li>
<li><strong>Email:</strong> {email}</li>
<li><strong>RCIC License:</strong> {rcic_license_number}</li>
<li><strong>Submission Date:</strong> {parsed_submission_date.strftime('%B %d, %Y') if parsed_submission_date else 'N/A'}</li>
<li><strong>Status:</strong> Pending Review</li>
</ul>
<p>We will review your application and get back to you within 3-5 business days.</p>
<p>Thank you for your interest in joining our platform.</p>
<p>- Platform Team</p>
</body>
</html>
        """
    )

    return new_application

@router.get("/", response_model=List[ConsultantApplicationResponse])
def get_consultant_applications(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Client = Depends(deps.get_db)
):
    """
    Get all consultant applications with optional status filter
    """
    applications = consultant_application.get_multi(
        db=db, skip=skip, limit=limit, status=status
    )
    return applications

@router.get("/stats")
def get_application_stats(db: Client = Depends(deps.get_db)):
    """
    Get application statistics
    """
    return consultant_application.get_stats(db=db)

@router.get("/{application_id}", response_model=ConsultantApplicationResponse)
def get_consultant_application(
    application_id: int,
    db: Client = Depends(deps.get_db)
):
    """
    Get a specific consultant application by ID
    """
    application = consultant_application.get(db=db, id=application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    return application

@router.put("/{application_id}", response_model=ConsultantApplicationResponse)
def update_consultant_application(
    application_id: int,
    application_update: ConsultantApplicationUpdate,
    db: Client = Depends(deps.get_db)
):
    """
    Update a consultant application
    """
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    return consultant_application.update(
        db=db, db_obj=db_application, obj_in=application_update
    )

def _send_credentials_to_consultant(db: Client, db_application: Dict[str, Any]) -> Dict[str, Any]:
    """
    Helper function to create Supabase user and send credentials to consultant
    Returns: {"success": bool, "message": str, "temp_password": str | None}
    """
    # Generate temporary password
    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    try:
        # Try to create user first, handle "already exists" error gracefully
        user_response = None
        user_email = db_application.get('email')
        
        try:
            # Try to create new user
            print(f"Attempting to create user for email: {user_email}")
            user_response = db.auth.admin.create_user({
                "email": user_email,
                "password": temp_password,
                "email_confirm": True,
                "user_metadata": {
                    "name": db_application.get('full_legal_name'),
                    "role": "rcic"
                }
            })
            print(f"Successfully created new user: {user_response.user.id if user_response and user_response.user else 'Failed'}")
            
        except Exception as create_error:
            create_error_str = str(create_error)
            print(f"Error creating user: {create_error_str}")
            # If signups are disabled or restricted, try different approaches
            if "User not allowed" in create_error_str or "Signups not allowed" in create_error_str or "signup is disabled" in create_error_str.lower():
                print(f"User creation blocked by auth policy, trying invite method...")
                
                # Try the invite method with correct API format
                try:
                    # Method 1: Try simple invite without metadata first
                    invite_resp = db.auth.admin.invite_user_by_email(user_email)
                    print(f"Successfully sent basic invite to {user_email}")
                    
                    # Send informational email since we can't include metadata in the invite
                    EmailService.send_email(
                        subject="You're invited to the RCIC Platform",
                        recipient=user_email,
                        body=f"""
<html>
<body>
<p>Dear {db_application.get('full_legal_name')},</p>
<p>Your application has been approved! We've sent you an invitation email to create your account and set your password.</p>
<p><strong>Next steps:</strong></p>
<ul>
<li>Check your inbox (and spam folder) for an email from our platform</li>
<li>Click the invitation link to set your password</li>
<li>Complete your account setup</li>
<li>Access your RCIC dashboard</li></ul>
<p><strong>Important:</strong> Your account will be set up with RCIC permissions once you complete the invitation process.</p>
<p>Best regards,<br/>
The Platform Team</p>
</body>
</html>
"""
                    )
                    
                    return {
                        "success": True,
                        "message": "Invitation email sent successfully. User will receive invite link to set password.",
                        "temp_password": None
                    }
                    
                except Exception as invite_error:
                    invite_error_str = str(invite_error)
                    print(f"Failed to send invite: {invite_error_str}")
                    
                    # Method 2: Try with redirect URL if simple invite fails
                    try:
                        from app.core.config import settings
                        redirect_url = f"{settings.FRONTEND_URL}/auth/callback" if settings.FRONTEND_URL else None
                        
                        if redirect_url:
                            invite_resp = db.auth.admin.invite_user_by_email(
                                user_email,
                                {"redirect_to": redirect_url}
                            )
                            print(f"Successfully sent invite with redirect to {user_email}")
                            
                            EmailService.send_email(
                                subject="RCIC Platform Invitation",
                                recipient=user_email,
                                body=f"""
<html>
<body>
<p>Dear {db_application.get('full_legal_name')},</p>
<p>Welcome to the RCIC Platform! Your application has been approved.</p>
<p>Please check your email for an invitation link to complete your account setup.</p>
<p>Best regards,<br/>The Platform Team</p>
</body>
</html>
"""
                            )
                            
                            return {
                                "success": True,
                                "message": "Invitation sent with redirect URL",
                                "temp_password": None
                            }
                    except Exception as redirect_error:
                        print(f"Redirect invite also failed: {str(redirect_error)}")
                    
                    # Method 3: Manual fallback - send email with instructions
                    print("All invite methods failed, falling back to manual email notification")
                    EmailService.send_email(
                        subject="RCIC Platform - Manual Account Setup Required",
                        recipient=user_email,
                        body=f"""
<html>
<body>
<p>Dear {db_application.get('full_legal_name')},</p>
<p>Your RCIC application has been approved! However, we encountered a technical issue with the automatic account creation.</p>
<p><strong>Next Steps:</strong></p>
<ol>
<li>Visit our platform at: {settings.FRONTEND_URL if settings.FRONTEND_URL else '[Platform URL]'}</li>
<li>Click "Sign Up" and register with this email: {user_email}</li>
<li>Once registered, contact our support team to activate your RCIC permissions</li>
</ol>
<p>We apologize for this inconvenience and will have your account set up shortly.</p>
<p>Best regards,<br/>The Platform Team</p>
</body>
</html>
"""
                    )
                    
                    return {
                        "success": True,
                        "message": "Manual setup instructions sent. User needs to register manually and contact support for RCIC role assignment.",
                        "temp_password": "[Manual setup required]"
                    }
            
            if "already been registered" in create_error_str or "User already registered" in create_error_str:
                print("User already exists, attempting to find and update existing user")
                
                # User exists, try to list users and find by email, then update
                try:
                    # List all users (we'll filter by email)
                    users_response = db.auth.admin.list_users()
                    existing_user = None
                    
                    if users_response and hasattr(users_response, 'users'):
                        # Find user by email
                        for user in users_response.users:
                            if user.email == user_email:
                                existing_user = user
                                break
                    
                    if existing_user:
                        print(f"Found existing user: {existing_user.id}")
                        # Update existing user's password
                        user_response = db.auth.admin.update_user_by_id(
                            existing_user.id,
                            {
                                "password": temp_password,
                                "user_metadata": {
                                    "name": db_application.get('full_legal_name'),
                                    "role": "rcic"
                                }
                            }
                        )
                        print(f"Successfully updated existing user password")
                    else:
                        print("Could not find existing user in user list")
                        # For development: simulate successful operation
                        # In production, this should be handled differently
                        if db_application.get('email').endswith('@gmail.com'):  # Development check
                            print("Development mode: simulating credential reset for existing user")
                            # Don't create fake UUIDs that will cause database errors
                            # Just send the email and return success
                            email_sent = EmailService.send_email(
                                subject="Your RCIC Platform Login Credentials",
                                recipient=db_application.get('email'),
                                body=f"""
<html>
<body>
<p>Dear {db_application.get('full_legal_name')},</p>
<p>We received a request to send your login credentials. Since your account already exists, please use the password reset feature on the login page if you've forgotten your password.</p>
<p><strong>Your Email:</strong> {db_application.get('email')}</p>
<p>If you need assistance, please contact our support team.</p>
<p>Best regards,<br/>
- Platform Team</p>
</body>
</html>
                                """
                            )
                            
                            if email_sent:
                                return {
                                    "success": True, 
                                    "message": "Password reset instructions sent to existing user",
                                    "temp_password": "[Use password reset link]"
                                }
                            else:
                                return {
                                    "success": False, 
                                    "message": "Could not send password reset instructions",
                                    "temp_password": None
                                }
                        else:
                            raise Exception("User exists but cannot be found or updated")
                            
                except Exception as lookup_error:
                    print(f"Failed to find existing user: {str(lookup_error)}")
                    raise Exception(f"User exists but cannot be found or updated: {str(lookup_error)}")
            else:
                # Different error, re-raise
                raise create_error
        
        if user_response.user:
            # Check if consultant record already exists
            existing_consultant_by_user = consultant.get_by_user_id(db, user_response.user.id)
            existing_consultant_by_rcic = consultant.get_by_rcic_number(db, db_application.get('rcic_license_number'))
            
            new_consultant = None
            if existing_consultant_by_user or existing_consultant_by_rcic:
                # Use existing consultant record
                new_consultant = existing_consultant_by_user or existing_consultant_by_rcic
                print(f"Using existing consultant record: {new_consultant.get('id')}")
            else:
                # Create new consultant record
                consultant_data = ConsultantCreate(
                    user_id=user_response.user.id,
                    name=db_application.get('full_legal_name'),
                    rcic_number=db_application.get('rcic_license_number'),
                    location=db_application.get('city_province'),
                    timezone=db_application.get('time_zone', 'America/Toronto'),
                    languages=db_application.get('other_languages', []),
                    specialties=db_application.get('areas_of_expertise', []),
                    bio=db_application.get('other_expertise', ''),
                    is_verified=True,
                    is_available=False  # Will be set to true after onboarding
                )
                
                new_consultant = consultant.create(db=db, obj_in=consultant_data)
            
            # Create or update onboarding record if it doesn't exist
            existing_onboarding = consultant_onboarding.get_by_application_id(db, db_application.get('id'))
            if not existing_onboarding:
                onboarding_data = ConsultantOnboardingCreate(
                    consultant_id=new_consultant.get('id'),
                    application_id=db_application.get('id'),
                    time_zone=db_application.get('time_zone', 'America/Toronto')
                )
                consultant_onboarding.create(db=db, obj_in=onboarding_data)
            
            # Send credentials email
            email_sent = EmailService.send_email(
                subject="Your RCIC Platform Login Credentials",
                recipient=db_application.get('email'),
                body=f"""
<html>
<body>
<p>Dear {db_application.get('full_legal_name')},</p>
<p>Here are your login credentials for the RCIC Platform:</p>
<p><strong>Login Details:</strong><br/>
Email: {db_application.get('email')}<br/>
Temporary Password: {temp_password}<br/></p>
<p>Please log in and complete your profile setup to start accepting client bookings.</p>
<p><strong>Important:</strong> Please change your password after logging in for the first time.</p>
<p>Best regards,<br/>
- Platform Team</p>
</body>
</html>
                """
            )
            
            if email_sent:
                return {
                    "success": True, 
                    "message": "Credentials sent successfully",
                    "temp_password": temp_password
                }
            else:
                return {
                    "success": False, 
                    "message": "User created but email sending failed",
                    "temp_password": temp_password
                }
        else:
            return {
                "success": False,
                "message": "Failed to create user account",
                "temp_password": None
            }
        
    except Exception as e:
        print(f"Error in _send_credentials_to_consultant: {str(e)}")
        return {
            "success": False,
            "message": f"Error creating user or sending credentials: {str(e)}",
            "temp_password": None
        }

@router.post("/{application_id}/approve", response_model=ConsultantApplicationResponse)
def approve_consultant_application(
    application_id: int,
    db: Client = Depends(deps.get_admin_db)
):
    """
    Approve a consultant application
    """
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    # Update application status to approved
    updated_application = consultant_application.approve(db=db, db_obj=db_application)

    # Send credentials to consultant
    credential_result = _send_credentials_to_consultant(db, db_application)
    
    if not credential_result["success"]:
        print(f"Warning: Approval succeeded but credential sending failed: {credential_result['message']}")
        # Send a basic approval email without credentials
        EmailService.send_email(
            subject="Your Application has been Approved!",
            recipient=db_application.get('email'),
            body=f"""
<html>
<body>
<p>Dear {db_application.get('full_legal_name')},</p>
<p>Congratulations! Your application has been approved. We'll be in touch shortly with your login credentials.</p>
<p>Welcome aboard!</p>
<p>- Platform Team</p>
</body>
</html>
            """
        )

    return updated_application

@router.post("/{application_id}/send-credentials")
def send_credentials_to_consultant(
    application_id: int,
    db: Client = Depends(deps.get_admin_db),
    current_admin: dict = Depends(deps.get_current_admin_user)
):
    """
    Manually send login credentials to consultant (Admin only)
    """
    # Check if application exists
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    # Send credentials to consultant
    credential_result = _send_credentials_to_consultant(db, db_application)
    
    if credential_result["success"]:
        return {
            "success": True,
            "message": credential_result["message"],
            "email": db_application.get('email'),
            "full_name": db_application.get('full_legal_name')
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=credential_result["message"]
        )

@router.post("/{application_id}/reject", response_model=ConsultantApplicationResponse)
def reject_consultant_application(
    application_id: int,
    db: Client = Depends(deps.get_admin_db)
):
    """
    Reject a consultant application
    """
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    return consultant_application.reject(db=db, db_obj=db_application)

@router.delete("/{application_id}")
def delete_consultant_application(
    application_id: int,
    db: Client = Depends(deps.get_db)
):
    """
    Delete a consultant application
    """
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    consultant_application.delete(db=db, id=application_id)
    return {"message": "Application deleted successfully"}

@router.post("/{application_id}/additional-documents")
async def upload_additional_document(
    application_id: int,
    file: UploadFile = File(...),
    db: Client = Depends(deps.get_admin_db),
    current_admin: dict = Depends(deps.get_current_admin_user)
):
    """
    Upload additional documents for an application (Admin only)
    """
    # Check if application exists
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    # Validate file type
    allowed_types = ['pdf', 'docx', 'jpg', 'jpeg', 'png']
    if not file.filename or not any(file.filename.lower().endswith(f'.{ext}') for ext in allowed_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed types: PDF, DOCX, JPG, JPEG, PNG"
        )
    
    try:
        # Ensure bucket exists
        storage_service.create_bucket_if_not_exists()
        
        # Upload file
        file_path = await storage_service.upload_file(
            file=file,
            folder="additional_documents",
            prefix=f"app_{application_id}_{db_application.get('email', '').replace('@', '_').replace('.', '_')}"
        )
        
        # Create document record
        document_record = {
            "filename": file_path.split('/')[-1],
            "original_name": file.filename,
            "file_path": file_path,
            "uploader_email": current_admin.get('email', 'admin'),
            "timestamp": datetime.now().isoformat()
        }
        
        # Get existing additional documents or initialize empty list
        existing_docs = db_application.get('additional_documents', []) or []
        existing_docs.append(document_record)
        
        # Update application with new document
        update_data = ConsultantApplicationUpdate(
            additional_documents=existing_docs
        )
        
        updated_application = consultant_application.update(
            db=db, db_obj=db_application, obj_in=update_data
        )
        
        return {
            "message": "Document uploaded successfully",
            "document": document_record,
            "application_id": application_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

@router.put("/{application_id}/admin-notes")
def update_admin_notes(
    application_id: int,
    admin_notes: str = Form(...),
    db: Client = Depends(deps.get_admin_db),
    current_admin: dict = Depends(deps.get_current_admin_user)
):
    """
    Add a new admin note with timestamp for an application (Admin only)
    """
    # Check if application exists
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    # Get existing notes or initialize empty list
    existing_notes = db_application.get('admin_notes', []) or []
    
    # Create new note with timestamp
    new_note = {
        'text': admin_notes,
        'timestamp': datetime.now().isoformat(),
        'author': current_admin.get('email', 'admin')
    }
    
    # Append new note to existing notes
    updated_notes = existing_notes + [new_note]
    
    # Update admin notes
    update_data = ConsultantApplicationUpdate(
        admin_notes=updated_notes,
        reviewed_by=current_admin.get('email', 'admin'),
        reviewed_at=datetime.now()
    )
    
    updated_application = consultant_application.update(
        db=db, db_obj=db_application, obj_in=update_data
    )
    
    return updated_application

@router.delete("/{application_id}/additional-documents/{document_filename}")
def delete_additional_document(
    application_id: int,
    document_filename: str,
    db: Client = Depends(deps.get_admin_db),
    current_admin: dict = Depends(deps.get_current_admin_user)
):
    """
    Delete an additional document from an application (Admin only)
    """
    # Check if application exists
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    # Get existing additional documents
    existing_docs = db_application.get('additional_documents', []) or []
    
    # Find and remove the document
    updated_docs = [doc for doc in existing_docs if doc.get('filename') != document_filename]
    
    if len(updated_docs) == len(existing_docs):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete from storage
    document_to_delete = next((doc for doc in existing_docs if doc.get('filename') == document_filename), None)
    if document_to_delete and document_to_delete.get('file_path'):
        storage_service.delete_file(document_to_delete['file_path'])
    
    # Update application
    update_data = ConsultantApplicationUpdate(
        additional_documents=updated_docs
    )
    
    updated_application = consultant_application.update(
        db=db, db_obj=db_application, obj_in=update_data
    )
    
    return {"message": "Document deleted successfully"}

@router.put("/{application_id}/request-sections")
def request_additional_sections(
    application_id: int,
    sections: List[int] = Form(...),
    db: Client = Depends(deps.get_admin_db),
    current_admin: dict = Depends(deps.get_current_admin_user)
):
    """
    Request additional sections from applicant (Admin only)
    """
    # Check if application exists
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    # Update application with requested sections
    update_data = ConsultantApplicationUpdate(
        sections_requested=sections,
        sections_requested_at=datetime.now(),
        sections_requested_by=current_admin.get('email', 'admin')
    )
    
    updated_application = consultant_application.update(
        db=db, db_obj=db_application, obj_in=update_data
    )
    
    # Send email to applicant with link to complete additional sections
    try:
        email_service = EmailService()
        applicant_email = db_application.get('email')
        applicant_name = db_application.get('full_legal_name', 'Applicant')
        
        # Create the completion link
        completion_url = f"{settings.FRONTEND_URL}/become-partner?email={applicant_email}&application_id={application_id}"
        
        subject = "Complete Your Partner Application - Additional Information Required"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">ImmigrationConnect</h1>
                    <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Partner Application Update</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #2d3748; margin-top: 0;">Hello {applicant_name},</h2>
                    
                    <p>Great news! We've reviewed your initial partner application and would like you to complete the remaining sections of your application.</p>
                    
                    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4299e1;">
                        <h3 style="margin-top: 0; color: #2d3748;">Next Steps:</h3>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Click the button below to access your application</li>
                            <li>Complete the remaining sections (Licensing, Practice Details, Expertise, etc.)</li>
                            <li>Upload required documents</li>
                            <li>Review and submit your complete application</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{completion_url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Complete Your Application
                        </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px;">
                        <strong>Note:</strong> This link is unique to your application. Please do not share it with others.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
                    
                    <p style="color: #718096; font-size: 14px; margin-bottom: 0;">
                        If you have any questions or need assistance, please contact our support team.
                    </p>
                    
                    <p style="color: #718096; font-size: 14px; margin-top: 10px;">
                        Best regards,<br>
                        The ImmigrationConnect Team
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        email_sent = email_service.send_email(subject, applicant_email, body)
        
        if not email_sent:
            print(f"Warning: Failed to send email to {applicant_email}")
            
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        # Don't fail the request if email fails
    
    return updated_application

@router.put("/{application_id}/complete-sections")
async def complete_additional_sections(
    application_id: int,
    # Section 2: Licensing & Credentials
    rcic_license_number: Optional[str] = Form(None),
    year_of_initial_licensing: Optional[int] = Form(None),
    cicc_membership_status: Optional[str] = Form(None),
    cicc_register_screenshot: Optional[UploadFile] = File(None),
    proof_of_good_standing: Optional[UploadFile] = File(None),
    insurance_certificate: Optional[UploadFile] = File(None),
    government_id: Optional[UploadFile] = File(None),
    
    # Section 3: Practice Details
    practice_type: Optional[str] = Form(None),
    business_firm_name: Optional[str] = Form(None),
    website_linkedin: Optional[str] = Form(None),
    canadian_business_registration: Optional[bool] = Form(None),
    irb_authorization: Optional[bool] = Form(None),
    taking_clients_private_practice: Optional[bool] = Form(None),
    representing_clients_ircc_irb: Optional[bool] = Form(None),
    
    # Section 4: Areas of Expertise
    areas_of_expertise: Optional[str] = Form(None),
    other_expertise: Optional[str] = Form(None),
    
    # Section 5: Languages Spoken
    primary_language: Optional[str] = Form(None),
    other_languages: Optional[str] = Form(None),
    multilingual_consultations: Optional[bool] = Form(None),
    
    # Section 6: Declarations & Agreements
    confirm_licensed_rcic: Optional[bool] = Form(None),
    agree_terms_guidelines: Optional[bool] = Form(None),
    agree_compliance_irpa: Optional[bool] = Form(None),
    agree_no_outside_contact: Optional[bool] = Form(None),
    consent_session_reviews: Optional[bool] = Form(None),
    
    # Section 7: Signature & Submission
    digital_signature_name: Optional[str] = Form(None),
    
    db: Client = Depends(deps.get_admin_db)
):
    """
    Complete additional sections for an existing application
    """
    # Check if application exists
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    # Ensure bucket exists
    storage_service.create_bucket_if_not_exists()
    
    # Handle file uploads
    update_data = {}
    
    if rcic_license_number:
        update_data["rcic_license_number"] = rcic_license_number
        update_data["section_2_completed"] = True
    
    if year_of_initial_licensing:
        update_data["year_of_initial_licensing"] = year_of_initial_licensing
    
    if cicc_membership_status:
        update_data["cicc_membership_status"] = cicc_membership_status
    
    # Handle file uploads for Section 2
    if cicc_register_screenshot:
        cicc_register_screenshot_url = await storage_service.upload_file(
            file=cicc_register_screenshot,
            folder="applications", 
            prefix=f"cicc_{db_application['email'].replace('@', '_').replace('.', '_')}"
        )
        update_data["cicc_register_screenshot_url"] = cicc_register_screenshot_url
    
    if proof_of_good_standing:
        proof_of_good_standing_url = await storage_service.upload_file(
            file=proof_of_good_standing,
            folder="applications", 
            prefix=f"good_standing_{db_application['email'].replace('@', '_').replace('.', '_')}"
        )
        update_data["proof_of_good_standing_url"] = proof_of_good_standing_url
    
    if insurance_certificate:
        insurance_certificate_url = await storage_service.upload_file(
            file=insurance_certificate,
            folder="applications", 
            prefix=f"insurance_{db_application['email'].replace('@', '_').replace('.', '_')}"
        )
        update_data["insurance_certificate_url"] = insurance_certificate_url
    
    if government_id:
        government_id_url = await storage_service.upload_file(
            file=government_id,
            folder="applications", 
            prefix=f"gov_id_{db_application['email'].replace('@', '_').replace('.', '_')}"
        )
        update_data["government_id_url"] = government_id_url
    
    # Section 3: Practice Details
    if practice_type:
        update_data["practice_type"] = practice_type
    
    if business_firm_name:
        update_data["business_firm_name"] = business_firm_name
    
    if website_linkedin:
        update_data["website_linkedin"] = website_linkedin
    
    if canadian_business_registration is not None:
        update_data["canadian_business_registration"] = canadian_business_registration
    
    if irb_authorization is not None:
        update_data["irb_authorization"] = irb_authorization
    
    if taking_clients_private_practice is not None:
        update_data["taking_clients_private_practice"] = taking_clients_private_practice
    
    if representing_clients_ircc_irb is not None:
        update_data["representing_clients_ircc_irb"] = representing_clients_ircc_irb
    
    # Section 4: Areas of Expertise
    if areas_of_expertise:
        update_data["areas_of_expertise"] = json.loads(areas_of_expertise) if isinstance(areas_of_expertise, str) else areas_of_expertise
    
    if other_expertise:
        update_data["other_expertise"] = other_expertise
    
    # Section 5: Languages
    if primary_language:
        update_data["primary_language"] = primary_language
    
    if other_languages:
        update_data["other_languages"] = json.loads(other_languages) if isinstance(other_languages, str) else other_languages
    
    if multilingual_consultations is not None:
        update_data["multilingual_consultations"] = multilingual_consultations
    
    # Section 6: Declarations
    if confirm_licensed_rcic is not None:
        update_data["confirm_licensed_rcic"] = confirm_licensed_rcic
    
    if agree_terms_guidelines is not None:
        update_data["agree_terms_guidelines"] = agree_terms_guidelines
    
    if agree_compliance_irpa is not None:
        update_data["agree_compliance_irpa"] = agree_compliance_irpa
    
    if agree_no_outside_contact is not None:
        update_data["agree_no_outside_contact"] = agree_no_outside_contact
    
    if consent_session_reviews is not None:
        update_data["consent_session_reviews"] = consent_session_reviews
    
    # Section 7: Signature
    if digital_signature_name:
        update_data["digital_signature_name"] = digital_signature_name
    
    # Update application
    print(f"DEBUG: Updating application {application_id} with data: {update_data}")
    
    # Force mark all sections as completed if we have data for them
    if rcic_license_number:
        update_data["section_2_completed"] = True
    if practice_type:
        update_data["section_3_completed"] = True
    if areas_of_expertise:
        update_data["section_4_completed"] = True
    if primary_language:
        update_data["section_5_completed"] = True
    if confirm_licensed_rcic is not None:
        update_data["section_6_completed"] = True
    if digital_signature_name:
        update_data["section_7_completed"] = True
    
    print(f"DEBUG: Final update data with section flags: {update_data}")
    
    update_obj = ConsultantApplicationUpdate(**update_data)
    updated_application = consultant_application.update(
        db=db, db_obj=db_application, obj_in=update_obj
    )
    
    print(f"DEBUG: Updated application sections: {updated_application.get('section_1_completed')}, {updated_application.get('section_2_completed')}, {updated_application.get('section_3_completed')}, {updated_application.get('section_4_completed')}, {updated_application.get('section_5_completed')}, {updated_application.get('section_6_completed')}, {updated_application.get('section_7_completed')}")
    
    return updated_application

@router.get("/documents/{file_path:path}")
def get_document(file_path: str):
    """
    Get signed URL for document access from Supabase Storage
    """
    try:
        signed_url = storage_service.get_file_url(file_path)
        return {"url": signed_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
