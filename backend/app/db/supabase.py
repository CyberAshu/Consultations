from supabase import create_client, Client
from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# SQLAlchemy setup
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Get a SQLAlchemy database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_supabase() -> Client:
    """Get Supabase client instance with service role key"""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )

def get_supabase_admin() -> Client:
    """Get Supabase client instance with service role key that bypasses RLS"""
    client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )
    # Service role bypasses RLS by default, but ensure it's explicit
    return client

def get_supabase_anon() -> Client:
    """Get Supabase client instance with anon key"""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY
    )
