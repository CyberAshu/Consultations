#!/usr/bin/env python3

"""
Check Supabase bucket permissions and settings
"""

import os
import sys
import requests
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def main():
    print("🔒 Supabase Bucket Permissions Checker")
    print("=" * 45)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print()
        
        # Check bucket details
        print("🪣 BUCKET INFORMATION:")
        print("-" * 30)
        
        buckets = supabase.storage.list_buckets()
        
        for bucket in buckets:
            name = getattr(bucket, 'name', getattr(bucket, 'id', 'Unknown'))
            public = getattr(bucket, 'public', False)
            created_at = getattr(bucket, 'created_at', 'Unknown')
            
            print(f"📦 Bucket: {name}")
            print(f"   Public: {public}")
            print(f"   Created: {created_at}")
            print()
        
        print()
        
        # Test direct file access for specific files
        print("🧪 FILE ACCESS TESTS:")
        print("-" * 30)
        
        test_files = [
            "consultant-documents/profile-images/c8ecda14-dfdb-4f56-8b7a-21bf7b7feede.jpg",
            "consultant-documents/profile-images/5db6f4a2-773f-4c84-9a1c-62414e4562a6.webp"
        ]
        
        for file_path in test_files:
            print(f"Testing: {file_path}")
            
            # Test public URL
            public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{file_path}"
            print(f"  Public URL: {public_url}")
            
            try:
                response = requests.head(public_url, timeout=10)
                print(f"  Status: {response.status_code}")
                if response.status_code != 200:
                    print(f"  Error: {response.text if hasattr(response, 'text') else 'No error details'}")
                else:
                    print(f"  Content-Type: {response.headers.get('content-type', 'Unknown')}")
                    print(f"  Content-Length: {response.headers.get('content-length', 'Unknown')}")
            except Exception as e:
                print(f"  Error accessing public URL: {e}")
            
            # Test signed URL
            try:
                signed_response = supabase.storage.from_('consultant-documents').create_signed_url(
                    f"profile-images/{file_path.split('/')[-1]}", 
                    expires_in=3600
                )
                if 'signedURL' in signed_response:
                    signed_url = signed_response['signedURL']
                    print(f"  Signed URL: {signed_url[:100]}...")
                    
                    try:
                        signed_test = requests.head(signed_url, timeout=10)
                        print(f"  Signed Status: {signed_test.status_code}")
                        if signed_test.status_code == 200:
                            print(f"  ✅ Signed URL works!")
                        else:
                            print(f"  ❌ Signed URL failed")
                    except Exception as e:
                        print(f"  Error testing signed URL: {e}")
                else:
                    print(f"  Failed to create signed URL: {signed_response}")
            except Exception as e:
                print(f"  Error creating signed URL: {e}")
            
            print()
        
        print()
        
        # Check if we can make bucket public
        print("🔧 BUCKET PERMISSION FIXES:")
        print("-" * 35)
        
        try:
            # Try to update bucket to public
            print("Attempting to make consultant-documents bucket public...")
            
            # This might not work with current SDK, but let's try
            try:
                update_response = supabase.storage.update_bucket(
                    'consultant-documents',
                    {'public': True}
                )
                print(f"Bucket update response: {update_response}")
            except Exception as e:
                print(f"Cannot update bucket via SDK: {e}")
                print("This needs to be done via Supabase Dashboard:")
                print("1. Go to Storage in Supabase Dashboard")
                print("2. Select 'consultant-documents' bucket")
                print("3. Go to Settings")
                print("4. Enable 'Public bucket'")
        
        except Exception as e:
            print(f"Error in bucket permission check: {e}")
        
        print()
        
        # Alternative: Use signed URLs approach
        print("💡 ALTERNATIVE SOLUTION:")
        print("-" * 30)
        print("Since public URLs might not work, we should:")
        print("1. Generate fresh signed URLs with longer expiry (e.g., 1 month)")
        print("2. Update database with these new URLs")
        print("3. Set up a periodic job to refresh URLs before expiry")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()