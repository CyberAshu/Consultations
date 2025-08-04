import os
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from supabase import Client

from app.api import deps
from app.core.config import settings

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/profile-image")
async def upload_profile_image(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    file: UploadFile = File(...),
) -> Any:
    """
    Upload profile image for consultant.
    """
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Read file content to check size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB."
        )
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"profile-images/{unique_filename}"
    
    try:
        # Upload to Supabase Storage
        response = db.storage.from_("consultant-files").upload(
            file_path, 
            file_content,
            file_options={"content-type": file.content_type}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to upload image")
        
        # Get public URL
        public_url = db.storage.from_("consultant-files").get_public_url(file_path)
        
        return {
            "url": public_url,
            "filename": unique_filename,
            "path": file_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/document")
async def upload_document(
    *,
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    file: UploadFile = File(...),
) -> Any:
    """
    Upload document (for intake forms, etc.).
    """
    # Read file content to check size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB."
        )
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"documents/{unique_filename}"
    
    try:
        # Upload to Supabase Storage
        response = db.storage.from_("consultant-files").upload(
            file_path, 
            file_content,
            file_options={"content-type": file.content_type}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to upload document")
        
        # Get public URL
        public_url = db.storage.from_("consultant-files").get_public_url(file_path)
        
        return {
            "url": public_url,
            "filename": file.filename,
            "original_name": file.filename,
            "path": file_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
