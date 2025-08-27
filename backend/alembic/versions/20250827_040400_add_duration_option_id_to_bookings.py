"""add_duration_option_id_to_bookings

Revision ID: 20250827_040400
Revises: 20250822_041100
Create Date: 2025-08-27 04:04:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250827_040400'
down_revision = '20250822_041100'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add duration_option_id column to bookings table
    op.add_column('bookings', sa.Column('duration_option_id', sa.Integer(), nullable=True))
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_bookings_duration_option_id',
        'bookings',
        'service_duration_options',
        ['duration_option_id'],
        ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Remove foreign key constraint
    op.drop_constraint('fk_bookings_duration_option_id', 'bookings', type_='foreignkey')
    
    # Drop the column
    op.drop_column('bookings', 'duration_option_id')
