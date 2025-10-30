import io
import uuid
from typing import Optional, BinaryIO
from fastapi import UploadFile, HTTPException
from supabase import Client
from app.db.supabase import get_supabase
import mimetypes

class StorageService:
    def __init__(self):
        self.supabase: Client = get_supabase()
        self.bucket_name = "consultant-documents"
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension from filename"""
        return filename.split('.')[-1].lower() if '.' in filename else ''
    
    def _validate_file_type(self, file: UploadFile) -> bool:
        """Validate if file type is allowed"""
        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'webp']
        allowed_mime_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/webp'
        ]
        
        file_extension = self._get_file_extension(file.filename or '')
        
        # Check both file extension and MIME type
        extension_valid = file_extension in allowed_extensions
        mime_type_valid = file.content_type in allowed_mime_types if file.content_type else False
        
        print(f"🔍 File validation - Extension: {file_extension} (valid: {extension_valid}), MIME: {file.content_type} (valid: {mime_type_valid})")
        
        return extension_valid or mime_type_valid
    
    def _generate_unique_filename(self, original_filename: str, prefix: str = "") -> str:
        """Generate unique filename with UUID"""
        file_extension = self._get_file_extension(original_filename)
        unique_id = str(uuid.uuid4())
        
        if prefix:
            return f"{prefix}_{unique_id}.{file_extension}"
        return f"{unique_id}.{file_extension}"
    
    async def upload_file(
        self, 
        file: UploadFile, 
        folder: str = "applications",
        prefix: str = ""
    ) -> str:
        """
        Upload file to Supabase Storage
        
        Args:
            file: The uploaded file
            folder: Folder name in the bucket
            prefix: Prefix for the filename
            
        Returns:
            The file path in storage
        """
        try:
            print(f"🔍 StorageService: Starting upload for file: {file.filename}")
            print(f"🔍 StorageService: File content type: {file.content_type}")
            print(f"🔍 StorageService: Upload folder: {folder}, prefix: {prefix}")
            
            # Ensure bucket exists before uploading
            if not self.create_bucket_if_not_exists():
                print(f"⚠️ StorageService: Warning - Bucket creation/check failed, continuing anyway")
            
            # Validate file type
            if not self._validate_file_type(file):
                error_msg = f"File type '{file.content_type}' not allowed. Allowed types: PDF, DOCX, DOC, JPG, JPEG, PNG, WEBP"
                print(f"❌ StorageService: {error_msg}")
                raise HTTPException(status_code=400, detail=error_msg)
            
            # Validate file size (10MB limit)
            file_content = await file.read()
            file_size = len(file_content)
            print(f"🔍 StorageService: File size: {file_size} bytes ({file_size / 1024 / 1024:.2f} MB)")
            
            if file_size > 10 * 1024 * 1024:  # 10MB
                error_msg = "File size too large. Maximum size is 10MB"
                print(f"❌ StorageService: {error_msg}")
                raise HTTPException(status_code=400, detail=error_msg)
            
            # Generate unique filename
            unique_filename = self._generate_unique_filename(file.filename or "document", prefix)
            file_path = f"{folder}/{unique_filename}"
            print(f"🔍 StorageService: Generated file path: {file_path}")
            
            # Upload to Supabase Storage
            print(f"🔄 StorageService: Uploading to bucket '{self.bucket_name}'...")
            response = self.supabase.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={
                    "content-type": file.content_type or "application/octet-stream"
                }
            )
            
            print(f"🔍 StorageService: Upload response status: {getattr(response, 'status_code', 'Unknown')}")
            print(f"🔍 StorageService: Upload response: {response}")
            
            # Check if upload was successful
            status_code = getattr(response, 'status_code', None)
            if status_code and status_code not in [200, 201]:
                error_detail = f"Failed to upload file: {response}"
                print(f"❌ StorageService: {error_detail}")
                raise HTTPException(status_code=500, detail=error_detail)
            
            # For some Supabase SDK versions, success is indicated differently
            if hasattr(response, 'error') and response.error:
                error_detail = f"Upload failed with error: {response.error}"
                print(f"❌ StorageService: {error_detail}")
                raise HTTPException(status_code=500, detail=error_detail)
            
            print(f"✅ StorageService: File uploaded successfully to: {file_path}")
            return file_path
            
        except Exception as e:
            print(f"❌ StorageService: Exception during upload: {type(e).__name__}: {str(e)}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"Error uploading file: {str(e)}"
            )
    
    def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """
        Get signed URL for file access
        
        Args:
            file_path: Path to file in storage
            expires_in: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Signed URL for file access
        """
        try:
            print(f"Creating signed URL for file: {file_path} in bucket: {self.bucket_name}")
            
            response = self.supabase.storage.from_(self.bucket_name).create_signed_url(
                path=file_path,
                expires_in=expires_in
            )
            
            print(f"Signed URL response: {response}")
            
            if 'signedURL' in response:
                return response['signedURL']
            else:
                print(f"No signedURL in response: {response}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate file URL. Response: {response}"
                )
                
        except Exception as e:
            print(f"Error creating signed URL: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error getting file URL: {str(e)}"
            )
    
    def delete_file(self, file_path: str) -> bool:
        """
        Delete file from storage
        
        Args:
            file_path: Path to file in storage
            
        Returns:
            True if successful
        """
        try:
            response = self.supabase.storage.from_(self.bucket_name).remove([file_path])
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error deleting file {file_path}: {str(e)}")
            return False
    
    def create_bucket_if_not_exists(self) -> bool:
        """
        Create bucket if it doesn't exist
        
        Returns:
            True if bucket exists or was created successfully
        """
        try:
            # List all buckets to check if our bucket exists
            buckets = self.supabase.storage.list_buckets()
            
            # Check if bucket already exists
            for bucket in buckets:
                if hasattr(bucket, 'name') and bucket.name == self.bucket_name:
                    print(f"Bucket {self.bucket_name} already exists")
                    return True
                elif hasattr(bucket, 'id') and bucket.id == self.bucket_name:
                    print(f"Bucket {self.bucket_name} already exists")
                    return True
            
            # If bucket doesn't exist, create it
            print(f"Creating bucket {self.bucket_name}...")
            create_response = self.supabase.storage.create_bucket(
                self.bucket_name,
                options={
                    "public": False,  # Private bucket for security
                    "allowedMimeTypes": [
                        "image/jpeg", 
                        "image/jpg",
                        "image/png", 
                        "image/webp",
                        "application/pdf", 
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ],
                    "fileSizeLimit": 10485760  # 10MB
                }
            )
            
            print(f"Bucket creation response: {create_response}")
            return True
            
        except Exception as e:
            print(f"Error with bucket operations: {str(e)}")
            # Even if bucket creation fails, we can continue
            # The bucket might exist but API call failed
            return True

# Global instance
storage_service = StorageService()
