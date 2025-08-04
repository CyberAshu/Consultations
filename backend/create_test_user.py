from supabase import create_client, Client
import os
from dotenv import load_dotenv
import requests

load_dotenv()

url = os.getenv('SUPABASE_URL')
service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not service_key:
    print("No service role key found")
    exit(1)

supabase = create_client(url, service_key)

print("=== Creating Confirmed Test User ===")

# Create user with admin API (this bypasses email confirmation)
test_email = "confirmed.user@example.com"
test_password = "TestPassword123!"

try:
    # Create user using admin API
    response = supabase.auth.admin.create_user({
        "email": test_email,
        "password": test_password,
        "email_confirm": True,  # This confirms the email immediately
        "user_metadata": {
            "full_name": "Confirmed Test User",
            "role": "client"
        }
    })
    
    print(f"✓ User created: {response.user.id}")
    print(f"✓ Email: {response.user.email}")
    print(f"✓ Email confirmed: {response.user.email_confirmed_at is not None}")
    
    # Now test login with this user
    print("\n=== Testing Login with Confirmed User ===")
    
    anon_supabase = create_client(url, os.getenv('SUPABASE_ANON_KEY'))
    login_response = anon_supabase.auth.sign_in_with_password({
        "email": test_email,
        "password": test_password
    })
    
    if login_response.session:
        print("✓ Login successful!")
        access_token = login_response.session.access_token
        print(f"✓ Access token: {access_token[:20]}...")
        
        # Test API endpoints
        print("\n=== Testing API Endpoints ===")
        
        # Test auth/me
        headers = {"Authorization": f"Bearer {access_token}"}
        me_response = requests.get('http://localhost:8000/api/v1/auth/me', headers=headers)
        print(f"Auth/me Status: {me_response.status_code}")
        if me_response.status_code == 200:
            print(f"User info: {me_response.json()}")
        
        # Test bookings
        bookings_response = requests.get('http://localhost:8000/api/v1/bookings/', headers=headers)
        print(f"Bookings Status: {bookings_response.status_code}")
        if bookings_response.status_code == 200:
            print(f"Bookings: {bookings_response.json()}")
        else:
            print(f"Bookings Error: {bookings_response.text}")
            
    else:
        print("✗ Login failed even with confirmed user")
        
except Exception as e:
    print(f"✗ Error: {e}")

# Also create an RCIC user for testing RCIC dashboard
print("\n=== Creating RCIC Test User ===")

rcic_email = "rcic.test@example.com"
rcic_password = "TestPassword123!"

try:
    # Create RCIC user
    rcic_response = supabase.auth.admin.create_user({
        "email": rcic_email,
        "password": rcic_password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": "Test RCIC User",
            "role": "rcic"
        }
    })
    
    print(f"✓ RCIC User created: {rcic_response.user.id}")
    print(f"✓ Email: {rcic_response.user.email}")
    
    # Also need to create consultant profile for this RCIC user
    print("Creating consultant profile...")
    consultant_data = {
        "user_id": rcic_response.user.id,
        "rcic_number": "R123456",
        "name": "Test RCIC User",
        "location": "Toronto, ON",
        "timezone": "America/Toronto",
        "languages": ["English", "French"],
        "specialties": ["Express Entry", "Family Reunification"],
        "bio": "Test RCIC for development",
        "experience": 5,
        "is_verified": True,
        "is_available": True
    }
    
    consultant_response = supabase.table('consultants').insert(consultant_data).execute()
    if consultant_response.data:
        print(f"✓ Consultant profile created: ID {consultant_response.data[0]['id']}")
    
except Exception as e:
    print(f"✗ Error creating RCIC: {e}")

print("\n=== Test Credentials Created ===")
print(f"Client Login: {test_email} / {test_password}")
print(f"RCIC Login: {rcic_email} / {rcic_password}")
print("\nYou can now use these credentials in your frontend for testing!")
