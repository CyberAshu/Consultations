from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('SUPABASE_URL')
service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not service_key:
    print("No service role key found")
    exit(1)

supabase = create_client(url, service_key)

print("=== Supabase Auth Users ===")

try:
    # Use admin methods to list users
    response = supabase.auth.admin.list_users()
    
    if hasattr(response, 'users') and response.users:
        print(f"Found {len(response.users)} users in Supabase Auth:")
        for user in response.users:
            print(f"  - {user.email} (ID: {user.id})")
            print(f"    Role: {user.user_metadata.get('role', 'N/A')}")
            print(f"    Confirmed: {user.email_confirmed_at is not None}")
            print(f"    Created: {user.created_at}")
            print("    ---")
    else:
        print("No users found in Supabase Auth")
        
except Exception as e:
    print(f"Error accessing auth users: {e}")

# Check bookings with proper user IDs
print("\n=== Checking Bookings ===")
anon_supabase = create_client(url, os.getenv('SUPABASE_ANON_KEY'))
try:
    bookings = anon_supabase.table('bookings').select('*').execute()
    print(f"Found {len(bookings.data)} bookings:")
    for booking in bookings.data:
        print(f"  - Booking {booking['id']}: client_id = {booking['client_id']}")
except Exception as e:
    print(f"Error fetching bookings: {e}")
