from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.consultant import ConsultantCreate, ConsultantUpdate, ConsultantServiceCreate, ConsultantServiceUpdate, ConsultantReviewCreate

# Consultant CRUD
def get_consultant(db: Client, consultant_id: int) -> Optional[Dict]:
    response = db.table("consultants").select("*, services:consultant_services(*), reviews:consultant_reviews(*)").eq("id", consultant_id).execute()
    return response.data[0] if response.data else None

def get_consultants(db: Client, skip: int = 0, limit: int = 100) -> List[Dict]:
    response = db.table("consultants").select("*, services:consultant_services(*), reviews:consultant_reviews(*)").range(skip, limit).execute()
    return response.data

def create_consultant(db: Client, *, obj_in: ConsultantCreate) -> Dict:
    response = db.table("consultants").insert(obj_in.dict()).execute()
    return response.data[0]

def update_consultant(db: Client, *, consultant_id: int, obj_in: ConsultantUpdate) -> Dict:
    response = db.table("consultants").update(obj_in.dict(exclude_unset=True)).eq("id", consultant_id).execute()
    return response.data[0]

# Consultant Service CRUD
def create_consultant_service(db: Client, *, obj_in: ConsultantServiceCreate) -> Dict:
    response = db.table("consultant_services").insert(obj_in.dict()).execute()
    return response.data[0]

def update_consultant_service(db: Client, *, service_id: int, obj_in: ConsultantServiceUpdate) -> Dict:
    response = db.table("consultant_services").update(obj_in.dict(exclude_unset=True)).eq("id", service_id).execute()
    return response.data[0]

# Consultant Review CRUD
def create_consultant_review(db: Client, *, obj_in: ConsultantReviewCreate) -> Dict:
    response = db.table("consultant_reviews").insert(obj_in.dict()).execute()
    return response.data[0]
