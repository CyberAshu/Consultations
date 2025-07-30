from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.api import deps

router = APIRouter()

@router.get("/testimonials", response_model=List[dict])
def read_testimonials(db: Client = Depends(deps.get_db)) -> Any:
    """
    Retrieve testimonials.
    """
    # This is a mock implementation. In a real application, you would fetch this from your database.
    testimonials = [
        {
            "quote": "My study permit strategy was clarified in 30 minutes! The consultant was incredibly knowledgeable and patient with all my questions.",
            "author": "Deepika K.",
            "role": "International Student from India",
            "rating": 5,
            "flag": "🇮🇳",
            "outcome": "Study Permit Approved",
        },
        {
            "quote": "File review helped avoid rejection. I highly recommend their thorough document analysis service. Saved me months of delays.",
            "author": "Carlos R.",
            "role": "Express Entry Applicant from Mexico",
            "rating": 5,
            "flag": "🇲🇽",
            "outcome": "PR Application Successful",
        },
    ]
    return testimonials

@router.get("/faqs", response_model=List[dict])
def read_faqs(db: Client = Depends(deps.get_db)) -> Any:
    """
    Retrieve frequently asked questions.
    """
    # Mock implementation
    faqs = [
        {
            "question": "Who are your consultants?",
            "answer": "All our consultants are licensed RCICs (Regulated Canadian Immigration Consultants) verified by the College of Immigration and Citizenship Consultants (CICC). Each consultant displays their license number and has been vetted for experience and professionalism.",
        },
        {
            "question": "How do I cancel or reschedule?",
            "answer": "You can cancel or reschedule up to 24 hours before your appointment through your booking confirmation email or by contacting support. Cancellations made less than 24 hours in advance may be subject to a fee.",
        },
    ]
    return faqs

@router.get("/services", response_model=List[dict])
def read_services(db: Client = Depends(deps.get_db)) -> Any:
    """
    Retrieve services.
    """
    # Mock implementation
    services = [
        {
            "icon": "Clock",
            "title": "General Consultations",
            "description": "Time-based immigration consultations",
            "features": [
                "30/45/60 min pay-per-session model",
                "IRCC programs & eligibility",
                "Portal navigation & documentation",
                "Options assessment"
            ],
            "color": "from-blue-600 to-blue-700"
        },
        {
            "icon": "FileText",
            "title": "Document Review",
            "description": "Professional review of your immigration documents",
            "features": [
                "IRCC forms review",
                "SOP & LOE evaluation",
                "Refusal analysis",
                "Live feedback discussion"
            ],
            "color": "from-blue-600 to-blue-700"
        },
    ]
    return services
