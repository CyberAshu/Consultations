#!/usr/bin/env python3

"""
Fix expired signed URLs in consultant profiles by converting them to public URLs
"""

import os
import sys
import re
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def extract_file_path_from_signed_url(signed_url):
    """Extract file path from signed URL"""
    # Match pattern like: /storage/v1/object/sign/bucket/path/file.jpg?token=...
    pattern = r'/storage/v1/object/sign/([^/]+)/(.+?)\?'
    match = re.search(pattern, signed_url)
    if match:
        bucket = match.group(1)
        file_path = match.group(2)
        return bucket, file_path
    return None, None

def convert_to_public_url(signed_url, supabase_base_url):
    """Convert signed URL to public URL"""
    bucket, file_path = extract_file_path_from_signed_url(signed_url)
    if bucket and file_path:
        return f"{supabase_base_url}/storage/v1/object/public/{bucket}/{file_path}"
    return None

def main():
    print("🔧 Fixing Expired Consultant Profile Image URLs")
    print("=" * 55)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print()
        
        # Get consultants with signed URLs that need fixing
        print("🔍 Finding consultants with expired signed URLs:")
        print("-" * 50)
        
        consultants_response = supabase.table('consultants').select('''
            id,
            name,
            profile_image_url
        ''').execute()
        
        consultants = consultants_response.data
        signed_url_consultants = []
        
        for consultant in consultants:
            url = consultant.get('profile_image_url')
            if url and '/storage/v1/object/sign/' in url:
                signed_url_consultants.append(consultant)
                print(f"  ⚠️  {consultant['name']} (ID: {consultant['id']}) has signed URL")
        
        if not signed_url_consultants:
            print("  ✅ No consultants found with signed URLs to fix")
            return
        
        print(f"\nFound {len(signed_url_consultants)} consultants to fix")
        print()
        
        # Fix each consultant's URL
        print("🛠️ FIXING URLs:")
        print("-" * 20)
        
        supabase_base_url = settings.SUPABASE_URL
        fixed_count = 0
        
        for consultant in signed_url_consultants:
            consultant_id = consultant['id']
            name = consultant['name']
            old_url = consultant['profile_image_url']
            
            print(f"Fixing {name} (ID: {consultant_id})...")
            
            # Convert to public URL
            new_url = convert_to_public_url(old_url, supabase_base_url)
            
            if new_url:
                try:
                    # Update database
                    update_response = supabase.table('consultants').update({
                        'profile_image_url': new_url
                    }).eq('id', consultant_id).execute()
                    
                    if update_response.data:
                        print(f"  ✅ Updated successfully")
                        print(f"     Old URL: {old_url[:80]}...")
                        print(f"     New URL: {new_url}")
                        fixed_count += 1
                    else:
                        print(f"  ❌ Failed to update database")
                        
                except Exception as e:
                    print(f"  ❌ Error updating {name}: {e}")
            else:
                print(f"  ❌ Could not extract file path from URL")
            
            print()
        
        print(f"📊 SUMMARY:")
        print(f"  Fixed {fixed_count} out of {len(signed_url_consultants)} consultants")
        
        if fixed_count > 0:
            print(f"  ✅ Profile images should now load properly!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()