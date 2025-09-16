from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from supabase import Client

from app.api import deps
from app.crud import crud_intake
from app.schemas.intake import (
    IntakeResponse, IntakeUpdateRequest, IntakeCompleteStageRequest,
    IntakeSummaryResponse, IntakeCreateRequest
)
from app.models.user import UserRole
from app.services.storage_service import storage_service
from app.utils.intake_validation import (
    validate_intake_stage_data, validate_file_upload, rate_limiter
)

router = APIRouter()

@router.get("/me", response_model=IntakeResponse)
def get_my_intake(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get current user's intake data
    """
    # Only clients should have intake data
    if current_user.get("role") in ["rcic", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RCICs and admins don't have intake data"
        )
    
    intake = crud_intake.intake.get_by_client_id(db, current_user["id"])
    if not intake:
        # Auto-create intake if it doesn't exist
        intake = crud_intake.intake.create_for_user(
            db, 
            current_user["id"], 
            current_user.get("full_name"), 
            current_user.get("email")
        )
    
    return intake

@router.get("/me/summary", response_model=IntakeSummaryResponse)
def get_my_intake_summary(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get intake summary for current user
    """
    if current_user.get("role") in ["rcic", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RCICs and admins don't have intake data"
        )
    
    summary = crud_intake.intake.get_summary(db, current_user["id"])
    if not summary:
        # Auto-create intake if it doesn't exist
        intake = crud_intake.intake.create_for_user(
            db, 
            current_user["id"], 
            current_user.get("full_name"), 
            current_user.get("email")
        )
        summary = crud_intake.intake.get_summary(db, current_user["id"])
    
    return summary

@router.post("/me/update", response_model=IntakeResponse)
def update_my_intake(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    intake_data: IntakeUpdateRequest
) -> Any:
    """
    Update intake data for current user
    """
    if current_user.get("role") in ["rcic", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RCICs and admins don't have intake data"
        )
    
    # Rate limiting check
    client_id = current_user["id"]
    if rate_limiter.is_rate_limited(client_id, max_requests=20, time_window=300):  # 20 requests per 5 minutes
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please wait before trying again."
        )
    
    # Comprehensive validation
    try:
        validated_data = validate_intake_stage_data(intake_data.stage, intake_data.data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    
    intake = crud_intake.intake.update_stage_data(
        db, 
        current_user["id"], 
        intake_data.stage, 
        validated_data  # Use validated data instead of raw data
    )
    
    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )
    
    return intake

@router.post("/me/complete-stage", response_model=IntakeResponse)
def complete_intake_stage(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    stage_data: IntakeCompleteStageRequest
) -> Any:
    """
    Mark a stage as completed for current user
    """
    if current_user.get("role") in ["rcic", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RCICs and admins don't have intake data"
        )
    
    # Get intake to validate completion requirements
    intake = crud_intake.intake.get_by_client_id(db, current_user["id"])
    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )
    
    # Validate stage completion
    validation_result = crud_intake.intake.validate_stage_completion(intake, stage_data.stage)
    if not validation_result["valid"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Stage {stage_data.stage} cannot be completed. Missing fields: {validation_result['missing_fields']}"
        )
    
    updated_intake = crud_intake.intake.complete_stage(
        db, 
        current_user["id"], 
        stage_data.stage
    )
    
    return updated_intake

