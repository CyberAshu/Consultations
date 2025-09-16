#!/usr/bin/env python3

"""
Fixed Supabase Storage Checker
"""

import os
import sys
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def main():
    print("📁 Supabase Storage Checker (Fixed)")
    print("=" * 42)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print(f"📍 Supabase URL: {settings.SUPABASE_URL}")
        print()
        
        # Check available buckets
        print("🪣 STORAGE BUCKETS:")
        print("-" * 30)
        try:
            buckets_response = supabase.storage.list_buckets()
            print(f"Raw buckets response: {buckets_response}")
            
            if buckets_response:
                print(f"Found {len(buckets_response)} buckets:")
                for i, bucket in enumerate(buckets_response):
                    print(f"  📦 Bucket {i+1}: {bucket}")
            else:
                print("No buckets found")
        except Exception as e:
            print(f"Error fetching buckets: {e}")
        
        print()
        
        # Check consultant-documents bucket (main bucket)
        bucket_name = "consultant-documents"
        print(f"📂 BUCKET CONTENTS: {bucket_name}")
        print("-" * 40)
        
        try:
            # List all files in bucket root
            files_response = supabase.storage.from_(bucket_name).list()
            print(f"Raw files response: {files_response}")
            
            if files_response and isinstance(files_response, list):
                print(f"Found {len(files_response)} items in bucket root:")
                print()
                
                for i, item in enumerate(files_response):
                    print(f"  📁 Item {i+1}: {item}")
                    print()
            else:
                print("Bucket is empty or not accessible")
                
        except Exception as e:
            print(f"Error accessing bucket: {e}")
        
        print()
        
        # Check specifically for intake_documents folder
        print("🔍 INTAKE DOCUMENTS FOLDER:")
        print("-" * 35)
        
        try:
            intake_docs = supabase.storage.from_(bucket_name).list("intake_documents")
            print(f"Intake documents response: {intake_docs}")
            
            if intake_docs and isinstance(intake_docs, list) and len(intake_docs) > 0:
                print(f"Found {len(intake_docs)} items in intake_documents folder:")
                for i, doc in enumerate(intake_docs):
                    print(f"  📄 Document {i+1}: {doc}")
            else:
                print("No intake documents folder found or it's empty")
                
        except Exception as e:
            print(f"Error checking intake documents: {e}")
        
        print()
        
        # Check storage for specific user ID from our intake
        user_id = "68810fb7-dba3-48f9-bc10-8dd4c1846100"  # From our database check
        print(f"🔍 DOCUMENTS FOR USER: {user_id}")
        print("-" * 50)
        
        try:
            user_folder_path = f"intake_documents/{user_id}"
            user_docs = supabase.storage.from_(bucket_name).list(user_folder_path)
            print(f"User documents response: {user_docs}")
            
            if user_docs and isinstance(user_docs, list) and len(user_docs) > 0:
                print(f"Found {len(user_docs)} documents for this user:")
                for i, doc in enumerate(user_docs):
                    print(f"  📄 Document {i+1}: {doc}")
            else:
                print("No documents found for this user")
                
        except Exception as e:
            print(f"Could not check user documents: {e}")
        
        print()
        
        # Try to check if the bucket itself exists by trying to upload/check permissions
        print("🔐 BUCKET PERMISSIONS CHECK:")
        print("-" * 35)
        
        try:
            # Try to check bucket info
            bucket_info = supabase.storage.get_bucket(bucket_name)
            print(f"Bucket info: {bucket_info}")
        except Exception as e:
            print(f"Could not get bucket info: {e}")
        
        print()
        
        # Summary
        print("📊 SUMMARY:")
        print("-" * 20)
        print("✅ Storage service is configured")
        print(f"📦 Main bucket: {bucket_name}")
        print("📁 Expected upload path: intake_documents/{user_id}/{stage}_{filename}")
        print("💡 Documents should be stored in Supabase Storage")
        print("🔗 Database stores only file metadata and paths")
        print()
        print("🤔 ANALYSIS:")
        print("-" * 15)
        print("Based on database check:")
        print("  • User completed all 12 stages")
        print("  • docs_ready field shows ['passport', 'resume']")
        print("  • But intake_documents table is empty")
        print("  • Storage appears empty for this user")
        print()
        print("💭 POSSIBLE REASONS:")
        print("  1. User selected document types but didn't upload actual files")
        print("  2. Frontend doesn't have upload functionality implemented")
        print("  3. Upload functionality exists but wasn't used")
        print("  4. Files were uploaded but storage path is different")
        
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase Storage: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()