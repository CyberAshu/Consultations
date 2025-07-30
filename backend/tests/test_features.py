import pytest
from fastapi.testclient import TestClient

class TestFeaturesEndpoints:
    """Test features endpoints"""

    def test_read_testimonials(self, client):
        """Test reading testimonials"""
        response = client.get("/api/v1/features/testimonials")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "quote" in data[0]
            assert "author" in data[0]
            assert "rating" in data[0]

    def test_read_faqs(self, client):
        """Test reading FAQs"""
        response = client.get("/api/v1/features/faqs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "question" in data[0]
            assert "answer" in data[0]

    def test_read_services(self, client):
        """Test reading services"""
        response = client.get("/api/v1/features/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "title" in data[0]
            assert "description" in data[0]
            assert "features" in data[0]
