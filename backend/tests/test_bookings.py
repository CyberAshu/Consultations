import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock

@pytest.fixture
def mock_booking():
    return {
        "id": 1,
        "client_id": "test-user-id-123",
        "consultant_id": 1,
        "service_id": 1,
        "booking_time": "2024-12-25T10:00:00Z",
        "status": "confirmed"
    }

class TestBookingEndpoints:
    """Test booking endpoints"""

    def test_read_bookings_as_client(self, authenticated_client, mock_booking):
        """Test reading bookings as a client"""
        with patch('app.crud.crud_booking.get_bookings_by_client') as mock_get_bookings:
            mock_get_bookings.return_value = [mock_booking]
            response = authenticated_client.get("/api/v1/bookings/")
            assert response.status_code == 200
            assert response.json()[0]["client_id"] == "test-user-id-123"

    def test_read_bookings_as_rcic(self, rcic_client, mock_booking):
        """Test reading bookings as an RCIC"""
        with patch('app.crud.crud_booking.get_bookings_by_consultant') as mock_get_bookings:
            mock_get_bookings.return_value = [mock_booking]
            response = rcic_client.get("/api/v1/bookings/")
            assert response.status_code == 200
            assert response.json()[0]["consultant_id"] == 1

    def test_read_booking(self, authenticated_client, mock_booking):
        """Test reading a single booking"""
        with patch('app.crud.crud_booking.get_booking') as mock_get_booking:
            mock_get_booking.return_value = mock_booking
            response = authenticated_client.get("/api/v1/bookings/1")
            assert response.status_code == 200
            assert response.json()["id"] == 1

    def test_create_booking(self, authenticated_client, mock_booking):
        """Test creating a booking"""
        with patch('app.crud.crud_booking.create_booking') as mock_create_booking:
            mock_create_booking.return_value = mock_booking
            response = authenticated_client.post("/api/v1/bookings/", json=mock_booking)
            assert response.status_code == 200

    def test_get_consultant_availability(self, client):
        """Test getting consultant availability"""
        with patch('app.crud.crud_booking.get_available_time_slots') as mock_get_slots:
            mock_get_slots.return_value = ["10:00", "11:00"]
            response = client.get("/api/v1/bookings/consultants/1/availability?date=2024-12-25")
            assert response.status_code == 200
            assert "slots" in response.json()

    def test_upload_document(self, authenticated_client, mock_booking):
        """Test uploading a document for a booking"""
        with patch('app.crud.crud_booking.get_booking') as mock_get_booking, \
             patch('app.crud.crud_booking.create_booking_document') as mock_create_doc:
            
            mock_get_booking.return_value = mock_booking
            mock_create_doc.return_value = {"id": 1, "file_name": "test.pdf"}
            
            with open("test.pdf", "wb") as f:
                f.write(b"test content")
            
            with open("test.pdf", "rb") as f:
                response = authenticated_client.post(
                    "/api/v1/bookings/1/documents",
                    files={"file": ("test.pdf", f, "application/pdf")}
                )
            
            assert response.status_code == 200
            assert response.json()["file_name"] == "test.pdf"
