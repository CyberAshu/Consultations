import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client, Client
from app.core.config import settings

async def update_user_references():
    """
    Updates user references in the database with Supabase Auth user IDs.
    """
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    
    # Get all users from Supabase Auth
    try:
        users_response = supabase.auth.admin.list_users()
        print(f"Users response: {users_response}")
        
        # Handle different response formats
        if hasattr(users_response, 'users') and users_response.users:
            user_list = users_response.users
        elif isinstance(users_response, list):
            user_list = users_response
        else:
            print(f"Unexpected response format: {type(users_response)}")
            return
            
        if not user_list:
            print("No users found in Supabase Auth.")
            return
        
        users = {user.email: user.id for user in user_list}
        print(f"Found {len(users)} users in Supabase Auth.")
        for email, user_id in users.items():
            print(f"  User: {email} -> {user_id}")

    except Exception as e:
        print(f"Error fetching users from Supabase: {e}")
        import traceback
        traceback.print_exc()
        return

    # Tables to update
    tables_to_update = {
        "consultants": "user_id",
        "bookings": "client_id",
        "blog_posts": "author_id",
        "blog_comments": "author_id",
        "blog_likes": "user_id",
        "consultant_reviews": "client_id"
    }

    print("\nStarting data migration...")

    # For now, let's just check if there are any records with dummy UUIDs
    dummy_uuid = "00000000-0000-0000-0000-000000000000"
    first_user_id = list(users.values())[0] if users else None
    
    if not first_user_id:
        print("No Supabase users found to use for updating records.")
        return
    
    print(f"Will update any dummy UUIDs with user ID: {first_user_id}")
    
    for table, column in tables_to_update.items():
        try:
            # Check if the table exists and has records with dummy UUID
            response = supabase.table(table).select("id, " + column).eq(column, dummy_uuid).execute()

            if response.data:
                print(f"Updating {len(response.data)} records in {table}...")
                for record in response.data:
                    supabase.table(table).update({column: first_user_id}).eq("id", record["id"]).execute()
                    print(f"  Updated {table} record {record['id']} with user ID {first_user_id}")
            else:
                print(f"No records with dummy UUID in {table}.")
        except Exception as e:
            print(f"Error checking {table}: {e}")

    print("\nData migration complete.")

if __name__ == "__main__":
    asyncio.run(update_user_references())
