from typing import Optional, List, Dict, Any
from supabase import Client
from datetime import datetime, timezone
import uuid

class CRUDIntake:
    
    def create_for_user(
        self, 
        db: Client, 
        client_id: str, 
        full_name: Optional[str] = None,
        email: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Create initial intake record for a new user"""
        # Check if intake already exists
        existing = self.get_by_client_id(db, client_id)
        if existing:
            return existing
            
        intake_data = {
            "client_id": client_id,
            "full_name": full_name,
            "email": email,
            "status": "pending",
            "current_stage": 1,
            "completed_stages": []
        }
        
        response = db.table("client_intakes").insert(intake_data).execute()
        return response.data[0] if response.data else None
    
    def get_by_client_id(self, db: Client, client_id: str) -> Optional[Dict[str, Any]]:
        """Get intake by client ID"""
        response = db.table("client_intakes").select("*").eq("client_id", client_id).execute()
        return response.data[0] if response.data else None
    
    def update_stage_data(
        self, 
        db: Client, 
        client_id: str, 
        stage: int, 
        data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update data for a specific stage"""
        db_obj = self.get_by_client_id(db, client_id)
        if not db_obj:
            return None
        
        # Prepare update data
        update_data = data.copy()
        
        # Update current stage if advancing
        if stage > db_obj.get("current_stage", 1):
            update_data["current_stage"] = stage
        
        # Update status to in_progress if still pending
        if db_obj.get("status") == "pending":
            update_data["status"] = "in_progress"
            
        # Set updated timestamp
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        response = db.table("client_intakes").update(update_data).eq("client_id", client_id).execute()
        return response.data[0] if response.data else None
    
    def complete_stage(
        self, 
        db: Client, 
        client_id: str, 
        stage: int
    ) -> Optional[Dict[str, Any]]:
        """Mark a stage as completed"""
        db_obj = self.get_by_client_id(db, client_id)
        if not db_obj:
            return None
        
        # Add stage to completed stages if not already there
        completed_stages = db_obj.get("completed_stages", [])
        if stage not in completed_stages:
            completed_stages.append(stage)
        
        update_data = {
            "completed_stages": completed_stages,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # If all stages are completed, mark intake as complete
        if len(completed_stages) >= 12:
            update_data["status"] = "completed"
            update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        response = db.table("client_intakes").update(update_data).eq("client_id", client_id).execute()
        return response.data[0] if response.data else None
    
    def get_completion_percentage(self, db_obj: Dict[str, Any]) -> float:
        """Calculate completion percentage based on completed stages"""
        completed_stages = db_obj.get("completed_stages", [])
        if not completed_stages:
            return 0.0
        return (len(completed_stages) / 12) * 100
    
    def get_summary(self, db: Client, client_id: str) -> Optional[Dict[str, Any]]:
        """Get intake summary for quick status checks"""
        db_obj = self.get_by_client_id(db, client_id)
        if not db_obj:
            return None
        
        return {
            "id": db_obj.get("id"),
            "client_id": db_obj.get("client_id"),
            "status": db_obj.get("status"),
            "current_stage": db_obj.get("current_stage"),
            "completed_stages": db_obj.get("completed_stages", []),
            "completion_percentage": self.get_completion_percentage(db_obj),
            "created_at": db_obj.get("created_at"),
            "updated_at": db_obj.get("updated_at"),
            "completed_at": db_obj.get("completed_at")
        }
    
    def reset_intake(self, db: Client, client_id: str) -> Optional[Dict[str, Any]]:
        """Reset intake to initial state (for testing/admin purposes)"""
        db_obj = self.get_by_client_id(db, client_id)
        if not db_obj:
            return None
        
        # Reset to initial state
        update_data = {
            "status": "pending",
            "current_stage": 1,
            "completed_stages": [],
            "completed_at": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Clear all stage data (keep basic info)
        stage_fields = [
            'location', 'client_role', 'phone', 'preferred_language', 
            'preferred_language_other', 'timezone', 'consent_acknowledgement',
            'marital_status', 'has_dependants', 'dependants_count', 'dependants_accompanying',
            'highest_education', 'eca_status', 'eca_provider', 'eca_result',
            'language_test_taken', 'test_type', 'test_date', 'language_scores',
            'years_experience', 'noc_codes', 'teer_level', 'regulated_occupation', 'work_country',
            'job_offer_status', 'employer_name', 'job_location', 'wage_offer', 'lmia_status',
            'current_status', 'status_expiry', 'province_residing',
            'proof_of_funds', 'family_ties', 'relationship_type',
            'prior_applications', 'application_outcomes', 'inadmissibility_flags',
            'program_interest', 'province_interest',
            'urgency', 'target_arrival', 'docs_ready'
        ]
        
        for field in stage_fields:
            update_data[field] = None
        
        response = db.table("client_intakes").update(update_data).eq("client_id", client_id).execute()
        return response.data[0] if response.data else None
    
    def is_stage_required_for_role(self, stage: int, client_role: Optional[str]) -> bool:
        """Check if a stage is required based on client role"""
        # Stage 8 (Status in Canada) is only required for those inside Canada
        # This logic can be expanded based on business rules
        if stage == 8:
            # This would need location context, handled in the API layer
            return True
        return True
    
    def get_next_required_stage(self, db_obj: Dict[str, Any]) -> Optional[int]:
        """Get the next stage that needs to be completed"""
        completed_stages = db_obj.get("completed_stages", [])
        
        for stage in range(1, 13):
            if stage not in completed_stages:
                if self.is_stage_required_for_role(stage, db_obj.get("client_role")):
                    return stage
        
        return None  # All required stages completed
    
    def validate_stage_completion(self, db_obj: Dict[str, Any], stage: int) -> Dict[str, Any]:
        """Validate if a stage has all required fields completed"""
        validation_result = {"valid": True, "missing_fields": [], "warnings": []}
        
        # Define required fields per stage
        stage_requirements = {
            1: ["location", "client_role"],
            2: ["full_name", "email", "preferred_language", "timezone", "consent_acknowledgement"],
            3: ["marital_status", "has_dependants"],
            4: ["highest_education"],
            5: [],  # Optional stage
            6: ["years_experience"],
            7: [],  # Conditional based on job offer
            8: [],  # Conditional based on location
            9: ["proof_of_funds"],
            10: ["prior_applications"],
            11: ["program_interest"],
            12: ["urgency"]
        }
        
        required_fields = stage_requirements.get(stage, [])
        
        for field in required_fields:
            value = db_obj.get(field)
            if value is None or (isinstance(value, list) and len(value) == 0):
                validation_result["valid"] = False
                validation_result["missing_fields"].append(field)
        
        # Add conditional validations
        if stage == 2 and db_obj.get("consent_acknowledgement"):
            if len(db_obj.get("consent_acknowledgement", [])) < 3:  # Assuming 3 required consents
                validation_result["valid"] = False
                validation_result["missing_fields"].append("consent_acknowledgement_complete")
        
        if stage == 3 and db_obj.get("has_dependants") and not db_obj.get("dependants_count"):
            validation_result["valid"] = False
            validation_result["missing_fields"].append("dependants_count")
        
        return validation_result

class CRUDIntakeDocument:
    
    def create_for_intake(
        self,
        db: Client,
        intake_id: int,
        file_name: str,
        file_path: str,
        file_size: Optional[int] = None,
        file_type: Optional[str] = None,
        stage: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """Create document associated with intake"""
        doc_data = {
            "intake_id": intake_id,
            "file_name": file_name,
            "file_path": file_path,
            "file_size": file_size,
            "file_type": file_type,
            "stage": stage
        }
        
        response = db.table("intake_documents").insert(doc_data).execute()
        return response.data[0] if response.data else None
    
    def get_by_intake(self, db: Client, intake_id: int) -> List[Dict[str, Any]]:
        """Get all documents for an intake"""
        response = db.table("intake_documents").select("*").eq("intake_id", intake_id).execute()
        return response.data if response.data else []
    
    def get_by_intake_and_stage(self, db: Client, intake_id: int, stage: int) -> List[Dict[str, Any]]:
        """Get documents for specific intake stage"""
        response = db.table("intake_documents").select("*").eq("intake_id", intake_id).eq("stage", stage).execute()
        return response.data if response.data else []

intake = CRUDIntake()
intake_document = CRUDIntakeDocument()