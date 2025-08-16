"""convert_admin_notes_to_json_array

Revision ID: 1fe59b478f8e
Revises: 20250815_163138
Create Date: 2025-08-16 10:13:03.245846

"""
from alembic import op
import sqlalchemy as sa
import json
from datetime import datetime


# revision identifiers, used by Alembic.
revision = '1fe59b478f8e'
down_revision = '20250815_163138'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Convert admin_notes from string to JSON array format"""
    # Create a connection to execute raw SQL
    conn = op.get_bind()
    
    # Get all applications with non-null, non-empty admin_notes
    # We'll handle the case where it's already JSON vs plain text
    result = conn.execute(
        sa.text("""
            SELECT id, admin_notes 
            FROM consultant_applications 
            WHERE admin_notes IS NOT NULL 
            AND admin_notes != '' 
            AND admin_notes != 'null'
        """)
    )
    
    # Convert each admin_note to JSON array format
    for row in result:
        app_id = row[0]
        old_note = row[1]
        
        # Skip if already an array or null
        if not old_note or old_note.strip() == '':
            continue
        
        # Try to parse as JSON first
        try:
            parsed = json.loads(old_note)
            # If it's already an array, skip it
            if isinstance(parsed, list):
                continue
            # If it's some other JSON type, treat it as text
            note_text = str(parsed) if parsed else str(old_note)
        except (json.JSONDecodeError, ValueError):
            # It's plain text, use as is
            note_text = str(old_note)
            
        # Create new note object with timestamp and default author
        new_note = {
            "text": note_text,
            "timestamp": datetime.now().isoformat(),
            "author": "System (Migration)"
        }
        
        # Convert to JSON array
        json_array = json.dumps([new_note])
        
        # Update the record
        conn.execute(
            sa.text(
                "UPDATE consultant_applications SET admin_notes = :notes WHERE id = :id"
            ),
            {"notes": json_array, "id": app_id}
        )
    
    # Commit the transaction
    conn.commit()


def downgrade() -> None:
    """Convert admin_notes back from JSON array to string format"""
    # Create a connection to execute raw SQL
    conn = op.get_bind()
    
    # Get all applications with JSON array admin_notes
    result = conn.execute(
        sa.text("""
            SELECT id, admin_notes 
            FROM consultant_applications 
            WHERE admin_notes IS NOT NULL 
            AND jsonb_typeof(admin_notes::jsonb) = 'array'
        """)
    )
    
    # Convert each JSON array back to string (taking the first note's text)
    for row in result:
        app_id = row[0]
        json_notes = row[1]
        
        try:
            notes_array = json.loads(json_notes)
            if notes_array and len(notes_array) > 0:
                # Take the text from the first note
                first_note_text = notes_array[0].get('text', '')
            else:
                first_note_text = ''
                
            # Update the record
            conn.execute(
                sa.text(
                    "UPDATE consultant_applications SET admin_notes = :notes WHERE id = :id"
                ),
                {"notes": first_note_text, "id": app_id}
            )
        except (json.JSONDecodeError, KeyError, IndexError):
            # If there's an error parsing, set to empty string
            conn.execute(
                sa.text(
                    "UPDATE consultant_applications SET admin_notes = :notes WHERE id = :id"
                ),
                {"notes": '', "id": app_id}
            )
    
    # Commit the transaction
    conn.commit()
