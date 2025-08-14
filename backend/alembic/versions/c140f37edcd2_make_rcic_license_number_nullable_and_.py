"""make rcic_license_number nullable and fix existing empty strings

Revision ID: c140f37edcd2
Revises: f4eac5aa35fd
Create Date: 2025-08-14 13:13:07.635575

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c140f37edcd2'
down_revision = 'f4eac5aa35fd'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1) Alter column to be nullable first
    op.alter_column('consultant_applications', 'rcic_license_number', existing_type=sa.String(), nullable=True)
    # 2) Then normalize existing data: convert empty strings to NULL to avoid unique collisions
    op.execute("UPDATE consultant_applications SET rcic_license_number = NULL WHERE rcic_license_number = ''")


def downgrade() -> None:
    # Replace NULLs with empty string before making NOT NULL again
    op.execute("UPDATE consultant_applications SET rcic_license_number = '' WHERE rcic_license_number IS NULL")
    op.alter_column('consultant_applications', 'rcic_license_number', existing_type=sa.String(), nullable=False)
