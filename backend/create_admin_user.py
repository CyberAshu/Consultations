#!/usr/bin/env python3
"""
Script to create an admin user using Supabase service role key
"""

import os
import sys
from supabase import create_client, Client
from app.core.config import settings

def create_admin_user():
    """Create an admin user using Supabase service role key"""
    
    # Admin user details
    ADMIN_EMAIL = "mr.ayushsen@gmail.com"
    ADMIN_PASSWORD = "ayush@123"
    ADMIN_NAME = "Ayush Sen"
    
    try:
        # Initialize Supabase client with service role key (has admin privileges)
        supabase: Client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        
        print(f"🔗 Connected to Supabase: {settings.SUPABASE_URL}")
        
        # Check if user already exists
        try:
            existing_user = supabase.auth.admin.get_user_by_email(ADMIN_EMAIL)
            if existing_user.user:
                print(f"⚠️  User {ADMIN_EMAIL} already exists with ID: {existing_user.user.id}")
                
                # Update user metadata to make them admin
                supabase.auth.admin.update_user_by_id(
                    existing_user.user.id,
                    {
                        "user_metadata": {
                            "name": ADMIN_NAME,
                            "role": "admin",
                            "is_admin": True
                        }
                    }
                )
                print(f"✅ Updated {ADMIN_EMAIL} to admin role")
                return existing_user.user.id
                
        except Exception as e:
            print(f"ℹ️  User doesn't exist yet, creating new user...")
        
        # Create new admin user
        print(f"👤 Creating admin user: {ADMIN_EMAIL}")
        
        user_response = supabase.auth.admin.create_user({
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "email_confirm": True,  # Auto-confirm email
            "user_metadata": {
                "name": ADMIN_NAME,
                "role": "admin",
                "is_admin": True
            }
        })
        
        if user_response.user:
            print(f"✅ Admin user created successfully!")
            print(f"📧 Email: {ADMIN_EMAIL}")
            print(f"🔑 Password: {ADMIN_PASSWORD}")
            print(f"🆔 User ID: {user_response.user.id}")
            print(f"👑 Role: admin")
            
            # Optionally insert admin record in your database
            try:
                # Insert into users table if you have one
                admin_data = {
                    "id": user_response.user.id,
                    "email": ADMIN_EMAIL,
                    "name": ADMIN_NAME,
                    "role": "admin",
                    "is_active": True
                }
                
                # Check if users table exists and insert
                users_response = supabase.table("users").upsert(admin_data).execute()
                print(f"✅ Admin record inserted in users table")
                
            except Exception as db_error:
                print(f"⚠️  Could not insert admin in users table: {db_error}")
                print("   (This is normal if users table doesn't exist)")
            
            return user_response.user.id
            
        else:
            print(f"❌ Failed to create admin user")
            return None
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None


def main():
    """Main function"""
    print("🚀 Creating Supabase Admin User")
    print("=" * 50)
    
    # Check if environment variables are set
    if not settings.SUPABASE_URL:
        print("❌ SUPABASE_URL not found in environment")
        sys.exit(1)
        
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        print("❌ SUPABASE_SERVICE_ROLE_KEY not found in environment")
        sys.exit(1)
    
    # Create admin user
    user_id = create_admin_user()
    
    if user_id:
        print("\n" + "=" * 50)
        print("🎉 Admin user setup complete!")
        
        
        print("\n📝 Next steps:")
        print("1. Use these credentials to login to admin dashboard")
        print("2. Email: mr.ayushsen@gmail.com")
        print("3. Password: ayush@123")
        print("4. Role: admin")
    else:
        print("❌ Failed to create admin user")
        sys.exit(1)

if __name__ == "__main__":
    main()
