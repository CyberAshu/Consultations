"""Add indexes for realtime booking queries

Revision ID: add_realtime_indexes
Revises: 
Create Date: 2025-11-06

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_realtime_indexes'
down_revision = None  # Update this to your latest migration
branch_labels = None
depends_on = None


def upgrade():
    # Critical index for consultant user_id lookups
    # Fixes the 241K sequential scans issue
    op.create_index(
        'idx_consultants_user_id',
        'consultants',
        ['user_id'],
        unique=False,
        postgresql_using='btree'
    )
    
    # Optimize client booking queries
    op.create_index(
        'idx_bookings_client_updated',
        'bookings',
        ['client_id', sa.text('updated_at DESC')],
        unique=False,
        postgresql_using='btree'
    )
    
    # Optimize consultant booking queries
    op.create_index(
        'idx_bookings_consultant_updated',
        'bookings',
        ['consultant_id', sa.text('updated_at DESC')],
        unique=False,
        postgresql_using='btree'
    )
    
    # Additional index for booking status queries
    op.create_index(
        'idx_bookings_status',
        'bookings',
        ['status'],
        unique=False,
        postgresql_using='btree'
    )


def downgrade():
    op.drop_index('idx_bookings_status', table_name='bookings')
    op.drop_index('idx_bookings_consultant_updated', table_name='bookings')
    op.drop_index('idx_bookings_client_updated', table_name='bookings')
    op.drop_index('idx_consultants_user_id', table_name='consultants')
