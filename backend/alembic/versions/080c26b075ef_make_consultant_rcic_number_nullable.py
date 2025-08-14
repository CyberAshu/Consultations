"""make consultant.rcic_number nullable

Revision ID: 080c26b075ef
Revises: c140f37edcd2
Create Date: 2025-08-14 15:04:26.591383

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '080c26b075ef'
down_revision = 'c140f37edcd2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Alter consultants.rcic_number to be nullable
    op.alter_column('consultants', 'rcic_number', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    # Revert to NOT NULL (may fail if NULLs exist)
    op.alter_column('consultants', 'rcic_number', existing_type=sa.String(), nullable=False)
