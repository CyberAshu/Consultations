from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.faq import FAQCreate, FAQUpdate


def get_faqs(
    db: Client, *, skip: int = 0, limit: int = 100, is_active: str = "true"
) -> List[Dict[str, Any]]:
    """Get FAQs from database"""
    query = db.table("faqs").select("*")
    
    if is_active:
        query = query.eq("is_active", is_active)
    
    result = query.order("order_index").range(skip, skip + limit - 1).execute()
    return result.data if result.data else []


def get_faq(db: Client, *, faq_id: int) -> Optional[Dict[str, Any]]:
    """Get single FAQ"""
    result = db.table("faqs").select("*").eq("id", faq_id).execute()
    return result.data[0] if result.data else None


def create_faq(db: Client, *, obj_in: FAQCreate) -> Dict[str, Any]:
    """Create new FAQ"""
    faq_data = obj_in.dict()
    result = db.table("faqs").insert(faq_data).execute()
    return result.data[0] if result.data else {}


def update_faq(
    db: Client, *, faq_id: int, obj_in: FAQUpdate
) -> Optional[Dict[str, Any]]:
    """Update FAQ"""
    update_data = obj_in.dict(exclude_unset=True)
    if not update_data:
        return None
    
    result = db.table("faqs").update(update_data).eq("id", faq_id).execute()
    return result.data[0] if result.data else None


def delete_faq(db: Client, *, faq_id: int) -> bool:
    """Soft delete FAQ"""
    result = db.table("faqs").update({"is_active": "false"}).eq("id", faq_id).execute()
    return bool(result.data)

