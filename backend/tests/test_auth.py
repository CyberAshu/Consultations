import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from supabase import Client


class TestAuthEndpoints:
    """Test authentication endpoints"""

    @patch('app.api.deps.get_db')
    def test_register_success(self, mock_get_db, client):
        """Test successful user registration"""
        mock_db = Mock(spec=Client)
        mock_auth = Mock()
        mock_auth_response = Mock()
        mock_auth_response.user.id = "test-user-id"
        mock_auth_response.user.email = "test@example.com"
        mock_auth_response.user.user_metadata = {"full_name": "Test User", "role": "client"}
        mock_auth_response.user.email_confirmed_at = "2024-01-01T00:00:00Z"
        mock_auth_response.session.access_token = "test_access_token"
        mock_auth_response.session.refresh_token = "test_refresh_token"
        mock_auth_response.session.expires_at = 1234567890
        mock_auth.sign_up.return_value = mock_auth_response
        mock_db.auth = mock_auth
        mock_get_db.return_value = mock_db

        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "testpassword123",
                "full_name": "Test User",
                "role": "client"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["full_name"] == "Test User"
        assert data["session"]["access_token"] == "test_access_token"

    @patch('app.api.deps.get_db')
    def test_register_failure(self, mock_get_db, client):
        """Test registration failure"""
        mock_db = Mock(spec=Client)
        mock_auth = Mock()
        mock_auth_response = Mock()
        mock_auth_response.user = None
        mock_auth.sign_up.return_value = mock_auth_response
        mock_db.auth = mock_auth
        mock_get_db.return_value = mock_db

        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "testpassword123",
                "full_name": "Test User",
                "role": "client"
            }
        )
        assert response.status_code == 400
        assert "Registration failed" in response.json()["detail"]

    @patch('app.api.deps.get_db')
    def test_login_success(self, mock_get_db, client):
        """Test successful login"""
        mock_db = Mock(spec=Client)
        mock_auth = Mock()
        mock_auth_response = Mock()
        mock_auth_response.user.id = "test-user-id"
        mock_auth_response.user.email = "test@example.com"
        mock_auth_response.user.user_metadata = {"full_name": "Test User", "role": "client"}
        mock_auth_response.user.email_confirmed_at = "2024-01-01T00:00:00Z"
        mock_auth_response.session.access_token = "test_access_token"
        mock_auth_response.session.refresh_token = "test_refresh_token"
        mock_auth_response.session.expires_at = 1234567890
        mock_auth.sign_in_with_password.return_value = mock_auth_response
        mock_db.auth = mock_auth
        mock_get_db.return_value = mock_db

        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == "test@example.com"
        assert data["session"]["access_token"] == "test_access_token"

    @patch('app.api.deps.get_db')
    def test_login_invalid_credentials(self, mock_get_db, client):
        """Test login with invalid credentials"""
        mock_db = Mock(spec=Client)
        mock_auth = Mock()
        mock_auth_response = Mock()
        mock_auth_response.user = None
        mock_auth.sign_in_with_password.return_value = mock_auth_response
        mock_db.auth = mock_auth
        mock_get_db.return_value = mock_db

        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 400
        assert "Invalid credentials" in response.json()["detail"]

    @patch('app.api.deps.get_db')
    def test_logout(self, mock_get_db, authenticated_client):
        """Test logout"""
        mock_db = Mock(spec=Client)
        mock_auth = Mock()
        mock_auth.sign_out.return_value = None
        mock_db.auth = mock_auth
        mock_get_db.return_value = mock_db

        response = authenticated_client.post("/api/v1/auth/logout")
        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"

    @patch('app.api.deps.get_db')
    def test_refresh_token_success(self, mock_get_db, client):
        """Test successful token refresh"""
        mock_db = Mock(spec=Client)
        mock_auth = Mock()
        mock_auth_response = Mock()
        mock_auth_response.session.access_token = "new_access_token"
        mock_auth_response.session.refresh_token = "new_refresh_token"
        mock_auth_response.session.expires_at = 1234567890
        mock_auth.refresh_session.return_value = mock_auth_response
        mock_db.auth = mock_auth
        mock_get_db.return_value = mock_db

        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "valid_refresh_token"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "new_access_token"

    @patch('app.api.deps.get_db')
    def test_refresh_token_invalid(self, mock_get_db, client):
        """Test token refresh with invalid token"""
        mock_db = Mock(spec=Client)
        mock_auth = Mock()
        mock_auth_response = Mock()
        mock_auth_response.session = None
        mock_auth.refresh_session.return_value = mock_auth_response
        mock_db.auth = mock_auth
        mock_get_db.return_value = mock_db

        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_refresh_token"}
        )
        assert response.status_code == 401
        assert "Invalid refresh token" in response.json()["detail"]

    @patch('app.api.deps.get_db')
    def test_reset_password(self, mock_get_db, client):
        """Test password reset"""
        mock_db = Mock(spec=Client)
        mock_auth = Mock()
        mock_auth.reset_password_email.return_value = None
        mock_db.auth = mock_auth
        mock_get_db.return_value = mock_db

        response = client.post(
            "/api/v1/auth/reset-password",
            json={"email": "test@example.com"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Password reset email sent"

    def test_get_current_user(self, authenticated_client):
        """Test getting current user info"""
        response = authenticated_client.get("/api/v1/auth/me")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["role"] == "client"

    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without authentication"""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 401
