#!/usr/bin/env python3

"""
Fix MIME types for profile images that have wrong content-type
"""

import os
import sys
import mimetypes

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def get_mime_type_from_extension(filename):
    """Get proper MIME type from file extension"""
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or "application/octet-stream"

def main():
    print("🔧 Fixing Image MIME Types in Storage")
    print("=" * 45)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print()
        
        # Get files with wrong MIME types
        print("🔍 CHECKING FILES WITH WRONG MIME TYPES:")
        print("-" * 45)
        
        bucket_name = "consultant-documents"
        folder_path = "profile-images"
        
        # List all files in profile-images folder
        files = supabase.storage.from_(bucket_name).list(folder_path)
        
        files_to_fix = []
        
        for file in files:
            filename = file.get('name', 'Unknown')
            stored_type = file.get('metadata', {}).get('mimetype', 'Unknown')
            
            # Get what the MIME type should be
            correct_type = get_mime_type_from_extension(filename)
            
            print(f"📄 {filename}")
            print(f"  Current: {stored_type}")
            print(f"  Should be: {correct_type}")
            
            if stored_type == 'text/plain' and correct_type != 'text/plain':
                files_to_fix.append({
                    'filename': filename,
                    'current_type': stored_type,
                    'correct_type': correct_type,
                    'path': f"{folder_path}/{filename}"
                })
                print(f"  ❌ NEEDS FIXING")
            elif stored_type == correct_type:
                print(f"  ✅ CORRECT")
            else:
                print(f"  ⚠️ DIFFERENT BUT MAYBE OK")
            print()
        
        if not files_to_fix:
            print("✅ No files need MIME type fixing!")
            return
        
        print(f"\n🛠️ FIXING {len(files_to_fix)} FILES:")
        print("-" * 35)
        
        fixed_count = 0
        
        for file_info in files_to_fix:
            filename = file_info['filename']
            file_path = file_info['path']
            correct_type = file_info['correct_type']
            
            print(f"Fixing {filename}...")
            
            try:
                # Download the file
                print(f"  📥 Downloading file...")
                file_data = supabase.storage.from_(bucket_name).download(file_path)
                
                if file_data:
                    print(f"  📄 Downloaded {len(file_data)} bytes")
                    
                    # Remove the old file
                    print(f"  🗑️ Removing old file...")
                    remove_response = supabase.storage.from_(bucket_name).remove([file_path])
                    
                    # Upload with correct MIME type
                    print(f"  📤 Re-uploading with correct MIME type...")
                    upload_response = supabase.storage.from_(bucket_name).upload(
                        path=file_path,
                        file=file_data,
                        file_options={
                            "content-type": correct_type
                        }
                    )
                    
                    print(f"  ✅ Fixed! New MIME type: {correct_type}")
                    fixed_count += 1
                    
                else:
                    print(f"  ❌ Failed to download file")
                    
            except Exception as e:
                print(f"  ❌ Error fixing {filename}: {e}")
            
            print()
        
        print(f"📊 SUMMARY:")
        print(f"  Fixed {fixed_count} out of {len(files_to_fix)} files")
        
        if fixed_count > 0:
            print(f"  ✅ Profile images should display correctly now!")
            print(f"  🔄 Browser may need to clear cache to see changes")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()