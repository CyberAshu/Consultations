from typing import List, Optional, Dict, Any
from supabase import Client

from app.schemas.service_template import (
    ServiceDurationOptionCreate,
    ServiceDurationOptionUpdate,
)


class CRUDServiceDurationOption:
    def get(self, db: Client, *, option_id: int) -> Optional[Dict[str, Any]]:
        """Get service duration option by ID"""
        response = db.table("service_duration_options").select("*").eq("id", option_id).execute()
        return response.data[0] if response.data else None

    def get_multi(
        self,
        db: Client,
        *,
        skip: int = 0,
        limit: int = 100,
        service_template_id: Optional[int] = None,
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """Get multiple service duration options with filters"""
        query = db.table("service_duration_options").select("*")
        
        if service_template_id is not None:
            query = query.eq("service_template_id", service_template_id)
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
            
        response = query.order("order_index").range(skip, skip + limit - 1).execute()
        return response.data

    def get_by_template(
        self, 
        db: Client, 
        *, 
        service_template_id: int, 
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """Get all duration options for a specific service template"""
        query = db.table("service_duration_options").select("*").eq("service_template_id", service_template_id)
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
            
        response = query.order("order_index").execute()
        return response.data

    def create(self, db: Client, *, obj_in: ServiceDurationOptionCreate) -> Dict[str, Any]:
        """Create new service duration option"""
        obj_data = obj_in.dict()
        response = db.table("service_duration_options").insert(obj_data).execute()
        return response.data[0]

    def update(
        self,
        db: Client,
        *,
        option_id: int,
        obj_in: ServiceDurationOptionUpdate
    ) -> Dict[str, Any]:
        """Update service duration option"""
        obj_data = obj_in.dict(exclude_unset=True)
        if obj_data:  # Only update if there are changes
            obj_data["updated_at"] = "now()"
            response = db.table("service_duration_options").update(obj_data).eq("id", option_id).execute()
            return response.data[0]
        else:
            return self.get(db, option_id=option_id)

    def delete(self, db: Client, *, option_id: int) -> bool:
        """Soft delete service duration option"""
        response = db.table("service_duration_options").update({"is_active": False}).eq("id", option_id).execute()
        return len(response.data) > 0


service_duration_option = CRUDServiceDurationOption()
