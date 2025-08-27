from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.consultant import ConsultantCreate, ConsultantUpdate, ConsultantServiceCreate, ConsultantServiceUpdate, ConsultantReviewCreate
from app.crud.crud_service_template import service_template
from app.crud.crud_service_duration_option import service_duration_option
from app.crud.crud_consultant_service_pricing import consultant_service_pricing

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
            
            # Services are loaded separately by DurationBasedServiceSelection when needed
            # Removing this to fix timeout issues in consultants list API
            consultant["services"] = []
            
            # Get reviews for rating calculation
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

def update_consultant_service(db: Client, *, service_id: int, obj_in: ConsultantServiceUpdate) -> Dict:
    """Update consultant service with validation"""
    update_data = obj_in.dict(exclude_unset=True)
    
    response = db.table("consultant_services").update(update_data).eq("id", service_id).execute()
    return response.data[0]

def create_default_consultant_services(db: Client, consultant_id: int) -> List[Dict]:
    """Create all 8 default services for a new consultant (inactive by default)"""
    templates = service_template.get_all_active(db)
    created_services = []
    
    for template in templates:
        # Extract the integer value from the duration string, e.g., "15 Mins" -> 15
        duration_int = int(''.join(filter(str.isdigit, template['default_duration'])))

        service_data = {
            "consultant_id": consultant_id,
            "service_template_id": template['id'],
            "name": template['name'],
            "duration": duration_int,
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
    """Soft delete a consultant service by setting is_active to False"""
    response = db.table("consultant_services").update({"is_active": False}).eq("id", service_id).execute()
    return len(response.data) > 0

# Duration-based pricing functions
def get_services_with_pricing(db: Client, consultant_id: int, active_only: bool = False) -> List[Dict]:
    """Get all services for a consultant with their duration-based pricing options"""
    services = get_services_by_consultant(db, consultant_id, active_only)
    
    for service in services:
        # Get pricing options with duration details for each service
        # Note: For pricing, we want active pricing unless specifically requested otherwise
        pricing_data = consultant_service_pricing.get_by_service_with_duration(
            db, consultant_service_id=service["id"], is_active=None if not active_only else True
        )
        service["pricing_options"] = pricing_data
    
    return services

def get_service_price_for_duration(db: Client, service_id: int, duration_option_id: int) -> Optional[Dict]:
    """Get the price set by RCIC for a specific service and duration"""
    return consultant_service_pricing.get_price_by_duration(
        db, consultant_service_id=service_id, duration_option_id=duration_option_id
    )

def get_available_duration_options_for_service(db: Client, service_id: int) -> List[Dict]:
    """Get available duration options for a service based on its template"""
    # Get the service to find its template
    service_response = db.table("consultant_services").select("service_template_id").eq("id", service_id).execute()
    if not service_response.data:
        return []
    
    service_template_id = service_response.data[0]["service_template_id"]
    if not service_template_id:
        return []
    
    # Get duration options for this template
    return service_duration_option.get_by_template(db, service_template_id=service_template_id, is_active=True)

def initialize_default_pricing_for_service(db: Client, service_id: int) -> List[Dict]:
    """Create default pricing for all duration options of a service"""
    duration_options = get_available_duration_options_for_service(db, service_id)
    created_pricing = []
    
    for option in duration_options:
        # Set price to minimum allowed for this duration option
        pricing_data = {
            "consultant_service_id": service_id,
            "duration_option_id": option["id"],
            "price": option["min_price"],
            "is_active": True
        }
        
        try:
            from app.schemas.consultant import ConsultantServicePricingCreate
            pricing_create = ConsultantServicePricingCreate(**pricing_data)
            pricing = consultant_service_pricing.create(db, obj_in=pricing_create)
            created_pricing.append(pricing)
        except ValueError:
            # Pricing might already exist, skip
            continue
    
    return created_pricing

# Consultant Review CRUD
def create_consultant_review(db: Client, *, obj_in: Dict) -> Dict:
    response = db.table("consultant_reviews").insert(obj_in).execute()
    return response.data[0]
