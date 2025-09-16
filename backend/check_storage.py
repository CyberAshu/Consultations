#!/usr/bin/env python3

"""
Check Supabase Storage for uploaded files
"""

import os
import sys
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin
from app.services.storage_service import StorageService

def main():
    print("📁 Supabase Storage Checker")
    print("=" * 35)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        storage = StorageService()
        print("✅ Connected to Supabase successfully")
        print()
        
        # Check available buckets
        print("🪣 STORAGE BUCKETS:")
        print("-" * 30)
        try:
            buckets_response = supabase.storage.list_buckets()
            if buckets_response:
                print("Available buckets:")
                for bucket in buckets_response:
                    bucket_name = bucket.get('name', 'Unknown')
                    bucket_public = bucket.get('public', False)
                    print(f"  📦 {bucket_name} (Public: {bucket_public})")
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
            # List all files in bucket
            files_response = supabase.storage.from_(bucket_name).list()
            
            if files_response:
                print(f"Found {len(files_response)} items in bucket:")
                print()
                
                for item in files_response:
                    name = item.get('name', 'Unknown')
                    item_type = 'Folder' if item.get('metadata', {}).get('mimetype') is None else 'File'
                    size = item.get('metadata', {}).get('size', 0) if item_type == 'File' else 'N/A'
                    last_modified = item.get('updated_at', 'Unknown')
                    
                    print(f"  📁 {name} ({item_type})")
                    if item_type == 'File':
                        print(f"      Size: {size} bytes")
                    print(f"      Modified: {last_modified}")
                    print()
                    
                    # If it's a folder, try to list its contents
                    if item_type == 'Folder':
                        try:
                            folder_contents = supabase.storage.from_(bucket_name).list(name)
                            if folder_contents:
                                print(f"    Contents of {name}:")
                                for file_item in folder_contents:
                                    file_name = file_item.get('name', 'Unknown')
                                    file_size = file_item.get('metadata', {}).get('size', 0)
                                    file_modified = file_item.get('updated_at', 'Unknown')
                                    print(f"      📄 {file_name} ({file_size} bytes) - {file_modified}")
                                print()
                        except Exception as e:
                            print(f"    Could not list folder contents: {e}")
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
            
            if intake_docs:
                print(f"Found {len(intake_docs)} items in intake_documents folder:")
                
                for doc in intake_docs:
                    doc_name = doc.get('name', 'Unknown')
                    doc_size = doc.get('metadata', {}).get('size', 0)
                    doc_modified = doc.get('updated_at', 'Unknown')
                    doc_type = doc.get('metadata', {}).get('mimetype', 'Unknown')
                    
                    print(f"  📄 {doc_name}")
                    print(f"      Size: {doc_size} bytes")
                    print(f"      Type: {doc_type}")
                    print(f"      Modified: {doc_modified}")
                    print()
                    
                    # If it's a user folder, check its contents
                    if doc.get('metadata', {}).get('mimetype') is None:  # It's a folder
                        try:
                            user_docs = supabase.storage.from_(bucket_name).list(f"intake_documents/{doc_name}")
                            if user_docs:
                                print(f"    User {doc_name} documents:")
                                for user_doc in user_docs:
                                    user_doc_name = user_doc.get('name', 'Unknown')
                                    user_doc_size = user_doc.get('metadata', {}).get('size', 0)
                                    print(f"      📄 {user_doc_name} ({user_doc_size} bytes)")
                                print()
                        except Exception as e:
                            print(f"    Could not list user folder: {e}")
                            
            else:
                print("No intake documents found in storage")
                
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
            
            if user_docs:
                print(f"Found {len(user_docs)} documents for this user:")
                for doc in user_docs:
                    doc_name = doc.get('name', 'Unknown')
                    doc_size = doc.get('metadata', {}).get('size', 0)
                    doc_type = doc.get('metadata', {}).get('mimetype', 'Unknown')
                    doc_modified = doc.get('updated_at', 'Unknown')
                    
                    print(f"  📄 {doc_name}")
                    print(f"      Size: {doc_size} bytes")
                    print(f"      Type: {doc_type}")
                    print(f"      Modified: {doc_modified}")
                    print()
            else:
                print("No documents found for this user")
                
        except Exception as e:
            print(f"Could not check user documents: {e}")
        
        print()
        
        # Summary
        print("📊 SUMMARY:")
        print("-" * 20)
        print("✅ Storage service is configured")
        print(f"📦 Main bucket: {bucket_name}")
        print("📁 Expected path: intake_documents/{user_id}/{stage}_{filename}")
        print("💡 Documents are stored in Supabase Storage, not database")
        print("🔗 Database only stores file metadata and paths")
        
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase Storage: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()