from typing import List, Optional, Dict, Any
from supabase import Client
from datetime import datetime
import json
from app.schemas.consultant_application import (
    ConsultantApplicationCreate,
    ConsultantApplicationUpdate,
    ConsultantApplicationInitialCreate
)

class CRUDConsultantApplication:
    def _process_json_fields(self, app: Dict[str, Any]) -> Dict[str, Any]:
        """Process JSON fields to ensure they are properly parsed"""
        json_fields = ['admin_notes', 'additional_documents', 'areas_of_expertise', 'other_languages', 'sections_requested']
        
        for field in json_fields:
            if field in app and app[field] is not None:
                if isinstance(app[field], str):
                    try:
                        app[field] = json.loads(app[field])
                    except (json.JSONDecodeError, ValueError):
                        # If parsing fails, leave as is or set default
                        if field in ['admin_notes', 'additional_documents', 'areas_of_expertise', 'other_languages', 'sections_requested']:
                            app[field] = []
                        
        # Ensure admin_notes is a list if it exists
        if 'admin_notes' in app and app['admin_notes'] is not None:
            if not isinstance(app['admin_notes'], list):
                app['admin_notes'] = []
                
        return app
    def create(self, db: Client, *, obj_in: ConsultantApplicationCreate | ConsultantApplicationInitialCreate) -> Dict[str, Any]:
        """Create a new consultant application"""
        try:
            data = obj_in.dict()
            
            # Handle initial application creation (only Section 1)
            if isinstance(obj_in, ConsultantApplicationInitialCreate):
                # Set default values for required fields that are not in initial submission
                data.update({
                    'rcic_license_number': None,  # Will be filled later
                    'practice_type': 'independent',  # Default value
                    'confirm_licensed_rcic': False,  # Will be filled later
                    'agree_terms_guidelines': False,  # Will be filled later
                    'agree_compliance_irpa': False,  # Will be filled later
                    'agree_no_outside_contact': False,  # Will be filled later
                    'consent_session_reviews': False,  # Will be filled later
                    'digital_signature_name': '',  # Will be filled later
                    'submission_date': datetime.now().isoformat()
                })
            
            # Convert datetime objects to ISO strings for JSON serialization
            if data.get('submission_date') and not isinstance(data['submission_date'], str):
                data['submission_date'] = data['submission_date'].isoformat()
            if data.get('date_of_birth') and not isinstance(data['date_of_birth'], str):
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
        if response.data:
            app = response.data[0]
            # Process JSON fields
            app = self._process_json_fields(app)
            # Provide default values for new fields if they don't exist
            for i in range(1, 8):
                field_name = f"section_{i}_completed"
                if field_name not in app or app[field_name] is None:
                    app[field_name] = False
            return app
        return None

    def get_by_email(self, db: Client, email: str) -> Optional[Dict[str, Any]]:
        """Get a consultant application by email"""
        response = db.table("consultant_applications").select("*").eq("email", email).execute()
        if response.data:
            app = response.data[0]
            # Process JSON fields
            app = self._process_json_fields(app)
            # Provide default values for new fields if they don't exist
            for i in range(1, 8):
                field_name = f"section_{i}_completed"
                if field_name not in app or app[field_name] is None:
                    app[field_name] = False
            return app
        return None

    def get_by_rcic_number(self, db: Client, rcic_number: str) -> Optional[Dict[str, Any]]:
        """Get a consultant application by RCIC license number"""
        response = db.table("consultant_applications").select("*").eq("rcic_license_number", rcic_number).execute()
        if response.data:
            app = response.data[0]
            # Process JSON fields
            app = self._process_json_fields(app)
            # Provide default values for new fields if they don't exist
            for i in range(1, 8):
                field_name = f"section_{i}_completed"
                if field_name not in app or app[field_name] is None:
                    app[field_name] = False
            return app
        return None

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
        if response.data:
            # Process JSON fields and provide default values for new fields if they don't exist
            for i, app in enumerate(response.data):
                # Process JSON fields
                response.data[i] = self._process_json_fields(app)
                # Provide default values for section completion fields
                for j in range(1, 8):
                    field_name = f"section_{j}_completed"
                    if field_name not in response.data[i] or response.data[i][field_name] is None:
                        response.data[i][field_name] = False
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
        
        if response.data:
            updated_app = response.data[0]
            # Process JSON fields
            updated_app = self._process_json_fields(updated_app)
            return updated_app
        return {}

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
