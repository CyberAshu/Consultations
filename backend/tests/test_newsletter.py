import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from supabase import Client

class TestNewsletterEndpoints:
    """Test newsletter endpoints"""

    def test_subscribe_newsletter_success(self, client):
        """Test successful newsletter subscription"""
        with patch('app.db.supabase.get_supabase') as mock_get_db:
            mock_db = Mock(spec=Client)
            mock_table = Mock()
            mock_db.table.return_value = mock_table
            
            # Mock no existing subscription
            mock_existing = Mock()
            mock_existing.data = []
            mock_table.select.return_value.eq.return_value.execute.return_value = mock_existing
            
            # Mock successful insertion
            mock_insert = Mock()
            mock_insert.data = [{"email": "test@example.com", "status": "active"}]
            mock_table.insert.return_value.execute.return_value = mock_insert
            
            mock_get_db.return_value = mock_db

            response = client.post(
                "/api/v1/newsletter/subscribe",
                json={"email": "test@example.com"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "subscribed"

    def test_subscribe_newsletter_already_exists(self, client):
        """Test newsletter subscription for existing email"""
        with patch('app.db.supabase.get_supabase') as mock_get_db:
            mock_db = Mock(spec=Client)
            mock_table = Mock()
            mock_db.table.return_value = mock_table
            
            # Mock existing subscription
            mock_existing = Mock()
            mock_existing.data = [{"email": "test@example.com"}]
            mock_table.select.return_value.eq.return_value.execute.return_value = mock_existing
            
            mock_get_db.return_value = mock_db

            response = client.post(
                "/api/v1/newsletter/subscribe",
                json={"email": "test@example.com"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "already_subscribed"

    def test_subscribe_newsletter_invalid_email(self, client):
        """Test newsletter subscription with invalid email"""
        response = client.post(
            "/api/v1/newsletter/subscribe",
            json={"email": "invalid-email"}
        )

        assert response.status_code == 422  # Validation error

    def test_unsubscribe_newsletter(self, client):
        """Test newsletter unsubscription"""
        with patch('app.db.supabase.get_supabase') as mock_get_db:
            mock_db = Mock(spec=Client)
            mock_table = Mock()
            mock_db.table.return_value = mock_table
            
            # Mock successful update
            mock_update = Mock()
            mock_update.data = [{"email": "test@example.com", "status": "unsubscribed"}]
            mock_table.update.return_value.eq.return_value.execute.return_value = mock_update
            
            mock_get_db.return_value = mock_db

            response = client.post(
                "/api/v1/newsletter/unsubscribe",
                json={"email": "test@example.com"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "unsubscribed"
