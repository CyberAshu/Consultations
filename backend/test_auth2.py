from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('SUPABASE_URL')
anon_key = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(url, anon_key)

print("=== Testing Supabase Auth ===")

# Let's check what user might have the UUID from bookings
existing_user_id = "56c3b191-215b-455c-8391-2777fd58aaa1"
print(f"Checking for existing user with ID: {existing_user_id}")

# Test with a better email
test_email = "testuser2025@gmail.com"
test_password = "TestPassword123!"

print(f"\n1. Testing signup with {test_email}...")
try:
    response = supabase.auth.sign_up({
        "email": test_email,
        "password": test_password,
        "options": {
            "data": {
                "role": "client",
                "full_name": "Test User 2025"
            }
        }
    })
    
    print(f"Signup response: {response}")
    
    if response.user:
        print(f"✓ Signup successful! User ID: {response.user.id}")
        print(f"User email confirmed: {response.user.email_confirmed_at}")
        
        # Test sign in immediately (even if not confirmed)
        print(f"\n2. Testing signin...")
        try:
            signin_response = supabase.auth.sign_in_with_password({
                "email": test_email,
                "password": test_password
            })
            
            if signin_response.session:
                print(f"✓ Signin successful! Access token exists")
                
                # Test API call with token
                print(f"\n3. Testing API call with token...")
                import requests
                headers = {
                    "Authorization": f"Bearer {signin_response.session.access_token}"
                }
                api_response = requests.get('http://localhost:8000/api/v1/bookings/', headers=headers)
                print(f"API Response: {api_response.status_code}")
                print(f"Response body: {api_response.text}")
                
            else:
                print("✗ No session in signin response")
                
        except Exception as signin_error:
            print(f"Signin error: {signin_error}")
    else:
        print("✗ No user in signup response")
        
except Exception as e:
    print(f"✗ Signup error: {e}")

# Let's also check Supabase project settings
print(f"\n=== Project Info ===")
print(f"Supabase URL: {url}")
print("Make sure in Supabase dashboard:")
print("1. Auth > Settings > 'Enable email confirmations' is disabled for testing")
print("2. Auth > Providers > Email is enabled")
print("3. Database > Tables shows auth.users table exists")
