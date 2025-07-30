from supabase import create_client, Client
from app.core.config import settings

def get_supabase() -> Client:
    """Get Supabase client instance with service role key"""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )

def get_supabase_anon() -> Client:
    """Get Supabase client instance with anon key"""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY
    )
