from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.api import deps
from app.crud import crud_testimonial, crud_faq, crud_service
from app.schemas.testimonial import TestimonialInDB, TestimonialCreate, TestimonialUpdate
from app.schemas.faq import FAQInDB, FAQCreate, FAQUpdate
from app.schemas.service import ServiceInDB, ServiceCreate, ServiceUpdate

router = APIRouter()

@router.get("/testimonials", response_model=List[dict])
def read_testimonials(db: Client = Depends(deps.get_db)) -> Any:
    """
    Retrieve testimonials from database.
    """
    testimonials = crud_testimonial.get_testimonials(db, limit=100)
    return testimonials

@router.get("/faqs", response_model=List[dict])
def read_faqs(db: Client = Depends(deps.get_db)) -> Any:
    """
    Retrieve frequently asked questions from database.
    """
    faqs = crud_faq.get_faqs(db, limit=100)
    return faqs

@router.get("/services", response_model=List[dict])
def read_services(db: Client = Depends(deps.get_db)) -> Any:
    """
    Retrieve services from database.
    """
    services = crud_service.get_services(db, limit=100)
    return services

# POST endpoints for creating data
@router.post("/testimonials", response_model=dict)
def create_testimonial(
    *,
    db: Client = Depends(deps.get_db),
    testimonial_in: TestimonialCreate
) -> Any:
    """
    Create new testimonial.
    """
    testimonial = crud_testimonial.create_testimonial(db=db, obj_in=testimonial_in)
    return testimonial

@router.post("/faqs", response_model=dict)
def create_faq(
    *,
    db: Client = Depends(deps.get_db),
    faq_in: FAQCreate
) -> Any:
    """
    Create new FAQ.
    """
    faq = crud_faq.create_faq(db=db, obj_in=faq_in)
    return faq

@router.post("/services", response_model=dict)
def create_service(
    *,
    db: Client = Depends(deps.get_db),
    service_in: ServiceCreate
) -> Any:
    """
    Create new service.
    """
    service = crud_service.create_service(db=db, obj_in=service_in)
    return service
