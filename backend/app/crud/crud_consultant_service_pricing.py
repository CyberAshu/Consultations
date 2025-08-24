from typing import List, Optional, Dict, Any
from supabase import Client

from app.schemas.consultant import (
    ConsultantServicePricingCreate,
    ConsultantServicePricingUpdate,
)


class CRUDConsultantServicePricing:
    def get(self, db: Client, *, pricing_id: int) -> Optional[Dict[str, Any]]:
        """Get consultant service pricing by ID"""
        response = db.table("consultant_service_pricing").select("*").eq("id", pricing_id).execute()
        return response.data[0] if response.data else None

    def get_multi(
        self,
        db: Client,
        *,
        skip: int = 0,
        limit: int = 100,
        consultant_service_id: Optional[int] = None,
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """Get multiple consultant service pricing entries with filters"""
        query = db.table("consultant_service_pricing").select("*")
        
        if consultant_service_id is not None:
            query = query.eq("consultant_service_id", consultant_service_id)
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
            
        response = query.order("created_at").range(skip, skip + limit - 1).execute()
        return response.data

    def get_by_service(
        self, 
        db: Client, 
        *, 
        consultant_service_id: int, 
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """Get all pricing options for a specific consultant service"""
        query = db.table("consultant_service_pricing").select("*").eq("consultant_service_id", consultant_service_id)
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
            
        response = query.execute()
        return response.data

    def get_by_service_with_duration(
        self, 
        db: Client, 
        *, 
        consultant_service_id: int, 
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """Get all pricing options for a consultant service with duration details"""
        query = (
            db.table("consultant_service_pricing")
            .select("*, duration_option:service_duration_options(*)")
            .eq("consultant_service_id", consultant_service_id)
        )
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
            
        response = query.execute()
        return response.data

    def get_price_by_duration(
        self,
        db: Client,
        *,
        consultant_service_id: int,
        duration_option_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get specific pricing for a service and duration combination"""
        response = (
            db.table("consultant_service_pricing")
            .select("*")
            .eq("consultant_service_id", consultant_service_id)
            .eq("duration_option_id", duration_option_id)
            .eq("is_active", True)
            .execute()
        )
        return response.data[0] if response.data else None

    def create(self, db: Client, *, obj_in: ConsultantServicePricingCreate) -> Dict[str, Any]:
        """Create new consultant service pricing"""
        # Check for any existing pricing (active or inactive) for this combination
        existing_response = (
            db.table("consultant_service_pricing")
            .select("*")
            .eq("consultant_service_id", obj_in.consultant_service_id)
            .eq("duration_option_id", obj_in.duration_option_id)
            .execute()
        )
        
        if existing_response.data:
            existing = existing_response.data[0]
            # If pricing already exists, update it instead of creating new
            update_data = {
                "price": obj_in.price,
                "is_active": obj_in.is_active,
                "updated_at": "now()"
            }
            response = db.table("consultant_service_pricing").update(update_data).eq("id", existing["id"]).execute()
            return response.data[0]
        
        # Validate price is within the duration option's range
        duration_option = db.table("service_duration_options").select("min_price, max_price").eq("id", obj_in.duration_option_id).execute()
        if duration_option.data:
            option = duration_option.data[0]
            if obj_in.price < option["min_price"] or obj_in.price > option["max_price"]:
                raise ValueError(f"Price must be between ${option['min_price']} and ${option['max_price']}")
        
        obj_data = obj_in.dict()
        response = db.table("consultant_service_pricing").insert(obj_data).execute()
        return response.data[0]

    def update(
        self,
        db: Client,
        *,
        pricing_id: int,
        obj_in: ConsultantServicePricingUpdate
    ) -> Dict[str, Any]:
        """Update consultant service pricing"""
        obj_data = obj_in.dict(exclude_unset=True)
        if obj_data:  # Only update if there are changes
            # If price is being updated, validate it's within range
            if "price" in obj_data:
                pricing_record = self.get(db, pricing_id=pricing_id)
                if pricing_record:
                    duration_option = db.table("service_duration_options").select("min_price, max_price").eq("id", pricing_record["duration_option_id"]).execute()
                    if duration_option.data:
                        option = duration_option.data[0]
                        if obj_data["price"] < option["min_price"] or obj_data["price"] > option["max_price"]:
                            raise ValueError(f"Price must be between ${option['min_price']} and ${option['max_price']}")
            
            obj_data["updated_at"] = "now()"
            response = db.table("consultant_service_pricing").update(obj_data).eq("id", pricing_id).execute()
            return response.data[0]
        else:
            return self.get(db, pricing_id=pricing_id)

    def bulk_upsert(
        self,
        db: Client,
        *,
        consultant_service_id: int,
        pricing_options: List[ConsultantServicePricingCreate]
    ) -> List[Dict[str, Any]]:
        """Bulk upsert pricing options for a consultant service"""
        results = []
        
        for pricing_create in pricing_options:
            # Set the consultant_service_id
            pricing_create.consultant_service_id = consultant_service_id
            
            # Check if pricing already exists
            existing = self.get_price_by_duration(
                db,
                consultant_service_id=consultant_service_id,
                duration_option_id=pricing_create.duration_option_id
            )
            
            if existing:
                # Update existing pricing
                update_data = ConsultantServicePricingUpdate(
                    price=pricing_create.price,
                    is_active=pricing_create.is_active
                )
                result = self.update(db, pricing_id=existing["id"], obj_in=update_data)
            else:
                # Create new pricing
                result = self.create(db, obj_in=pricing_create)
            
            results.append(result)
        
        return results

    def delete(self, db: Client, *, pricing_id: int) -> bool:
        """Soft delete consultant service pricing"""
        response = db.table("consultant_service_pricing").update({"is_active": False}).eq("id", pricing_id).execute()
        return len(response.data) > 0

    def delete_by_service(self, db: Client, *, consultant_service_id: int) -> bool:
        """Soft delete all pricing for a consultant service"""
        response = (
            db.table("consultant_service_pricing")
            .update({"is_active": False})
            .eq("consultant_service_id", consultant_service_id)
            .execute()
        )
        return len(response.data) > 0


consultant_service_pricing = CRUDConsultantServicePricing()
