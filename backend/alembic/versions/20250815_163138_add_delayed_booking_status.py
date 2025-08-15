"""Add delayed status to BookingStatus enum

Revision ID: 20250815_163138
Revises: 080c26b075ef
Create Date: 2025-08-15 16:31:38.737092

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250815_163138'
down_revision = '080c26b075ef'
branch_labels = None
depends_on = None

def upgrade():
    """Add 'delayed' value to bookingstatus enum"""
    # Add the new enum value
    op.execute("ALTER TYPE bookingstatus ADD VALUE IF NOT EXISTS 'delayed'")

def downgrade():
    """Remove 'delayed' value from bookingstatus enum"""
    # Note: PostgreSQL doesn't support removing enum values easily
    # This would require recreating the enum, which is complex
    # For now, we'll leave this as a no-op
    pass
