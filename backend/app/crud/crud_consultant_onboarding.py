from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.consultant_onboarding import (
    ConsultantOnboardingCreate,
    ConsultantOnboardingUpdate
)

class CRUDConsultantOnboarding:
    def create(self, db: Client, *, obj_in: ConsultantOnboardingCreate) -> Dict[str, Any]:
        """Create a new consultant onboarding record"""
        data = obj_in.dict()
        response = db.table("consultant_onboarding").insert(data).execute()
        return response.data[0] if response.data else {}

    def get(self, db: Client, id: int) -> Optional[Dict[str, Any]]:
        """Get a consultant onboarding record by ID"""
        response = db.table("consultant_onboarding").select("*").eq("id", id).execute()
        return response.data[0] if response.data else None

    def get_by_consultant_id(self, db: Client, consultant_id: int) -> Optional[Dict[str, Any]]:
        """Get a consultant onboarding record by consultant ID"""
        response = db.table("consultant_onboarding").select("*").eq("consultant_id", consultant_id).execute()
        return response.data[0] if response.data else None

    def get_by_application_id(self, db: Client, application_id: int) -> Optional[Dict[str, Any]]:
        """Get a consultant onboarding record by application ID"""
        response = db.table("consultant_onboarding").select("*").eq("application_id", application_id).execute()
        return response.data[0] if response.data else None

    def update(
        self, 
        db: Client, 
        *, 
        db_obj: Dict[str, Any], 
        obj_in: ConsultantOnboardingUpdate
    ) -> Dict[str, Any]:
        """Update a consultant onboarding record"""
        update_dict = obj_in.dict(exclude_unset=True)
        
        # Handle completion status
        if update_dict.get('onboarding_completed'):
            from datetime import datetime
            update_dict['completed_at'] = datetime.now().isoformat()
        
        response = db.table("consultant_onboarding").update(update_dict).eq("id", db_obj["id"]).execute()
        return response.data[0] if response.data else {}

    def update_step(self, db: Client, *, db_obj: Dict[str, Any], step: int) -> Dict[str, Any]:
        """Update the current step of onboarding"""
        response = db.table("consultant_onboarding").update({"current_step": step}).eq("id", db_obj["id"]).execute()
        return response.data[0] if response.data else {}

    def complete_onboarding(self, db: Client, *, db_obj: Dict[str, Any]) -> Dict[str, Any]:
        """Mark onboarding as completed"""
        from datetime import datetime
        update_data = {
            "onboarding_completed": True,
            "completed_at": datetime.now().isoformat()
        }
        response = db.table("consultant_onboarding").update(update_data).eq("id", db_obj["id"]).execute()
        return response.data[0] if response.data else {}

    def delete(self, db: Client, *, id: int) -> bool:
        """Delete a consultant onboarding record"""
        response = db.table("consultant_onboarding").delete().eq("id", id).execute()
        return bool(response.data)

consultant_onboarding = CRUDConsultantOnboarding()
