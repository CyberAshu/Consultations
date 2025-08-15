from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SessionNoteBase(BaseModel):
    content: str
    note_type: str = "session_note"
    is_shared_with_client: bool = True


class SessionNoteCreate(SessionNoteBase):
    booking_id: Optional[int] = None
    # consultant_id and client_id will be set automatically from booking and user context


class SessionNoteUpdate(BaseModel):
    content: Optional[str] = None
    note_type: Optional[str] = None
    is_shared_with_client: Optional[bool] = None


class SessionNoteInDB(SessionNoteBase):
    id: int
    booking_id: int
    consultant_id: int
    client_id: str
    shared_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SessionNoteResponse(SessionNoteInDB):
    """Response schema that includes additional computed fields"""
    consultant_name: Optional[str] = None
    time_ago: Optional[str] = None  # Human readable time like "2 hours ago"
    
    class Config:
        from_attributes = True


class ShareNoteRequest(BaseModel):
    """Request to share a note with the client"""
    note_ids: List[int]
    send_email: bool = True
    email_subject: Optional[str] = None
