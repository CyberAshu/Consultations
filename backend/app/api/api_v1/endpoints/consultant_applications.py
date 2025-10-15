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
    rcic_license_number: str = Form(...),
    
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
    
    # Check if RCIC number already exists
    existing_rcic = consultant_application.get_by_rcic_number(db, rcic_number=rcic_license_number)
    if existing_rcic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application with this RCIC license number already exists"
        )
    
    # Parse date if provided
    parsed_date_of_birth = None
    if date_of_birth:
        try:
            from datetime import date
            parsed_date_of_birth = date.fromisoformat(date_of_birth)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format for date_of_birth. Use YYYY-MM-DD"
            )
    
    # Create application data with only Section 1
    application_data = ConsultantApplicationInitialCreate(
        full_legal_name=full_legal_name,
        preferred_display_name=preferred_display_name,
        email=email,
        mobile_phone=mobile_phone,
        date_of_birth=parsed_date_of_birth,
        city_province=city_province,
        time_zone=time_zone,
        rcic_license_number=rcic_license_number,
        section_1_completed=True
    )
    
    # Create the application
    result = consultant_application.create(db, obj_in=application_data)

    # Send EMAIL 1: Thank You for initial interest (after Section 1)
    try:
        first_name = full_legal_name.split()[0] if full_legal_name else "there"
        EmailService.send_email(
            subject="Thank You for Your Interest in Joining ImmigWise",
            recipient=email,
            body=f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">ImmigWise</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Thank You for Your Interest</p>
    </div>

    <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2d3748; margin-top: 0;">Hi {first_name},</h2>

Thank you for submitting your interest in becoming a Registered Consultant with ImmigWise. We're excited to learn more about you.

        <p>Our team is currently reviewing your information to confirm your RCIC status. Once verified, you will receive another email requesting the remaining details to proceed with your onboarding.</p>

        <p>We’re committed to building a high-trust platform where consultants like you are respected, compensated fairly, and supported through technology.</p>

<p>If you have any questions in the meantime, feel free to contact us at <a href="mailto:info@immigwise.com">info@immigwise.com</a> or visit our Help Center.</p>

<p style="margin-top: 30px;">Warm regards,<br/>ImmigWise Team</p>

        <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">

        <p style="color: #718096; font-size: 14px; text-align: center;">
            <a href="{settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') and settings.FRONTEND_URL else '#'}" style="color: #3b82f6; text-decoration: none;">Website</a> |
            <a href="#" style="color: #3b82f6; text-decoration: none;">Help Center</a> |
            <a href="#" style="color: #3b82f6; text-decoration: none;">LinkedIn</a> |
            <a href="#" style="color: #3b82f6; text-decoration: none;">Instagram</a>
        </p>
    </div>
</div>
</body>
</html>
            """,
            reply_to="info@immigwise.com"
        )
    except Exception as e:
        print(f"Error sending initial thank-you email: {str(e)}")

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

    # Note: Initial thank-you email is sent by the Section 1 endpoint.

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
    Create Supabase user and send password reset link instead of temp password.
    This provides a more secure and user-friendly onboarding experience.
    Returns: {"success": bool, "message": str}
    """
    from app.core.config import settings
    from app.utils.email_service import EmailService
    
    user_email = db_application.get('email')
    user_name = db_application.get('full_legal_name')
    first_name = user_name.split()[0] if user_name else 'there'
    
    try:
        print(f"Creating user account for: {user_email}")
        
        # Create user with admin privileges - NO PASSWORD needed!
        # User will set password via reset link
        user_response = None
        
        try:
            user_response = db.auth.admin.create_user({
                "email": user_email,
                "email_confirm": True,  # Auto-confirm email
                "user_metadata": {
                    "name": user_name,
                    "role": "rcic",
                    "rcic_number": db_application.get('rcic_license_number'),
                    "created_by": "admin_approval",
                    "application_id": db_application.get('id')
                },
                "app_metadata": {
                    "role": "rcic",
                    "permissions": ["consultant_access"],
                    "created_method": "admin_approval"
                }
            })
            
            if not user_response or not user_response.user:
                raise Exception("User creation failed - no user returned")
                
            print(f"✅ User created successfully: {user_response.user.id}")
            
        except Exception as create_error:
            error_msg = str(create_error)
            print(f"❌ User creation error: {error_msg}")
            
            # Handle "user already exists" error
            if "already been registered" in error_msg.lower() or "user already registered" in error_msg.lower():
                print(f"User already exists, sending password reset link...")
                
                try:
                    # Send password reset for existing user (Supabase will handle the email)
                    db.auth.reset_password_email(
                        user_email,
                        {"redirect_to": f"{settings.FRONTEND_URL}/reset-password"}
                    )
                    print(f"✅ Password reset email sent to existing user: {user_email}")
                    
                    return {
                        "success": True,
                        "message": "Password reset link sent to existing user"
                    }
                    
                except Exception as reset_error:
                    print(f"⚠️ Failed to send reset link: {str(reset_error)}")
                    return {
                        "success": False,
                        "message": f"User exists but failed to send reset link: {str(reset_error)}"
                    }
            
            # Other errors - return failure
            return {
                "success": False,
                "message": f"Failed to create user: {error_msg}"
            }
        
        # If user creation was successful, create consultant record
        if user_response and user_response.user:
            user_id = user_response.user.id
            print(f"Creating consultant record for user: {user_id}")
            
            # Check if consultant record already exists
            existing_consultant = consultant.get_by_user_id(db, user_id)
            if not existing_consultant:
                existing_consultant = consultant.get_by_rcic_number(db, db_application.get('rcic_license_number'))
            
            new_consultant = None
            if existing_consultant:
                new_consultant = existing_consultant
                print(f"Using existing consultant record: {new_consultant.get('id')}")
            else:
                # Create new consultant record
                consultant_data = ConsultantCreate(
                    user_id=user_id,
                    name=user_name,
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
                print(f"✅ Consultant record created: {new_consultant.get('id')}")
            
            # Create onboarding record if it doesn't exist
            existing_onboarding = consultant_onboarding.get_by_application_id(db, db_application.get('id'))
            if not existing_onboarding:
                onboarding_data = ConsultantOnboardingCreate(
                    consultant_id=new_consultant.get('id'),
                    application_id=db_application.get('id'),
                    time_zone=db_application.get('time_zone', 'America/Toronto')
                )
                consultant_onboarding.create(db=db, obj_in=onboarding_data)
                print("✅ Onboarding record created")
            
            # Send password reset link via Supabase (ONLY email needed)
            try:
                db.auth.reset_password_email(
                    user_email,
                    {"redirect_to": f"{settings.FRONTEND_URL}/reset-password"}
                )
                print(f"✅ Password reset email sent to {user_email} by Supabase")
                
                return {
                    "success": True,
                    "message": "User created and password reset email sent successfully"
                }
            except Exception as reset_error:
                print(f"⚠️ Supabase password reset email failed: {str(reset_error)}")
                return {
                    "success": True,  # User still created
                    "message": "User created but password reset email may have failed. User can request reset from login page."
                }
        
        # If we reach here without user_response, something went wrong
        return {
            "success": False,
            "message": "Failed to create user account"
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error in _send_credentials_to_consultant: {error_msg}")
        return {
            "success": False,
            "message": f"Error creating user: {error_msg}"
        }

@router.post("/{application_id}/approve", response_model=ConsultantApplicationResponse)
def approve_consultant_application(
    application_id: int,
    db: Client = Depends(deps.get_admin_db)
):
    """
    Approve a consultant application and send password reset link
    """
    db_application = consultant_application.get(db=db, id=application_id)
    if not db_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant application not found"
        )
    
    # Update application status to approved
    updated_application = consultant_application.approve(db=db, db_obj=db_application)

    # Create user and send password reset link
    credential_result = _send_credentials_to_consultant(db, db_application)
    
    if not credential_result["success"]:
        print(f"⚠️ Warning: Approval succeeded but user creation failed: {credential_result['message']}")
        # Send basic approval email as fallback
        EmailService.send_email(
            subject="Your Application has been Approved!",
            recipient=db_application.get('email'),
            body=f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Hi {db_application.get('full_legal_name', '').split()[0] if db_application.get('full_legal_name') else 'there'},</h2>
    <p>🎉 Congratulations! Your RCIC application has been <strong>approved</strong>.</p>
    <p>We're currently setting up your account. You'll receive login instructions via email shortly.</p>
    <p>If you don't receive the email within 24 hours, please contact us at 
       <a href="mailto:info@immigwise.com" style="color: #4299e1;">info@immigwise.com</a></p>
    <p>Welcome aboard!<br/><strong>The ImmigWise Team</strong></p>
</div>
</body>
</html>
            """
        )
    else:
        print(f"✅ User creation successful: {credential_result['message']}")

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
        
        subject = "Your RCIC Profile Has Been Verified – Next Steps"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">ImmigWise</h1>
                    <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">RCIC Profile Verified</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #2d3748; margin-top: 0;">Hi {applicant_name.split()[0] if applicant_name else 'there'},</h2>
                    
                    <p>Thank you for your interest in ImmigWise. We're pleased to inform you that your RCIC status has been successfully verified.</p>
                    
                    <p>To proceed, we kindly ask you to complete the full application by providing additional information through our secure portal.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{completion_url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Complete Your Application Now
                        </a>
                    </div>
                    
                    <p>This form includes multiple sections and should take approximately 10–15 minutes to complete. Once submitted, our compliance team will review the details within 24 to 48 business hours.</p>
                    
<p>Should you have any questions, feel free to contact us at info@immigwise.com.</p>
                    
                    <p style="margin-top: 30px;">Sincerely,<br/>ImmigWise Team</p>
                    
                    <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
                    
                    <p style="color: #718096; font-size: 14px; text-align: center;">
                        <a href="{settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') and settings.FRONTEND_URL else '#'}" style="color: #4299e1; text-decoration: none;">Website</a> | 
                        <a href="#" style="color: #4299e1; text-decoration: none;">Help Center</a> | 
                        <a href="#" style="color: #4299e1; text-decoration: none;">LinkedIn</a> | 
                        <a href="#" style="color: #4299e1; text-decoration: none;">Instagram</a>
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
    
    # Send EMAIL 3: Thank You + Review Notice after complete application submission
    if digital_signature_name:  # This indicates the final submission
        try:
            applicant_email = db_application.get('email')
            applicant_name = db_application.get('full_legal_name', 'Applicant')
            
            EmailService.send_email(
                subject="Thank You – Your Application is Now Under Review",
                recipient=applicant_email,
                body=f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">ImmigWise</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Application Under Review</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
        <h2 style="color: #2d3748; margin-top: 0;">Hi {applicant_name.split()[0] if applicant_name else 'there'},</h2>
        
        <p>Thank you for completing your full application to join ImmigWise. We've received your information and it is now under review by our compliance team.</p>
        
        <p>We aim to complete the review within 24 to 48 business hours. If any additional documentation is required, our team will reach out to you directly.</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4299e1;">
            <p style="margin: 0; font-weight: bold;">Application ID:</p>
            <p style="margin: 5px 0 0 0; color: #4299e1;">#{application_id}</p>
        </div>
        
<p>In the meantime, if you have any questions, please don't hesitate to contact us at info@immigwise.com.</p>
        
        <p style="margin-top: 30px;">Warm regards,<br/>ImmigWise Team</p>
        
        <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
        
        <p style="color: #718096; font-size: 14px; text-align: center;">
            <a href="{settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') and settings.FRONTEND_URL else '#'}" style="color: #4299e1; text-decoration: none;">Website</a> | 
            <a href="#" style="color: #4299e1; text-decoration: none;">Help Center</a> | 
            <a href="#" style="color: #4299e1; text-decoration: none;">LinkedIn</a> | 
            <a href="#" style="color: #4299e1; text-decoration: none;">Instagram</a>
        </p>
    </div>
</div>
</body>
</html>
                """
            )
        except Exception as e:
            print(f"Error sending review confirmation email: {str(e)}")
    
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
