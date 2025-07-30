# User model is no longer needed as users are managed by Supabase Auth
# User data is stored in Supabase's auth.users table
# This file is kept for the UserRole enum which is still used in schemas

import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    client = "client"
    rcic = "rcic"
