from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.consultant_application import ConsultantApplication
from app.schemas.consultant_application import (
    ConsultantApplicationCreate,
    ConsultantApplicationUpdate
)

class CRUDConsultantApplication:
    def create(self, db: Session, *, obj_in: ConsultantApplicationCreate) -> ConsultantApplication:
        """Create a new consultant application"""
        db_obj = ConsultantApplication(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, id: int) -> Optional[ConsultantApplication]:
        """Get a consultant application by ID"""
        return db.query(ConsultantApplication).filter(ConsultantApplication.id == id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[ConsultantApplication]:
        """Get a consultant application by email"""
        return db.query(ConsultantApplication).filter(ConsultantApplication.email == email).first()

    def get_by_rcic_number(self, db: Session, rcic_number: str) -> Optional[ConsultantApplication]:
        """Get a consultant application by RCIC license number"""
        return db.query(ConsultantApplication).filter(
            ConsultantApplication.rcic_license_number == rcic_number
        ).first()

    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[ConsultantApplication]:
        """Get multiple consultant applications with optional status filter"""
        query = db.query(ConsultantApplication)
        
        if status:
            query = query.filter(ConsultantApplication.status == status)
            
        return query.offset(skip).limit(limit).all()

    def update(
        self, 
        db: Session, 
        *, 
        db_obj: ConsultantApplication, 
        obj_in: ConsultantApplicationUpdate
    ) -> ConsultantApplication:
        """Update a consultant application"""
        update_dict = obj_in.dict(exclude_unset=True)
        
        for field, value in update_dict.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def approve(self, db: Session, *, db_obj: ConsultantApplication) -> ConsultantApplication:
        """Approve a consultant application"""
        db_obj.status = "approved"
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def reject(self, db: Session, *, db_obj: ConsultantApplication) -> ConsultantApplication:
        """Reject a consultant application"""
        db_obj.status = "rejected"
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: int) -> Optional[ConsultantApplication]:
        """Delete a consultant application"""
        obj = db.query(ConsultantApplication).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def get_stats(self, db: Session) -> dict:
        """Get application statistics"""
        total = db.query(func.count(ConsultantApplication.id)).scalar()
        pending = db.query(func.count(ConsultantApplication.id)).filter(
            ConsultantApplication.status == "pending"
        ).scalar()
        approved = db.query(func.count(ConsultantApplication.id)).filter(
            ConsultantApplication.status == "approved"
        ).scalar()
        rejected = db.query(func.count(ConsultantApplication.id)).filter(
            ConsultantApplication.status == "rejected"
        ).scalar()
        
        return {
            "total": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected
        }

consultant_application = CRUDConsultantApplication()
