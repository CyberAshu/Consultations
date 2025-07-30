import pytest
from fastapi.testclient import TestClient
from supabase import Client
from app.main import app
from app.api.deps import get_db, get_current_user
from app.db.supabase import get_supabase
import os
from unittest.mock import Mock

# Test configuration
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpassword123"
TEST_USER_DATA = {
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "full_name": "Test User"
}

@pytest.fixture
def client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture
def db():
    """Create a database client"""
    return get_supabase()

@pytest.fixture
def mock_user():
    """Mock authenticated user"""
    return {
        "id": "test-user-id-123",
        "email": TEST_EMAIL,
        "full_name": "Test User",
        "role": "client",
        "email_verified": True,
        "is_active": True
    }

@pytest.fixture
def admin_user():
    """Mock admin user"""
    return {
        "id": "admin-user-id-123",
        "email": "admin@example.com",
        "full_name": "Admin User",
        "role": "admin",
        "email_verified": True,
        "is_active": True
    }

@pytest.fixture
def rcic_user():
    """Mock RCIC user"""
    return {
        "id": "rcic-user-id-123",
        "email": "rcic@example.com",
        "full_name": "RCIC User",
        "role": "rcic",
        "email_verified": True,
        "is_active": True
    }

@pytest.fixture
def authenticated_client(client, mock_user):
    """Create an authenticated test client"""
    def override_get_current_user():
        return mock_user
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_client(client, admin_user):
    """Create an admin authenticated test client"""
    def override_get_current_user():
        return admin_user
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    app.dependency_overrides.clear()

@pytest.fixture
def rcic_client(client, rcic_user):
    """Create an RCIC authenticated test client"""
    def override_get_current_user():
        return rcic_user
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    app.dependency_overrides.clear()

def pytest_configure(config):
    """Configure pytest"""
    # Ensure we have required environment variables for testing
    if not os.getenv("SUPABASE_URL"):
        os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
    if not os.getenv("SUPABASE_ANON_KEY"):
        os.environ.setdefault("SUPABASE_ANON_KEY", "test_anon_key")
    if not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
        os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test_service_key")
    if not os.getenv("DATABASE_URL"):
        os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")
    if not os.getenv("SECRET_KEY"):
        os.environ.setdefault("SECRET_KEY", "test_secret_key_for_testing_only")
