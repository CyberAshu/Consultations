#!/usr/bin/env python3

import requests

def main():
    print("🧪 Testing Final Working URL")
    print("=" * 35)
    
    test_url = "https://dkyyxbmxyyiwqyhhevnu.supabase.co/storage/v1/object/public/consultant-documents/profile-images/5db6f4a2-773f-4c84-9a1c-62414e4562a6.webp"
    
    print(f"Testing URL: {test_url}")
    print()
    
    try:
        response = requests.head(test_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
        print(f"Content-Length: {response.headers.get('content-length', 'Unknown')}")
        print(f"Cache-Control: {response.headers.get('cache-control', 'Unknown')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'image' in content_type:
                print("\n✅ PERFECT! URL works and has correct image MIME type!")
                print("🖼️ This image should display properly in the browser!")
            else:
                print(f"\n⚠️ URL works but content-type might be wrong: {content_type}")
        else:
            print(f"\n❌ Still getting error: {response.status_code}")
        
    except Exception as e:
        print(f"❌ Error testing URL: {e}")

if __name__ == "__main__":
    main()