#!/usr/bin/env python3

import requests
import os
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings

def main():
    print("🧪 Testing Public URL Access")
    print("=" * 35)
    
    test_url = "https://dkyyxbmxyyiwqyhhevnu.supabase.co/storage/v1/object/public/consultant-documents/profile-images/c8ecda14-dfdb-4f56-8b7a-21bf7b7feede.jpg"
    
    print(f"Testing URL: {test_url}")
    print()
    
    try:
        response = requests.head(test_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
        print(f"Content-Length: {response.headers.get('content-length', 'Unknown')}")
        print(f"Cache-Control: {response.headers.get('cache-control', 'Unknown')}")
        
        if response.status_code == 200:
            print("\n✅ PUBLIC URL WORKS! Images should load now!")
        else:
            print(f"\n❌ Still getting error: {response.status_code}")
            
            # Get full response to see error
            full_response = requests.get(test_url, timeout=10)
            print(f"Error response: {full_response.text}")
        
    except Exception as e:
        print(f"❌ Error testing URL: {e}")

if __name__ == "__main__":
    main()