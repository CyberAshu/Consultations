from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.consultant import ConsultantCreate, ConsultantUpdate, ConsultantServiceCreate, ConsultantServiceUpdate, ConsultantReviewCreate
from app.crud.crud_service_template import service_template

class CRUDConsultant:
    def create(self, db: Client, *, obj_in: ConsultantCreate) -> Dict[str, Any]:
        """Create a new consultant"""
        data = obj_in.dict()
        # Convert UUID to string if needed
        if data.get('user_id'):
            data['user_id'] = str(data['user_id'])
        response = db.table("consultants").insert(data).execute()
        
        if response.data:
            consultant = response.data[0]
            # Automatically create the 8 default services for the new consultant
            try:
                create_default_consultant_services(db, consultant['id'])
            except Exception as e:
                print(f"Warning: Failed to create default services for consultant {consultant['id']}: {str(e)}")
            
            return consultant
        else:
            return {}

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
def get_services_by_consultant(db: Client, consultant_id: int, active_only: bool = False) -> List[Dict]:
    """Get all services for a specific consultant"""
    query = db.table("consultant_services").select("*").eq("consultant_id", consultant_id)
    
    # If active_only is True, filter by active services (for public display)
    # Otherwise, return all services (for consultant's own management)
    if active_only:
        query = query.eq("is_active", True)
    
    response = query.execute()
    return response.data or []

def validate_service_price(db: Client, service_template_id: int, price: float) -> bool:
    """Validate that price is within template range"""
    template = service_template.get(db, service_template_id)
    if not template:
        return False
    return template['min_price'] <= price <= template['max_price']

def create_consultant_service_from_template(db: Client, *, consultant_id: int, service_template_id: int, price: float, description: str = None, is_active: bool = False) -> Dict:
    """Create consultant service based on template"""
    template = service_template.get(db, service_template_id)
    if not template:
        raise ValueError("Service template not found")
    
    if not validate_service_price(db, service_template_id, price):
        raise ValueError(f"Price must be between {template['min_price']} and {template['max_price']}")
    
    service_data = {
        "consultant_id": consultant_id,
        "service_template_id": service_template_id,
        "name": template['name'],
        "duration": template['default_duration'],
        "price": price,
        "description": description or template['default_description'],
        "is_active": is_active
    }
    
    response = db.table("consultant_services").insert(service_data).execute()
    return response.data[0] if response.data else {}

def create_consultant_service(db: Client, *, obj_in: Dict) -> Dict:
    """Legacy method - now requires service_template_id"""
    if 'service_template_id' not in obj_in:
        raise ValueError("service_template_id is required")
    
    service_template_id = obj_in['service_template_id']
    if not validate_service_price(db, service_template_id, obj_in['price']):
        template = service_template.get(db, service_template_id)
        raise ValueError(f"Price must be between {template['min_price']} and {template['max_price']}")
    
    response = db.table("consultant_services").insert(obj_in).execute()
    return response.data[0]

def update_consultant_service(db: Client, *, service_id: int, obj_in: ConsultantServiceUpdate) -> Dict:
    """Update consultant service with validation"""
    update_data = obj_in.dict(exclude_unset=True)
    
    # If price is being updated, validate against template
    if 'price' in update_data:
        # Get current service to get template_id
        current_service = db.table("consultant_services").select("*").eq("id", service_id).execute()
        if current_service.data:
            service_template_id = current_service.data[0].get('service_template_id')
            if service_template_id and not validate_service_price(db, service_template_id, update_data['price']):
                template = service_template.get(db, service_template_id)
                raise ValueError(f"Price must be between {template['min_price']} and {template['max_price']}")
    
    response = db.table("consultant_services").update(update_data).eq("id", service_id).execute()
    return response.data[0]

def create_default_consultant_services(db: Client, consultant_id: int) -> List[Dict]:
    """Create all 8 default services for a new consultant (inactive by default)"""
    templates = service_template.get_all_active(db)
    created_services = []
    
    for template in templates:
        service_data = {
            "consultant_id": consultant_id,
            "service_template_id": template['id'],
            "name": template['name'],
            "duration": template['default_duration'],
            "price": template['min_price'],  # Start with minimum price
            "description": template['default_description'],
            "is_active": False  # Inactive by default
        }
        
        response = db.table("consultant_services").insert(service_data).execute()
        if response.data:
            created_services.append(response.data[0])
    
    return created_services

def get_bookings_by_service(db: Client, service_id: int) -> List[Dict]:
    """Get all bookings for a specific service"""
    response = db.table("bookings").select("*").eq("service_id", service_id).execute()
    return response.data or []

def delete_consultant_service(db: Client, *, service_id: int) -> bool:
    """Delete a consultant service - only if no bookings exist"""
    # Check if there are any bookings for this service
    existing_bookings = get_bookings_by_service(db, service_id)
    
    if existing_bookings:
        # If there are bookings, use soft delete instead
        response = db.table("consultant_services").update({"is_active": False}).eq("id", service_id).execute()
        return len(response.data) > 0
    else:
        # If no bookings exist, we can safely delete the service
        response = db.table("consultant_services").delete().eq("id", service_id).execute()
        return len(response.data) > 0

# Consultant Review CRUD
def create_consultant_review(db: Client, *, obj_in: Dict) -> Dict:
    response = db.table("consultant_reviews").insert(obj_in).execute()
    return response.data[0]
