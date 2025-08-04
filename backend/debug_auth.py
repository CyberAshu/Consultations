from supabase import create_client, Client
import os
from dotenv import load_dotenv
import requests

load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(url, key)

print("=== Authentication Debug ===")

# Check if there are any active sessions or users
print("\n1. Checking Supabase Auth configuration...")
print(f"Supabase URL: {url}")
print(f"Anon Key: {key[:10]}...{key[-10:]}")

# Try to get current session
print("\n2. Checking current session...")
try:
    session = supabase.auth.get_session()
    if session.session:
        print(f"Active session found: {session.session.user.email}")
        print(f"Access token: {session.session.access_token[:20]}...")
    else:
        print("No active session found")
except Exception as e:
    print(f"Error getting session: {e}")

# Try to get all users from auth.users (this requires service role key)
print("\n3. Checking users in database...")
try:
    # This might fail if we don't have proper permissions
    users_response = supabase.table('auth.users').select('*').execute()
    print(f"Found {len(users_response.data)} users")
except Exception as e:
    print(f"Cannot access auth.users table directly: {e}")

# Check users table in public schema
try:
    users_response = supabase.table('users').select('*').limit(5).execute()
    print(f"Found {len(users_response.data)} users in public.users:")
    for user in users_response.data:
        print(f"  - {user.get('email')} (role: {user.get('role')})")
except Exception as e:
    print(f"Error accessing public.users: {e}")

print("\n4. Testing API endpoint...")
try:
    response = requests.get('http://localhost:8000/api/v1/bookings/')
    print(f"Status: {response.status_code}")
    if response.status_code == 401:
        print("✓ API is correctly rejecting unauthenticated requests")
    else:
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error connecting to API: {e}")
