import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock

# Mock data matching the schemas
mock_consultant_data = {
    "id": 1,
    "user_id": 1,
    "rcic_number": "R123456",
    "location": "Toronto, ON",
    "timezone": "America/Toronto",
    "languages": ["English", "Mandarin"],
    "specialties": ["Express Entry", "Study Permits"],
    "bio": "Experienced immigration consultant.",
    "experience": "8+ years",
    "success_rate": "96%",
    "calendly_url": "https://calendly.com/drsarahchen",
    "is_verified": True,
    "is_available": True,
    "rating": 4.9,
    "review_count": 127,
    "services": [],
    "reviews": []
}

mock_consultants_list = [mock_consultant_data]

mock_service_data = {
    "name": "30-Minute Consultation",
    "duration": "30 min",
    "price": 60.0,
    "description": "Quick guidance and general questions."
}

mock_review_data = {
    "rating": 5,
    "comment": "Excellent service!",
    "outcome": "PR Application Successful"
}

class TestConsultantEndpoints:
    """Test consultant endpoints"""

    @patch('app.crud.crud_consultant.get_consultants')
    def test_read_consultants(self, mock_get_all, client):
        mock_get_all.return_value = mock_consultants_list
        response = client.get("/api/v1/consultants/")
        assert response.status_code == 200
        assert len(response.json()) == 1

    @patch('app.crud.crud_consultant.get_consultant')
    def test_read_consultant(self, mock_get_one, client):
        mock_get_one.return_value = mock_consultant_data
        response = client.get("/api/v1/consultants/1")
        assert response.status_code == 200
        assert response.json()["rcic_number"] == "R123456"

    def test_read_consultant_not_found(self, client):
        with patch('app.crud.crud_consultant.get_consultant') as mock_get_one:
            mock_get_one.return_value = None
            response = client.get("/api/v1/consultants/999")
            assert response.status_code == 404

    @patch('app.crud.crud_consultant.create_consultant')
    def test_create_consultant(self, mock_create, admin_client):
        # Correctly format data for ConsultantCreate schema
        create_data = {
            "user_id": 2, # Assume a new user ID
            "rcic_number": "R987654",
            "location": "Vancouver, BC",
            "languages": ["English", "French"],
            "specialties": ["Family Sponsorship"]
        }
        mock_create.return_value = {
            **create_data, 
            "id": 2, 
            "rating": 0, 
            "review_count": 0, 
            "services": [], 
            "reviews": []
        }
        response = admin_client.post("/api/v1/consultants/", json=create_data)
        assert response.status_code == 200

    @patch('app.crud.crud_consultant.create_consultant_service')
    def test_create_service(self, mock_create_service, admin_client):
        mock_create_service.return_value = {**mock_service_data, "id": 1, "consultant_id": 1}
        response = admin_client.post("/api/v1/consultants/1/services", json=mock_service_data)
        assert response.status_code == 200

    @patch('app.crud.crud_consultant.create_consultant_review')
    def test_create_review(self, mock_create_review, authenticated_client):
        # Correctly format data for ConsultantReviewCreate schema
        review_create_data = {
            **mock_review_data,
            "consultant_id": 1,
            "client_id": 123 # from mock_user
        }
        mock_create_review.return_value = {**review_create_data, "id": 1}
        response = authenticated_client.post("/api/v1/consultants/1/reviews", json=review_create_data)
        assert response.status_code == 200
