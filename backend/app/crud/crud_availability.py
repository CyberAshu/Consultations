from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import time, datetime, date
from app.models.availability import ConsultantAvailability, ConsultantBlockedTime, DayOfWeek
from app.schemas.availability import (
    AvailabilitySlotCreate,
    AvailabilitySlotUpdate,
    BlockedTimeCreate,
    BlockedTimeUpdate
)


class CRUDAvailability:
    """CRUD operations for consultant availability"""
    
    # ============================================================
    # Availability Slots
    # ============================================================
    
    def create_availability_slot(
        self, 
        db: Session, 
        consultant_id: int, 
        slot: AvailabilitySlotCreate
    ) -> ConsultantAvailability:
        """Create a new availability slot for a consultant"""
        db_slot = ConsultantAvailability(
            consultant_id=consultant_id,
            day_of_week=slot.day_of_week,
            start_time=slot.start_time,
            end_time=slot.end_time,
            timezone=slot.timezone,
            is_active=slot.is_active
        )
        db.add(db_slot)
        db.commit()
        db.refresh(db_slot)
        return db_slot
    
    def get_availability_slot(self, db: Session, slot_id: int) -> Optional[ConsultantAvailability]:
        """Get a specific availability slot by ID"""
        return db.query(ConsultantAvailability).filter(
            ConsultantAvailability.id == slot_id
        ).first()
    
    def get_consultant_availability(
        self, 
        db: Session, 
        consultant_id: int,
        day_of_week: Optional[DayOfWeek] = None,
        is_active: Optional[bool] = None
    ) -> List[ConsultantAvailability]:
        """Get all availability slots for a consultant"""
        query = db.query(ConsultantAvailability).filter(
            ConsultantAvailability.consultant_id == consultant_id
        )
        
        if day_of_week is not None:
            query = query.filter(ConsultantAvailability.day_of_week == day_of_week)
        
        if is_active is not None:
            query = query.filter(ConsultantAvailability.is_active == is_active)
        
        return query.order_by(
            ConsultantAvailability.day_of_week,
            ConsultantAvailability.start_time
        ).all()
    
    def update_availability_slot(
        self, 
        db: Session, 
        slot_id: int, 
        slot_update: AvailabilitySlotUpdate
    ) -> Optional[ConsultantAvailability]:
        """Update an availability slot"""
        db_slot = self.get_availability_slot(db, slot_id)
        if not db_slot:
            return None
        
        update_data = slot_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_slot, field, value)
        
        db.commit()
        db.refresh(db_slot)
        return db_slot
    
    def delete_availability_slot(self, db: Session, slot_id: int) -> bool:
        """Delete an availability slot"""
        db_slot = self.get_availability_slot(db, slot_id)
        if not db_slot:
            return False
        
        db.delete(db_slot)
        db.commit()
        return True
    
    def delete_consultant_availability(self, db: Session, consultant_id: int) -> int:
        """Delete all availability slots for a consultant (returns count deleted)"""
        count = db.query(ConsultantAvailability).filter(
            ConsultantAvailability.consultant_id == consultant_id
        ).delete()
        db.commit()
        return count
    
    def bulk_create_availability(
        self, 
        db: Session, 
        consultant_id: int, 
        slots: List[AvailabilitySlotCreate]
    ) -> List[ConsultantAvailability]:
        """Create multiple availability slots at once (for weekly schedule)"""
        db_slots = []
        for slot in slots:
            db_slot = ConsultantAvailability(
                consultant_id=consultant_id,
                day_of_week=slot.day_of_week,
                start_time=slot.start_time,
                end_time=slot.end_time,
                timezone=slot.timezone,
                is_active=slot.is_active
            )
            db_slots.append(db_slot)
        
        db.add_all(db_slots)
        db.commit()
        
        for slot in db_slots:
            db.refresh(slot)
        
        return db_slots
    
    def replace_consultant_availability(
        self, 
        db: Session, 
        consultant_id: int, 
        slots: List[AvailabilitySlotCreate]
    ) -> List[ConsultantAvailability]:
        """Replace entire weekly schedule (delete old, create new)"""
        # Delete existing slots
        self.delete_consultant_availability(db, consultant_id)
        
        # Create new slots
        return self.bulk_create_availability(db, consultant_id, slots)
    
    # ============================================================
    # Blocked Time
    # ============================================================
    
    def create_blocked_time(
        self, 
        db: Session, 
        consultant_id: int, 
        blocked_time: BlockedTimeCreate
    ) -> ConsultantBlockedTime:
        """Create a blocked time entry"""
        db_blocked = ConsultantBlockedTime(
            consultant_id=consultant_id,
            start_datetime=blocked_time.start_datetime,
            end_datetime=blocked_time.end_datetime,
            reason=blocked_time.reason
        )
        db.add(db_blocked)
        db.commit()
        db.refresh(db_blocked)
        return db_blocked
    
    def get_blocked_time(self, db: Session, blocked_id: int) -> Optional[ConsultantBlockedTime]:
        """Get a specific blocked time entry"""
        return db.query(ConsultantBlockedTime).filter(
            ConsultantBlockedTime.id == blocked_id
        ).first()
    
    def get_consultant_blocked_times(
        self, 
        db: Session, 
        consultant_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[ConsultantBlockedTime]:
        """Get all blocked times for a consultant within a date range"""
        query = db.query(ConsultantBlockedTime).filter(
            ConsultantBlockedTime.consultant_id == consultant_id
        )
        
        if start_date:
            query = query.filter(ConsultantBlockedTime.end_datetime >= start_date)
        
        if end_date:
            query = query.filter(ConsultantBlockedTime.start_datetime <= end_date)
        
        return query.order_by(ConsultantBlockedTime.start_datetime).all()
    
    def update_blocked_time(
        self, 
        db: Session, 
        blocked_id: int, 
        blocked_update: BlockedTimeUpdate
    ) -> Optional[ConsultantBlockedTime]:
        """Update a blocked time entry"""
        db_blocked = self.get_blocked_time(db, blocked_id)
        if not db_blocked:
            return None
        
        update_data = blocked_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_blocked, field, value)
        
        db.commit()
        db.refresh(db_blocked)
        return db_blocked
    
    def delete_blocked_time(self, db: Session, blocked_id: int) -> bool:
        """Delete a blocked time entry"""
        db_blocked = self.get_blocked_time(db, blocked_id)
        if not db_blocked:
            return False
        
        db.delete(db_blocked)
        db.commit()
        return True


# Create a singleton instance
crud_availability = CRUDAvailability()
