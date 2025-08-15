from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from supabase import Client
from app.schemas.session_note import SessionNoteCreate, SessionNoteUpdate


def create_session_note(db: Client, *, obj_in: SessionNoteCreate, consultant_id: int, client_id: str) -> Dict:
    """Create a new session note"""
    note_data = obj_in.dict()
    note_data['consultant_id'] = consultant_id
    note_data['client_id'] = client_id
    
    # If the note is being shared with client, set shared_at timestamp
    if note_data.get('is_shared_with_client', False):
        note_data['shared_at'] = datetime.now(timezone.utc).isoformat()
    
    response = db.table("session_notes").insert(note_data).execute()
    return response.data[0]


def get_session_note(db: Client, note_id: int) -> Optional[Dict]:
    """Get a session note by ID"""
    response = db.table("session_notes").select("*").eq("id", note_id).execute()
    return response.data[0] if response.data else None


def get_session_notes_by_booking(db: Client, booking_id: int, include_private: bool = False) -> List[Dict]:
    """Get all session notes for a booking"""
    query = db.table("session_notes").select("*").eq("booking_id", booking_id)
    
    # If include_private is False, only get shared notes
    if not include_private:
        query = query.eq("is_shared_with_client", True)
    
    response = query.order("created_at", desc=True).execute()
    return response.data


def get_session_notes_by_consultant(db: Client, consultant_id: int, limit: int = 50) -> List[Dict]:
    """Get session notes created by a specific consultant"""
    response = (db.table("session_notes")
                .select("*")
                .eq("consultant_id", consultant_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute())
    return response.data


def get_session_notes_for_client(db: Client, client_id: str, limit: int = 50) -> List[Dict]:
    """Get session notes shared with a specific client"""
    response = (db.table("session_notes")
                .select("*")
                .eq("client_id", client_id)
                .eq("is_shared_with_client", True)
                .order("created_at", desc=True)
                .limit(limit)
                .execute())
    return response.data


def update_session_note(db: Client, *, note_id: int, obj_in: SessionNoteUpdate) -> Dict:
    """Update a session note"""
    update_data = obj_in.dict(exclude_unset=True)
    
    # If sharing with client for the first time, set shared_at timestamp
    if update_data.get("is_shared_with_client") is True:
        update_data["shared_at"] = datetime.now(timezone.utc).isoformat()
    
    response = db.table("session_notes").update(update_data).eq("id", note_id).execute()
    return response.data[0]


def delete_session_note(db: Client, note_id: int) -> bool:
    """Delete a session note"""
    response = db.table("session_notes").delete().eq("id", note_id).execute()
    return len(response.data) > 0


def share_notes_with_client(db: Client, note_ids: List[int]) -> List[Dict]:
    """Share multiple notes with client"""
    shared_at = datetime.now(timezone.utc).isoformat()
    
    # Update multiple notes to be shared
    response = (db.table("session_notes")
                .update({
                    "is_shared_with_client": True,
                    "shared_at": shared_at
                })
                .in_("id", note_ids)
                .execute())
    
    return response.data


def get_session_notes_with_consultant_details(db: Client, booking_id: int, include_private: bool = False) -> List[Dict]:
    """Get session notes with consultant information"""
    query = """
    SELECT 
        sn.*,
        c.name as consultant_name,
        c.rcic_number
    FROM session_notes sn
    JOIN consultants c ON sn.consultant_id = c.id
    WHERE sn.booking_id = %s
    """
    
    params = [booking_id]
    
    if not include_private:
        query += " AND sn.is_shared_with_client = %s"
        params.append(True)
    
    query += " ORDER BY sn.created_at DESC"
    
    # Note: This is a raw SQL query - you might need to adapt this based on your Supabase client
    # For now, we'll use the regular approach and fetch consultant details separately
    
    notes = get_session_notes_by_booking(db, booking_id, include_private)
    
    # Enrich with consultant details
    for note in notes:
        consultant_response = db.table("consultants").select("name, rcic_number").eq("id", note["consultant_id"]).execute()
        if consultant_response.data:
            note["consultant_name"] = consultant_response.data[0]["name"]
            note["consultant_rcic_number"] = consultant_response.data[0].get("rcic_number")
    
    return notes
