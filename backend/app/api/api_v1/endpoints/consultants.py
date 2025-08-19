from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.api import deps
from app.crud import crud_consultant
from app.crud.crud_service_template import service_template
from app.schemas.consultant import ConsultantInDB, ConsultantCreate, ConsultantUpdate, ConsultantServiceCreate, ConsultantReviewCreate
from app.schemas.service_template import ServiceTemplateResponse

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
    consultants = crud_consultant.consultant.get_multi(db, skip=skip, limit=limit)
    
    # Apply filters
    filtered_consultants = consultants
    
    # Filter by language
    if language:
        filtered_consultants = [c for c in filtered_consultants if language in c.get('languages', [])]
    
    # Filter by province
    if province:
        filtered_consultants = [c for c in filtered_consultants if province in c.get('location', '')]
    
    # Filter by specialty
    if specialty:
        filtered_consultants = [c for c in filtered_consultants if specialty in c.get('specialties', [])]
    
    # Filter by search term (name, bio, specialties, languages)
    if search:
        search_lower = search.lower()
        filtered_consultants = [
            c for c in filtered_consultants 
            if search_lower in c.get('name', '').lower() or
               search_lower in c.get('bio', '').lower() or
               any(search_lower in spec.lower() for spec in c.get('specialties', [])) or
               any(search_lower in lang.lower() for lang in c.get('languages', []))
        ]
    
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
    consultant = crud_consultant.consultant.get(db=db, consultant_id=consultant_id)
    if not consultant:
        raise HTTPException(status_code=404, detail="Consultant not found")
    # Add services to the consultant object
    services = crud_consultant.get_services_by_consultant(db=db, consultant_id=consultant_id)
    consultant["services"] = services
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
    consultant = crud_consultant.consultant.create(db=db, obj_in=consultant_in)
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
    consultant = crud_consultant.consultant.update(
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
    Create service for consultant - must be based on a template.
    RCICs can only create services from the 8 predefined templates.
    """
    # Enforce that service_template_id is provided
    service_data = service_in.dict()
    if "service_template_id" not in service_data:
        raise HTTPException(
            status_code=400, 
            detail="service_template_id is required. Custom services are not allowed."
        )
    
    service_data["consultant_id"] = consultant_id
    try:
        service = crud_consultant.create_consultant_service(db=db, obj_in=service_data)
        return service
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{consultant_id}/services/{service_id}")
def update_consultant_service(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
    service_id: int,
    service_in: ConsultantServiceCreate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update service for consultant. Price and description can be modified within template constraints.
    """
    try:
        service = crud_consultant.update_consultant_service(
            db=db, service_id=service_id, obj_in=service_in
        )
        return service
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{consultant_id}/services")
def get_consultant_services(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all services for a consultant (for consultant's own management).
    Shows all services (active and inactive) so consultant can manage them.
    """
    # Get consultant info to verify ownership
    consultant = crud_consultant.consultant.get_by_user_id(db, current_user["id"])
    
    if not consultant or consultant["id"] != consultant_id:
        # If not the consultant themselves, only show active services
        services = crud_consultant.get_services_by_consultant(db=db, consultant_id=consultant_id, active_only=True)
    else:
        # If it's the consultant's own request, show all services
        services = crud_consultant.get_services_by_consultant(db=db, consultant_id=consultant_id, active_only=False)
    
    return services

@router.get("/{consultant_id}/services/active")
def get_consultant_active_services(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
) -> Any:
    """
    Get only active services for a consultant (public endpoint for booking).
    This is what clients see when they want to book services.
    """
    services = crud_consultant.get_services_by_consultant(db=db, consultant_id=consultant_id, active_only=True)
    return services

@router.patch("/{consultant_id}/services/{service_id}/toggle")
def toggle_consultant_service_status(
    *,
    db: Client = Depends(deps.get_db),
    consultant_id: int,
    service_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Toggle service active/inactive status for consultant.
    RCICs can only activate or deactivate their services, not delete them.
    """
    try:
        # Get current service status
        current_service = db.table("consultant_services").select("*").eq("id", service_id).eq("consultant_id", consultant_id).execute()
        
        if not current_service.data:
            raise HTTPException(
                status_code=404,
                detail="Service not found or doesn't belong to this consultant"
            )
        
        service = current_service.data[0]
        current_status = service.get("is_active", False)
        new_status = not current_status
        
        # Update the service status
        response = db.table("consultant_services").update({"is_active": new_status}).eq("id", service_id).execute()
        
        if response.data:
            status_text = "activated" if new_status else "deactivated"
            return {
                "success": True,
                "message": f"Service {status_text} successfully",
                "service_id": service_id,
                "is_active": new_status,
                "service_name": service.get("name", "")
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to update service status"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating service status: {str(e)}"
        )

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
