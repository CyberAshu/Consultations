#!/usr/bin/env python3

"""
Clean up URLs for files that no longer exist in storage
"""

import os
import sys
import requests

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def main():
    print("🧹 Cleaning Up Missing File URLs")
    print("=" * 40)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print()
        
        # Get all consultants with Supabase storage URLs
        consultants_response = supabase.table('consultants').select('''
            id,
            name,
            profile_image_url
        ''').execute()
        
        consultants = consultants_response.data
        supabase_url_consultants = []
        
        for consultant in consultants:
            url = consultant.get('profile_image_url')
            if url and 'supabase.co/storage' in url:
                supabase_url_consultants.append(consultant)
        
        print(f"Found {len(supabase_url_consultants)} consultants with Supabase storage URLs")
        print()
        
        # Check each URL
        print("🔍 CHECKING URL ACCESSIBILITY:")
        print("-" * 35)
        
        broken_urls = []
        
        for consultant in supabase_url_consultants:
            name = consultant['name']
            url = consultant['profile_image_url']
            consultant_id = consultant['id']
            
            print(f"Testing {name}...")
            print(f"  URL: {url[:80]}...")
            
            try:
                response = requests.head(url, timeout=10)
                if response.status_code == 200:
                    print(f"  ✅ Working (Status: {response.status_code})")
                else:
                    print(f"  ❌ Broken (Status: {response.status_code})")
                    broken_urls.append({
                        'id': consultant_id,
                        'name': name,
                        'url': url,
                        'status': response.status_code
                    })
            except Exception as e:
                print(f"  ❌ Error: {e}")
                broken_urls.append({
                    'id': consultant_id,
                    'name': name,
                    'url': url,
                    'status': 'ERROR'
                })
            print()
        
        if not broken_urls:
            print("✅ All URLs are working!")
            return
        
        print(f"🛠️ FIXING {len(broken_urls)} BROKEN URLs:")
        print("-" * 40)
        
        fixed_count = 0
        
        for broken in broken_urls:
            consultant_id = broken['id']
            name = broken['name']
            
            print(f"Cleaning up {name} (ID: {consultant_id})...")
            
            try:
                # Set profile_image_url to None
                update_response = supabase.table('consultants').update({
                    'profile_image_url': None
                }).eq('id', consultant_id).execute()
                
                if update_response.data:
                    print(f"  ✅ Removed broken URL")
                    fixed_count += 1
                else:
                    print(f"  ❌ Failed to update database")
                    
            except Exception as e:
                print(f"  ❌ Error updating {name}: {e}")
            
            print()
        
        print(f"📊 SUMMARY:")
        print(f"  Cleaned up {fixed_count} out of {len(broken_urls)} broken URLs")
        print(f"  These consultants will now show placeholder avatars")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()