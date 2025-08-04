from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.api import deps
from app.crud.crud_consultant_onboarding import consultant_onboarding
from app.schemas.consultant_onboarding import (
    ConsultantOnboardingCreate,
    ConsultantOnboardingUpdate,
    ConsultantOnboardingResponse
)

router = APIRouter()

@router.post("/", response_model=ConsultantOnboardingResponse)
def create_onboarding(
    onboarding_create: ConsultantOnboardingCreate,
    db: Client = Depends(deps.get_db)
):
    """
    Create a consultant onboarding record
    """
    existing_onboarding = consultant_onboarding.get_by_consultant_id(
        db, consultant_id=onboarding_create.consultant_id)
    if existing_onboarding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Onboarding for this consultant already exists"
        )
    return consultant_onboarding.create(db=db, obj_in=onboarding_create)

@router.get("/{onboarding_id}", response_model=ConsultantOnboardingResponse)
def get_onboarding(
    onboarding_id: int,
    db: Client = Depends(deps.get_db)
):
    """
    Get a specific consultant onboarding by ID
    """
    onboarding = consultant_onboarding.get(db=db, id=onboarding_id)
    if not onboarding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant onboarding not found"
        )
    return onboarding

@router.put("/{onboarding_id}", response_model=ConsultantOnboardingResponse)
def update_onboarding(
    onboarding_id: int,
    onboarding_update: ConsultantOnboardingUpdate,
    db: Client = Depends(deps.get_db)
):
    """
    Update a consultant onboarding record
    """
    db_onboarding = consultant_onboarding.get(db=db, id=onboarding_id)
    if not db_onboarding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant onboarding not found"
        )
    return consultant_onboarding.update(
        db=db, db_obj=db_onboarding, obj_in=onboarding_update
    )

@router.post("/{onboarding_id}/complete", response_model=ConsultantOnboardingResponse)
def complete_onboarding(
    onboarding_id: int,
    db: Client = Depends(deps.get_db)
):
    """
    Complete a consultant onboarding process
    """
    db_onboarding = consultant_onboarding.get(db=db, id=onboarding_id)
    if not db_onboarding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant onboarding not found"
        )
    return consultant_onboarding.complete_onboarding(db=db, db_obj=db_onboarding)

@router.delete("/{onboarding_id}")
def delete_onboarding(
    onboarding_id: int,
    db: Client = Depends(deps.get_db)
):
    """
    Delete a consultant onboarding record
    """
    db_onboarding = consultant_onboarding.get(db=db, id=onboarding_id)
    if not db_onboarding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant onboarding not found"
        )
    
    consultant_onboarding.delete(db=db, id=onboarding_id)
    return {"message": "Onboarding deleted successfully"}
