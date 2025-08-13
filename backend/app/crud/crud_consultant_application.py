from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.consultant_application import (
    ConsultantApplicationCreate,
    ConsultantApplicationUpdate
)

class CRUDConsultantApplication:
    def create(self, db: Client, *, obj_in: ConsultantApplicationCreate) -> Dict[str, Any]:
        """Create a new consultant application"""
        try:
            data = obj_in.dict()
            # Convert datetime objects to ISO strings for JSON serialization
            if data.get('submission_date'):
                data['submission_date'] = data['submission_date'].isoformat()
            if data.get('date_of_birth'):
                data['date_of_birth'] = data['date_of_birth'].isoformat()
            
            # Add default status if not provided
            if 'status' not in data or data['status'] is None:
                data['status'] = 'pending'
            
            # Remove None values to avoid potential issues
            clean_data = {k: v for k, v in data.items() if v is not None}
            
            print(f"DEBUG: Attempting to insert consultant application with data keys: {list(clean_data.keys())}")
            print(f"DEBUG: Email: {clean_data.get('email')}, RCIC: {clean_data.get('rcic_license_number')}")
            
            response = db.table("consultant_applications").insert(clean_data).execute()
            
            if not response.data:
                raise Exception("No data returned from insert operation")
                
            return response.data[0]
        except Exception as e:
            print(f"ERROR in consultant_application.create: {str(e)}")
            print(f"ERROR type: {type(e)}")
            raise

    def get(self, db: Client, id: int) -> Optional[Dict[str, Any]]:
        """Get a consultant application by ID"""
        response = db.table("consultant_applications").select("*").eq("id", id).execute()
        return response.data[0] if response.data else None

    def get_by_email(self, db: Client, email: str) -> Optional[Dict[str, Any]]:
        """Get a consultant application by email"""
        response = db.table("consultant_applications").select("*").eq("email", email).execute()
        return response.data[0] if response.data else None

    def get_by_rcic_number(self, db: Client, rcic_number: str) -> Optional[Dict[str, Any]]:
        """Get a consultant application by RCIC license number"""
        response = db.table("consultant_applications").select("*").eq("rcic_license_number", rcic_number).execute()
        return response.data[0] if response.data else None

    def get_multi(
        self, 
        db: Client, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get multiple consultant applications with optional status filter"""
        query = db.table("consultant_applications").select("*")
        
        if status:
            query = query.eq("status", status)
            
        response = query.range(skip, skip + limit - 1).execute()
        return response.data if response.data else []

    def update(
        self, 
        db: Client, 
        *, 
        db_obj: Dict[str, Any], 
        obj_in: ConsultantApplicationUpdate
    ) -> Dict[str, Any]:
        """Update a consultant application"""
        from datetime import datetime, date
        
        update_dict = obj_in.dict(exclude_unset=True)
        
        # Convert datetime objects to ISO strings for JSON serialization
        for key, value in update_dict.items():
            if isinstance(value, datetime):
                update_dict[key] = value.isoformat()
            elif isinstance(value, date):
                update_dict[key] = value.isoformat()
        
        response = db.table("consultant_applications").update(update_dict).eq("id", db_obj["id"]).execute()
        return response.data[0] if response.data else {}

    def approve(self, db: Client, *, db_obj: Dict[str, Any]) -> Dict[str, Any]:
        """Approve a consultant application"""
        response = db.table("consultant_applications").update({"status": "approved"}).eq("id", db_obj["id"]).execute()
        return response.data[0] if response.data else {}

    def reject(self, db: Client, *, db_obj: Dict[str, Any]) -> Dict[str, Any]:
        """Reject a consultant application"""
        response = db.table("consultant_applications").update({"status": "rejected"}).eq("id", db_obj["id"]).execute()
        return response.data[0] if response.data else {}

    def delete(self, db: Client, *, id: int) -> bool:
        """Delete a consultant application"""
        response = db.table("consultant_applications").delete().eq("id", id).execute()
        return bool(response.data)

    def get_stats(self, db: Client) -> dict:
        """Get application statistics"""
        # Get all applications
        all_apps = db.table("consultant_applications").select("status").execute()
        
        if not all_apps.data:
            return {"total": 0, "pending": 0, "approved": 0, "rejected": 0}
        
        total = len(all_apps.data)
        pending = len([app for app in all_apps.data if app.get("status") == "pending"])
        approved = len([app for app in all_apps.data if app.get("status") == "approved"])
        rejected = len([app for app in all_apps.data if app.get("status") == "rejected"])
        
        return {
            "total": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected
        }

consultant_application = CRUDConsultantApplication()
