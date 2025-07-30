from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.api import deps
from app.crud import crud_consultant
from app.schemas.consultant import ConsultantInDB, ConsultantCreate, ConsultantUpdate, ConsultantServiceCreate, ConsultantReviewCreate

router = APIRouter()

@router.get("/", response_model=List[ConsultantInDB])
def read_consultants(
    db: Client = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    language: str = Query(None),
    province: str = Query(None),
    specialty: str = Query(None),
    search: str = Query(None),
) -> Any:
    """
    Retrieve consultants with optional filtering.
    """
    # For now, get all consultants and filter in memory
    # In production, you would implement database-level filtering
    consultants = crud_consultant.get_consultants(db, skip=skip, limit=limit)
    
    # Apply filters (mock implementation)
    filtered_consultants = consultants
    
    # TODO: Implement actual filtering in crud_consultant
    # if language:
    #     filtered_consultants = [c for c in filtered_consultants if language in c.get('languages', [])]
    # if province:
    #     filtered_consultants = [c for c in filtered_consultants if province in c.get('location', '')]
    # if specialty:
    #     filtered_consultants = [c for c in filtered_consultants if specialty in c.get('specialties', [])]
    # if search:
    #     filtered_consultants = [c for c in filtered_consultants if search.lower() in c.get('name', '').lower()]
    
    return filtered_consultants

@router.get("/{consultant_id}", response_model=ConsultantInDB)
def read_consultant(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
) -> Any:
    """
    Get consultant by ID.
    """
    consultant = crud_consultant.get_consultant(db=db, consultant_id=consultant_id)
    if not consultant:
        raise HTTPException(status_code=404, detail="Consultant not found")
    return consultant

@router.post("/", response_model=ConsultantInDB)
def create_consultant(
    *,
    db: Client = Depends(deps.get_db),
    consultant_in: ConsultantCreate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new consultant.
    """
    consultant = crud_consultant.create_consultant(db=db, obj_in=consultant_in)
    return consultant

@router.put("/{consultant_id}", response_model=ConsultantInDB)
def update_consultant(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
    consultant_in: ConsultantUpdate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update consultant.
    """
    consultant = crud_consultant.update_consultant(
        db=db, consultant_id=consultant_id, obj_in=consultant_in
    )
    return consultant

@router.post("/{consultant_id}/services")
def create_consultant_service(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
    service_in: ConsultantServiceCreate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create service for consultant.
    """
    service_data = service_in.dict()
    service_data["consultant_id"] = consultant_id
    service = crud_consultant.create_consultant_service(db=db, obj_in=service_data)
    return service

@router.post("/{consultant_id}/reviews")
def create_consultant_review(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
    review_in: ConsultantReviewCreate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create review for consultant.
    """
    review_data = review_in.dict()
    review_data["consultant_id"] = consultant_id
    review_data["client_id"] = current_user["id"]
    review = crud_consultant.create_consultant_review(db=db, obj_in=review_data)
    return review
