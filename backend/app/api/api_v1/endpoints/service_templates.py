from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.api import deps
from app.crud.crud_service_template import service_template
from app.schemas.service_template import (
    ServiceTemplateResponse, 
    ServiceTemplateCreate, 
    ServiceTemplateUpdate
)

router = APIRouter()


@router.get("/", response_model=List[ServiceTemplateResponse])
def read_service_templates(
    *,
    db: Client = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    is_active: bool = True,
) -> Any:
    """
    Retrieve service templates. Available to all users to see available service types.
    """
    templates = service_template.get_multi(
        db, skip=skip, limit=limit, is_active=is_active
    )
    return templates


@router.get("/{template_id}", response_model=ServiceTemplateResponse)
def read_service_template(
    *,
    db: Client = Depends(deps.get_db),
    template_id: int,
) -> Any:
    """
    Get service template by ID.
    """
    template = service_template.get(db=db, template_id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Service template not found")
    return template


@router.post("/", response_model=ServiceTemplateResponse)
def create_service_template(
    *,
    db: Client = Depends(deps.get_admin_db),  # Admin only
    template_in: ServiceTemplateCreate,
) -> Any:
    """
    Create new service template. Admin only.
    """
    template = service_template.create(db=db, obj_in=template_in)
    return template


@router.put("/{template_id}", response_model=ServiceTemplateResponse)
def update_service_template(
    *,
    db: Client = Depends(deps.get_admin_db),  # Admin only
    template_id: int,
    template_in: ServiceTemplateUpdate,
) -> Any:
    """
    Update service template. Admin only.
    """
    db_template = service_template.get(db=db, template_id=template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="Service template not found")
    
    template = service_template.update(
        db=db, template_id=template_id, obj_in=template_in
    )
    return template


@router.delete("/{template_id}")
def delete_service_template(
    *,
    db: Client = Depends(deps.get_admin_db),  # Admin only
    template_id: int,
) -> Any:
    """
    Soft delete service template. Admin only.
    """
    template = service_template.get(db=db, template_id=template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Service template not found")
    
    success = service_template.delete(db=db, template_id=template_id)
    return {"success": success}
