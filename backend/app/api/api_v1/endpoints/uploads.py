import os
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from supabase import Client

from app.api import deps
from app.core.config import settings
from app.services.storage_service import storage_service

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
BUCKET_NAME = "consultant-documents"

def ensure_bucket_exists(db: Client, public: bool = True) -> bool:
    """
    Simple check if bucket exists. Since bucket already exists, just verify access.
    """
    try:
        # Test bucket access by listing files
        db.storage.from_(BUCKET_NAME).list("profile-images", {"limit": 1})
        return True
    except Exception as e:
        return False

@router.post("/profile-image")
async def upload_profile_image(
    *,
    db: Client = Depends(deps.get_admin_db),
    current_user: dict = Depends(deps.get_current_active_user),
    file: UploadFile = File(...),
) -> Any:
    """
    Upload profile image for consultant.
    """
    # Upload profile image for consultant
    
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Read file content to check size
    try:
        # Reset file pointer to beginning and read content
        await file.seek(0)
        file_content = await file.read()
        
        # Validate file content
        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="File appears to be empty. Please select a valid file."
            )
        
        if not isinstance(file_content, bytes):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file content type: {type(file_content)}. Expected bytes."
            )
            
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 5MB."
            )
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=400,
            detail=f"Error reading file: {str(e)}"
        )
    
    # Ensure bucket exists (public for profile images)
    bucket_ready = ensure_bucket_exists(db, public=True)
    if not bucket_ready:
        raise HTTPException(
            status_code=500,
            detail=f"Storage bucket '{BUCKET_NAME}' could not be created or accessed. Please check Supabase configuration."
        )

    # Generate unique filename
    if not file.filename or '.' not in file.filename:
        # Default to jpeg if no extension found
        file_extension = 'jpg'
    else:
        file_extension = file.filename.split('.')[-1].lower()
    
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"profile-images/{unique_filename}"
    
    try:
        # Upload to Supabase Storage
        upload_response = db.storage.from_(BUCKET_NAME).upload(file_path, file_content)
        
        # Get public URL using storage service (which handles signed URLs for private buckets)
        try:
            public_url = storage_service.get_public_url(file_path)
            print(f"DEBUG: Generated URL via storage service: {public_url}")
        except Exception as url_error:
            print(f"DEBUG: Storage service URL generation failed: {url_error}")
            # Fallback - try direct public URL anyway
            public_url = db.storage.from_(BUCKET_NAME).get_public_url(file_path)
            if public_url.endswith('?'):
                public_url = public_url.rstrip('?')
            print(f"DEBUG: Fallback public URL: {public_url}")
        
        print(f"DEBUG: File path: {file_path}")
        print(f"DEBUG: Final URL: {public_url}")

        return {"url": public_url, "filename": unique_filename, "path": file_path}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/document")
async def upload_document(
    *,
    db: Client = Depends(deps.get_admin_db),
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
    
    # Ensure bucket exists (private/public as needed — keep public for simplicity here)
    ensure_bucket_exists(db, public=True)

    # Generate unique filename
    if not file.filename or '.' not in file.filename:
        # Default to pdf if no extension found
        file_extension = 'pdf'
    else:
        file_extension = file.filename.split('.')[-1].lower()
    
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"documents/{unique_filename}"
    
    try:
        # Upload to Supabase Storage
        db.storage.from_(BUCKET_NAME).upload(
            file_path,
            file_content,
            file_options={"content-type": file.content_type},
        )

        # Get public URL
        public_url = db.storage.from_(BUCKET_NAME).get_public_url(file_path)

        return {
            "url": public_url,
            "filename": file.filename,
            "original_name": file.filename,
            "path": file_path,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