@router.post("/me/upload-document")
def upload_intake_document(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    file: UploadFile = File(...),
    stage: int = Form(...)
) -> Any:
    """
    Upload document for intake
    """
    if current_user.get("role") in ["rcic", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RCICs and admins don't have intake data"
        )
    
    # Validate stage
    if not 1 <= stage <= 12:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Stage must be between 1 and 12"
        )
    
    # Get intake
    intake = crud_intake.intake.get_by_client_id(db, current_user["id"])
    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )
    
    # Rate limiting for file uploads
    if rate_limiter.is_rate_limited(current_user["id"], max_requests=5, time_window=300):  # 5 uploads per 5 minutes
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many file uploads. Please wait before uploading again."
        )
    
    # Comprehensive file validation
    try:
        validate_file_upload(file.filename, file.size, file.content_type)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    
    try:
        # Upload file to storage
        file_path = f"intake_documents/{current_user['id']}/{stage}_{file.filename}"
        uploaded_url = storage_service.upload_file(file, file_path)
        
        # Create document record
        document = crud_intake.intake_document.create_for_intake(
            db=db,
            intake_id=intake.id,
            file_name=file.filename,
            file_path=uploaded_url,
            file_size=file.size,
            file_type=file.content_type,
            stage=stage
        )
        
        return {
            "id": document.id,
            "file_name": document.file_name,
            "file_path": document.file_path,
            "file_size": document.file_size,
            "file_type": document.file_type,
            "stage": document.stage,
            "uploaded_at": document.uploaded_at,
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.get("/me/documents")
def get_my_intake_documents(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    stage: Optional[int] = None
) -> Any:
    """
    Get documents for current user's intake
    """
    if current_user.get("role") in ["rcic", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RCICs and admins don't have intake data"
        )
    
    intake = crud_intake.intake.get_by_client_id(db, current_user["id"])
    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )
    
    if stage:
        documents = crud_intake.intake_document.get_by_intake_and_stage(db, intake.id, stage)
    else:
        documents = crud_intake.intake_document.get_by_intake(db, intake.id)
    
    return documents

@router.delete("/me/documents/{document_id}")
def delete_intake_document(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    document_id: int
) -> Any:
    """
    Delete intake document
    """
    if current_user.get("role") in ["rcic", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="RCICs and admins don't have intake data"
        )
    
    # Get intake to verify ownership
    intake = crud_intake.intake.get_by_client_id(db, current_user["id"])
    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )
    
    # Get document and verify ownership
    document = crud_intake.intake_document.get(db, document_id)
    if not document or document.intake_id != intake.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    try:
        # Delete from storage
        storage_service.delete_file(document.file_path)
        
        # Delete from database
        crud_intake.intake_document.remove(db, id=document_id)
        
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

# Admin endpoints
@router.get("/admin/all", response_model=List[IntakeSummaryResponse])
def get_all_intakes(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_admin_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all intake summaries (admin only)
    """
    intakes = crud_intake.intake.get_multi(db, skip=skip, limit=limit)
    
    summaries = []
    for intake in intakes:
        summary = {
            "id": intake.id,
            "client_id": intake.client_id,
            "status": intake.status,
            "current_stage": intake.current_stage,
            "completed_stages": intake.completed_stages,
            "completion_percentage": crud_intake.intake.get_completion_percentage(intake),
            "created_at": intake.created_at,
            "updated_at": intake.updated_at,
            "completed_at": intake.completed_at
        }
        summaries.append(summary)
    
    return summaries

@router.get("/admin/{client_id}", response_model=IntakeResponse)
def get_client_intake(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_admin_user),
    client_id: str
) -> Any:
    """
    Get specific client's intake data (admin only)
    """
    intake = crud_intake.intake.get_by_client_id(db, client_id)
    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )
    
    return intake

@router.post("/admin/{client_id}/reset")
def reset_client_intake(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_admin_user),
    client_id: str
) -> Any:
    """
    Reset client's intake to initial state (admin only)
    """
    intake = crud_intake.intake.reset_intake(db, client_id)
    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )
    
    return {"message": "Intake reset successfully", "intake": intake}

def _validate_stage_data(stage: int, data: dict) -> dict:
    """
    Validate stage data based on stage requirements
    """
    validation = {"valid": True, "errors": []}
    
    # Add stage-specific validation logic here
    # This is a simplified version - you can expand based on business rules
    
    if stage == 1:
        required = ["location", "client_role"]
        for field in required:
            if field not in data or not data[field]:
                validation["valid"] = False
                validation["errors"].append(f"Missing required field: {field}")
    
    elif stage == 2:
        required = ["full_name", "email", "preferred_language", "timezone"]
        for field in required:
            if field not in data or not data[field]:
                validation["valid"] = False
                validation["errors"].append(f"Missing required field: {field}")
        
        # Validate email format if provided
        if "email" in data and data["email"]:
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, data["email"]):
                validation["valid"] = False
                validation["errors"].append("Invalid email format")
    
    # Add more stage validations as needed
    
    return validation