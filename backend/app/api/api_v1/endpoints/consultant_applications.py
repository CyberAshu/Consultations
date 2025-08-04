from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from supabase import Client
from app.api import deps
from app.crud.crud_consultant_application import consultant_application
from app.schemas.consultant_application import (
    ConsultantApplicationCreate,
    ConsultantApplicationUpdate,
    ConsultantApplicationResponse
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

router = APIRouter()

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

    # Generate temporary password
    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    try:
        # Create Supabase user
        user_response = db.auth.admin.create_user({
            "email": db_application.get('email'),
            "password": temp_password,
            "email_confirm": True,
            "user_metadata": {
                "name": db_application.get('full_legal_name'),
                "role": "rcic"
            }
        })
        
        if user_response.user:
            # Check if consultant already exists by user_id or rcic_number
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
            
            # Create onboarding record
            onboarding_data = ConsultantOnboardingCreate(
                consultant_id=new_consultant.get('id'),
                application_id=db_application.get('id'),
                time_zone=db_application.get('time_zone', 'America/Toronto')
            )
            
            consultant_onboarding.create(db=db, obj_in=onboarding_data)
            
            # Send approval email with login credentials
            EmailService.send_email(
                subject="Your Application has been Approved! - Login Credentials",
                recipient=db_application.get('email'),
                body=f"""
<html>
<body>
<p>Dear {db_application.get('full_legal_name')},</p>
<p>Congratulations! Your application has been approved. You can now log into your consultant dashboard to complete the onboarding process.</p>
<p><strong>Login Details:</strong><br/>
Email: {db_application.get('email')}<br/>
Temporary Password: {temp_password}<br/></p>
<p>Please log in and complete your profile setup to start accepting client bookings.</p>
<p>Welcome aboard!<br/>
- Platform Team</p>
</body>
</html>
                """
            )
        
    except Exception as e:
        print(f"Error creating user or consultant: {e}")
        # Still return the approved application even if user creation fails
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
