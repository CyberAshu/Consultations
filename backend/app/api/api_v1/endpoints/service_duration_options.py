from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.api import deps
from app.crud.crud_service_duration_option import service_duration_option
from app.schemas.service_template import (
    ServiceDurationOptionInDB,
    ServiceDurationOptionCreate,
    ServiceDurationOptionUpdate,
)

router = APIRouter()


@router.get("/template/{template_id}", response_model=List[ServiceDurationOptionInDB])
def read_duration_options_by_template(
    *,
    db: Client = Depends(deps.get_db),
    template_id: int,
    is_active: bool = True,
) -> Any:
    """
    Get duration options for a specific service template.
    Available to all authenticated users for viewing available duration options.
    """
    options = service_duration_option.get_by_template(
        db, service_template_id=template_id, is_active=is_active
    )
    return options


@router.get("/{option_id}", response_model=ServiceDurationOptionInDB)
def read_duration_option(
    *,
    db: Client = Depends(deps.get_db),
    option_id: int,
) -> Any:
    """
    Get duration option by ID.
    """
    option = service_duration_option.get(db=db, option_id=option_id)
    if not option:
        raise HTTPException(status_code=404, detail="Duration option not found")
    return option


@router.post("/", response_model=ServiceDurationOptionInDB)
def create_duration_option(
    *,
    db: Client = Depends(deps.get_admin_db),  # Admin only
    option_in: ServiceDurationOptionCreate,
) -> Any:
    """
    Create new service duration option. Admin only.
    """
    option = service_duration_option.create(db=db, obj_in=option_in)
    return option


@router.put("/{option_id}", response_model=ServiceDurationOptionInDB)
def update_duration_option(
    *,
    db: Client = Depends(deps.get_admin_db),  # Admin only
    option_id: int,
    option_in: ServiceDurationOptionUpdate,
) -> Any:
    """
    Update service duration option. Admin only.
    """
    db_option = service_duration_option.get(db=db, option_id=option_id)
    if not db_option:
        raise HTTPException(status_code=404, detail="Duration option not found")
    
    option = service_duration_option.update(
        db=db, option_id=option_id, obj_in=option_in
    )
    return option


@router.delete("/{option_id}")
def delete_duration_option(
    *,
    db: Client = Depends(deps.get_admin_db),  # Admin only
    option_id: int,
) -> Any:
    """
    Soft delete service duration option. Admin only.
    """
    option = service_duration_option.get(db=db, option_id=option_id)
    if not option:
        raise HTTPException(status_code=404, detail="Duration option not found")
    
    success = service_duration_option.delete(db=db, option_id=option_id)
    return {"success": success}
