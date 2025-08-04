from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Immigration Consultations API"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Email (required for notifications)
    SMTP_TLS: bool
    SMTP_PORT: int
    SMTP_HOST: str
    SMTP_USER: str
    SMTP_PASSWORD: str
    FROM_EMAIL: Optional[str] = None
    FROM_NAME: Optional[str] = "Immigration Connect Team"
    
    # Stripe
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # File Upload
    MAX_FILE_SIZE_MB: Optional[int] = 10
    ALLOWED_FILE_TYPES: Optional[str] = None
    
    # Redis
    REDIS_URL: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields

settings = Settings()
