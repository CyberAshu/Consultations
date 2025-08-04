from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY') 
supabase = create_client(url, key)

print("=== Database Schema Check ===")

# List of tables to check
tables_to_check = [
    'users',
    'consultants', 
    'bookings',
    'consultant_services',
    'booking_documents'
]

for table in tables_to_check:
    try:
        response = supabase.table(table).select('*').limit(1).execute()
        print(f"✓ Table '{table}' exists - {len(response.data)} records (showing first)")
        if response.data:
            print(f"  Sample record: {list(response.data[0].keys())}")
    except Exception as e:
        print(f"✗ Table '{table}' - Error: {e}")

print("\n=== Checking Auth Users ===")
# Try to access Supabase auth users using service role key
try:
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if service_key:
        service_supabase = create_client(url, service_key)
        # Query auth.users through admin API
        print(f"Service key available: {service_key[:10]}...{service_key[-10:]}")
        
        # Try RPC call to get users
        try:
            response = service_supabase.rpc('get_users').execute()
            print(f"Found users via RPC: {response}")
        except:
            print("No get_users RPC function available")
            
    else:
        print("No service role key found")
except Exception as e:
    print(f"Error with service key: {e}")
