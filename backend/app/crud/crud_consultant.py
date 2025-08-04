from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.consultant import ConsultantCreate, ConsultantUpdate, ConsultantServiceCreate, ConsultantServiceUpdate, ConsultantReviewCreate

class CRUDConsultant:
    def create(self, db: Client, *, obj_in: ConsultantCreate) -> Dict[str, Any]:
        """Create a new consultant"""
        data = obj_in.dict()
        # Convert UUID to string if needed
        if data.get('user_id'):
            data['user_id'] = str(data['user_id'])
        response = db.table("consultants").insert(data).execute()
        return response.data[0] if response.data else {}

    def get(self, db: Client, consultant_id: int) -> Optional[Dict]:
        # Get consultant basic info
        consultant_response = db.table("consultants").select("*").eq("id", consultant_id).execute()
        if not consultant_response.data:
            return None
        
        consultant = consultant_response.data[0]
        
        # Get services
        services_response = db.table("consultant_services").select("*").eq("consultant_id", consultant_id).execute()
        consultant["services"] = services_response.data or []
        
        # Get reviews
        reviews_response = db.table("consultant_reviews").select("*").eq("consultant_id", consultant_id).execute()
        reviews = reviews_response.data or []
        consultant["reviews"] = reviews
        
        # Calculate review stats
        if reviews:
            total_rating = sum(review["rating"] for review in reviews)
            consultant["rating"] = round(total_rating / len(reviews), 1)
            consultant["review_count"] = len(reviews)
        else:
            consultant["rating"] = None  # No rating if no reviews
            consultant["review_count"] = 0
        
        return consultant

    def get_multi(self, db: Client, skip: int = 0, limit: int = 100) -> List[Dict]:
        # Get consultants basic info
        consultants_response = db.table("consultants").select("*").range(skip, skip + limit - 1).execute()
        consultants = consultants_response.data or []
        
        for consultant in consultants:
            consultant_id = consultant["id"]
            
            # Get services
            services_response = db.table("consultant_services").select("*").eq("consultant_id", consultant_id).execute()
            consultant["services"] = services_response.data or []
            
            # Get reviews
            reviews_response = db.table("consultant_reviews").select("*").eq("consultant_id", consultant_id).execute()
            reviews = reviews_response.data or []
            consultant["reviews"] = reviews
            
            # Calculate review stats
            if reviews:
                total_rating = sum(review["rating"] for review in reviews)
                consultant["rating"] = round(total_rating / len(reviews), 1)
                consultant["review_count"] = len(reviews)
            else:
                consultant["rating"] = None  # No rating if no reviews
                consultant["review_count"] = 0
        
        return consultants

    def get_by_rcic_number(self, db: Client, rcic_number: str) -> Optional[Dict[str, Any]]:
        """Get consultant by RCIC number"""
        response = db.table("consultants").select("*").eq("rcic_number", rcic_number).execute()
        return response.data[0] if response.data else None
    
    def get_by_user_id(self, db: Client, user_id: str) -> Optional[Dict[str, Any]]:
        """Get consultant by user ID"""
        response = db.table("consultants").select("*").eq("user_id", user_id).execute()
        return response.data[0] if response.data else None

    def update(self, db: Client, *, consultant_id: int, obj_in: ConsultantUpdate) -> Dict:
        response = db.table("consultants").update(obj_in.dict(exclude_unset=True)).eq("id", consultant_id).execute()
        return response.data[0] if response.data else {}

consultant = CRUDConsultant()

# Consultant Service CRUD
def get_services_by_consultant(db: Client, consultant_id: int) -> List[Dict]:
    """Get all services for a specific consultant"""
    response = db.table("consultant_services").select("*").eq("consultant_id", consultant_id).eq("is_active", True).execute()
    return response.data or []

def create_consultant_service(db: Client, *, obj_in: Dict) -> Dict:
    response = db.table("consultant_services").insert(obj_in).execute()
    return response.data[0]

def update_consultant_service(db: Client, *, service_id: int, obj_in: ConsultantServiceUpdate) -> Dict:
    response = db.table("consultant_services").update(obj_in.dict(exclude_unset=True)).eq("id", service_id).execute()
    return response.data[0]

def delete_consultant_service(db: Client, *, service_id: int) -> bool:
    """Delete a consultant service"""
    response = db.table("consultant_services").delete().eq("id", service_id).execute()
    return len(response.data) > 0

# Consultant Review CRUD
def create_consultant_review(db: Client, *, obj_in: Dict) -> Dict:
    response = db.table("consultant_reviews").insert(obj_in).execute()
    return response.data[0]
