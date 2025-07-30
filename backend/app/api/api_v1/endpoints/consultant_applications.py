from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.supabase import get_db
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
    full_legal_name: str = Form(...),
    email: str = Form(...),
    rcic_license_number: str = Form(...),
    preferred_display_name: Optional[str] = Form(None),
    mobile_phone: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    city_province: Optional[str] = Form(None),
    time_zone: Optional[str] = Form(None),
    year_of_initial_licensing: Optional[int] = Form(None),
    cicc_membership_status: Optional[str] = Form(None),
    cicc_register_screenshot: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
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
    
    # Handle file upload (for now we'll just store the filename)
    # In a real implementation, you'd upload to cloud storage
    cicc_register_screenshot_url = None
    if cicc_register_screenshot:
        # TODO: Implement file upload to cloud storage
        cicc_register_screenshot_url = cicc_register_screenshot.filename
    
    # Parse date if provided
    parsed_date_of_birth = None
    if date_of_birth:
        try:
            parsed_date_of_birth = date.fromisoformat(date_of_birth)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format for date_of_birth. Use YYYY-MM-DD"
            )
    
    application_data = ConsultantApplicationCreate(
        full_legal_name=full_legal_name,
        preferred_display_name=preferred_display_name,
        email=email,
        mobile_phone=mobile_phone,
        date_of_birth=parsed_date_of_birth,
        city_province=city_province,
        time_zone=time_zone,
        rcic_license_number=rcic_license_number,
        year_of_initial_licensing=year_of_initial_licensing,
        cicc_membership_status=cicc_membership_status,
        cicc_register_screenshot_url=cicc_register_screenshot_url
    )
    
    return consultant_application.create(db=db, obj_in=application_data)

@router.get("/", response_model=List[ConsultantApplicationResponse])
def get_consultant_applications(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all consultant applications with optional status filter
    """
    applications = consultant_application.get_multi(
        db=db, skip=skip, limit=limit, status=status
    )
    return applications

@router.get("/stats")
def get_application_stats(db: Session = Depends(get_db)):
    """
    Get application statistics
    """
    return consultant_application.get_stats(db=db)

@router.get("/{application_id}", response_model=ConsultantApplicationResponse)
def get_consultant_application(
    application_id: int,
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
