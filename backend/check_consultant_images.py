#!/usr/bin/env python3

"""
Check consultant profile images in database and storage
"""

import os
import sys
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def main():
    print("🖼️ Consultant Profile Images Checker")
    print("=" * 45)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print()
        
        # Check consultants table for profile images
        print("👨‍💼 CONSULTANT PROFILES:")
        print("-" * 35)
        try:
            consultants_response = supabase.table('consultants').select('''
                id,
                name,
                profile_image_url,
                created_at
            ''').execute()
            
            consultants = consultants_response.data
            
            if consultants:
                print(f"Found {len(consultants)} consultants:")
                print()
                for i, consultant in enumerate(consultants, 1):
                    profile_url = consultant.get('profile_image_url', None)
                    print(f"#{i} - {consultant.get('name', 'N/A')}")
                    print(f"  ID: {consultant.get('id', 'N/A')}")
                    print(f"  Profile Image URL: {profile_url}")
                    if profile_url:
                        print(f"  URL Length: {len(profile_url)} chars")
                        print(f"  URL Preview: {profile_url[:100]}{'...' if len(profile_url) > 100 else ''}")
                    else:
                        print("  ❌ No profile image URL")
                    print(f"  Created: {consultant.get('created_at', 'N/A')}")
                    print()
            else:
                print("No consultants found")
        except Exception as e:
            print(f"Error fetching consultants: {e}")
        
        print()
        
        # Check storage for profile images folder
        print("📂 PROFILE IMAGES STORAGE:")
        print("-" * 35)
        
        bucket_name = "consultant-documents"
        try:
            # Check profile-images folder
            profile_images = supabase.storage.from_(bucket_name).list("profile-images")
            
            if profile_images:
                print(f"Found {len(profile_images)} items in profile-images folder:")
                for i, img in enumerate(profile_images, 1):
                    name = img.get('name', 'Unknown')
                    size = img.get('metadata', {}).get('size', 0)
                    mimetype = img.get('metadata', {}).get('mimetype', 'Unknown')
                    updated = img.get('updated_at', 'Unknown')
                    
                    print(f"  {i}. {name}")
                    print(f"     Size: {size} bytes ({size/1024:.1f} KB)")
                    print(f"     Type: {mimetype}")
                    print(f"     Updated: {updated}")
                    print()
            else:
                print("No profile images found in storage")
                
        except Exception as e:
            print(f"Error checking profile images storage: {e}")
        
        print()
        
        # Try to check if URLs are accessible
        print("🔗 URL ACCESSIBILITY CHECK:")
        print("-" * 35)
        
        try:
            consultants_with_images = [c for c in consultants if c.get('profile_image_url')]
            
            if consultants_with_images:
                print(f"Testing {len(consultants_with_images)} profile image URLs:")
                
                for consultant in consultants_with_images[:3]:  # Test first 3
                    url = consultant['profile_image_url']
                    print(f"  🧪 Testing: {consultant['name']}")
                    print(f"     URL: {url}")
                    
                    # Check if URL looks like a Supabase storage URL
                    if 'supabase.co' in url and 'storage' in url:
                        print("     ✅ Looks like valid Supabase storage URL")
                    elif url.startswith('http'):
                        print("     ⚠️  External URL - may need CORS or authentication")
                    else:
                        print("     ❌ Invalid URL format")
                    print()
            else:
                print("No consultants have profile image URLs to test")
                
        except Exception as e:
            print(f"Error during URL accessibility check: {e}")
        
        print()
        
        # Check upload endpoint and recent uploads
        print("📤 UPLOAD ACTIVITY:")
        print("-" * 25)
        
        try:
            # Check consultant-files bucket (public bucket)
            public_bucket = "consultant-files"
            try:
                public_files = supabase.storage.from_(public_bucket).list("profile-images")
                if public_files:
                    print(f"Found {len(public_files)} items in public consultant-files/profile-images:")
                    for item in public_files[:5]:  # Show first 5
                        print(f"  📄 {item.get('name', 'Unknown')} ({item.get('metadata', {}).get('size', 0)} bytes)")
                else:
                    print("No files in public bucket profile-images folder")
            except Exception as e:
                print(f"Public bucket check failed: {e}")
        
        except Exception as e:
            print(f"Error checking upload activity: {e}")
        
        print()
        
        # Summary and analysis
        print("📊 ANALYSIS:")
        print("-" * 15)
        consultants_total = len(consultants) if consultants else 0
        consultants_with_images = len([c for c in consultants if c.get('profile_image_url')]) if consultants else 0
        
        print(f"Total Consultants: {consultants_total}")
        print(f"With Profile Images: {consultants_with_images}")
        print(f"Without Profile Images: {consultants_total - consultants_with_images}")
        
        if consultants_with_images == 0:
            print("\n💡 POSSIBLE ISSUES:")
            print("  1. No profile images uploaded yet")
            print("  2. Upload functionality not working")
            print("  3. Images uploaded but URLs not saved to database")
        elif consultants_with_images > 0:
            print("\n💡 POSSIBLE CORRUPTION CAUSES:")
            print("  1. Invalid Supabase storage URLs")
            print("  2. CORS issues with image loading")
            print("  3. Signed URLs expired")
            print("  4. Storage bucket permission issues")
            print("  5. Images deleted from storage but URLs remain in DB")
            
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()