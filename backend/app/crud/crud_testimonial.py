from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.testimonial import TestimonialCreate, TestimonialUpdate


def get_testimonials(
    db: Client, *, skip: int = 0, limit: int = 100, is_active: str = "true"
) -> List[Dict[str, Any]]:
    """Get testimonials from database"""
    query = db.table("testimonials").select("*")
    
    if is_active:
        query = query.eq("is_active", is_active)
    
    result = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return result.data if result.data else []


def get_testimonial(db: Client, *, testimonial_id: int) -> Optional[Dict[str, Any]]:
    """Get single testimonial"""
    result = db.table("testimonials").select("*").eq("id", testimonial_id).execute()
    return result.data[0] if result.data else None


def create_testimonial(db: Client, *, obj_in: TestimonialCreate) -> Dict[str, Any]:
    """Create new testimonial"""
    testimonial_data = obj_in.dict()
    result = db.table("testimonials").insert(testimonial_data).execute()
    return result.data[0] if result.data else {}


def update_testimonial(
    db: Client, *, testimonial_id: int, obj_in: TestimonialUpdate
) -> Optional[Dict[str, Any]]:
    """Update testimonial"""
    update_data = obj_in.dict(exclude_unset=True)
    if not update_data:
        return None
    
    result = db.table("testimonials").update(update_data).eq("id", testimonial_id).execute()
    return result.data[0] if result.data else None


def delete_testimonial(db: Client, *, testimonial_id: int) -> bool:
    """Soft delete testimonial"""
    result = db.table("testimonials").update({"is_active": "false"}).eq("id", testimonial_id).execute()
    return bool(result.data)
