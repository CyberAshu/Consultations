from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.service import ServiceCreate, ServiceUpdate


def get_services(
    db: Client, *, skip: int = 0, limit: int = 100, is_active: str = "true"
) -> List[Dict[str, Any]]:
    """Get services from database"""
    query = db.table("services").select("*")
    
    if is_active:
        query = query.eq("is_active", is_active)
    
    result = query.order("order_index").range(skip, skip + limit - 1).execute()
    return result.data if result.data else []


def get_service(db: Client, *, service_id: int) -> Optional[Dict[str, Any]]:
    """Get single service"""
    result = db.table("services").select("*").eq("id", service_id).execute()
    return result.data[0] if result.data else None


def create_service(db: Client, *, obj_in: ServiceCreate) -> Dict[str, Any]:
    """Create new service"""
    service_data = obj_in.dict()
    result = db.table("services").insert(service_data).execute()
    return result.data[0] if result.data else {}


def update_service(
    db: Client, *, service_id: int, obj_in: ServiceUpdate
) -> Optional[Dict[str, Any]]:
    """Update service"""
    update_data = obj_in.dict(exclude_unset=True)
    if not update_data:
        return None
    
    result = db.table("services").update(update_data).eq("id", service_id).execute()
    return result.data[0] if result.data else None


def delete_service(db: Client, *, service_id: int) -> bool:
    """Soft delete service"""
    result = db.table("services").update({"is_active": "false"}).eq("id", service_id).execute()
    return bool(result.data)
