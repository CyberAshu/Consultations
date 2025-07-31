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
from datetime import date

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
    
    db: Client = Depends(deps.get_db)
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
    
    # Handle file uploads (for now we'll just store the filename)
    # In a real implementation, you'd upload to cloud storage
    cicc_register_screenshot_url = None
    if cicc_register_screenshot:
        cicc_register_screenshot_url = cicc_register_screenshot.filename
    
    proof_of_good_standing_url = None
    if proof_of_good_standing:
        proof_of_good_standing_url = proof_of_good_standing.filename
    
    insurance_certificate_url = None
    if insurance_certificate:
        insurance_certificate_url = insurance_certificate.filename
    
    government_id_url = None
    if government_id:
        government_id_url = government_id.filename
    
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
    
    return consultant_application.create(db=db, obj_in=application_data)

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
    db: Client = Depends(deps.get_db)
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
    
    return consultant_application.approve(db=db, db_obj=db_application)

@router.post("/{application_id}/reject", response_model=ConsultantApplicationResponse)
def reject_consultant_application(
    application_id: int,
    db: Client = Depends(deps.get_db)
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
