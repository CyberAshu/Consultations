from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('SUPABASE_URL')
anon_key = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(url, anon_key)

print("=== Testing Supabase Auth ===")
print(f"URL: {url}")
print(f"Anon Key: {anon_key[:20]}...")

# Test 1: Try to sign up a test user (we'll delete it later)
test_email = "test@example.com"
test_password = "testpassword123"

print(f"\n1. Testing signup with {test_email}...")
try:
    response = supabase.auth.sign_up({
        "email": test_email,
        "password": test_password,
        "options": {
            "data": {
                "role": "client",
                "full_name": "Test User"
            }
        }
    })
    if response.user:
        print(f"✓ Signup successful! User ID: {response.user.id}")
        user_id = response.user.id
        
        # Test 2: Try to sign in
        print(f"\n2. Testing signin...")
        signin_response = supabase.auth.sign_in_with_password({
            "email": test_email,
            "password": test_password
        })
        if signin_response.user:
            print(f"✓ Signin successful! Access token: {signin_response.session.access_token[:20]}...")
            
            # Test 3: Test API call with token
            print(f"\n3. Testing API call with token...")
            import requests
            headers = {
                "Authorization": f"Bearer {signin_response.session.access_token}"
            }
            api_response = requests.get('http://localhost:8000/api/v1/bookings/', headers=headers)
            print(f"API Response: {api_response.status_code}")
            if api_response.status_code == 200:
                print("✓ API call successful!")
                print(f"Response: {api_response.json()}")
            else:
                print(f"✗ API call failed: {api_response.text}")
        else:
            print("✗ Signin failed")
    else:
        print("✗ Signup failed")
        print(f"Response: {response}")
        
except Exception as e:
    print(f"✗ Auth test failed: {e}")

print("\n=== Current Session Check ===")
try:
    session = supabase.auth.get_session()
    if session and hasattr(session, 'session') and session.session:
        print(f"Current user: {session.session.user.email}")
        print(f"Token: {session.session.access_token[:20]}...")
    else:
        print("No active session")
except Exception as e:
    print(f"Session check error: {e}")
