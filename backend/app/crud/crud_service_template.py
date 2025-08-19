from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.service_template import ServiceTemplateCreate, ServiceTemplateUpdate


class CRUDServiceTemplate:
    def create(self, db: Client, *, obj_in: ServiceTemplateCreate) -> Dict[str, Any]:
        """Create a new service template (admin only)"""
        data = obj_in.dict()
        response = db.table("service_templates").insert(data).execute()
        return response.data[0] if response.data else {}

    def get(self, db: Client, template_id: int) -> Optional[Dict[str, Any]]:
        """Get service template by ID"""
        response = db.table("service_templates").select("*").eq("id", template_id).execute()
        return response.data[0] if response.data else None

    def get_multi(self, db: Client, skip: int = 0, limit: int = 100, is_active: bool = True) -> List[Dict[str, Any]]:
        """Get multiple service templates"""
        query = db.table("service_templates").select("*")
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
        
        response = query.order("order_index").range(skip, skip + limit - 1).execute()
        return response.data or []

    def get_all_active(self, db: Client) -> List[Dict[str, Any]]:
        """Get all active service templates ordered by index"""
        response = db.table("service_templates").select("*").eq("is_active", True).order("order_index").execute()
        return response.data or []

    def update(self, db: Client, *, template_id: int, obj_in: ServiceTemplateUpdate) -> Dict[str, Any]:
        """Update service template (admin only)"""
        update_data = obj_in.dict(exclude_unset=True)
        if not update_data:
            return {}
        
        response = db.table("service_templates").update(update_data).eq("id", template_id).execute()
        return response.data[0] if response.data else {}

    def delete(self, db: Client, *, template_id: int) -> bool:
        """Soft delete service template (admin only)"""
        response = db.table("service_templates").update({"is_active": False}).eq("id", template_id).execute()
        return bool(response.data)


service_template = CRUDServiceTemplate()
