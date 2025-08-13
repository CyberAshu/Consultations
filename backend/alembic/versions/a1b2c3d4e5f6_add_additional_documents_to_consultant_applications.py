"""Add additional_documents to consultant_applications

Revision ID: a1b2c3d4e5f6
Revises: ecd9523ef185
Create Date: 2025-01-13 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'ecd9523ef185'
branch_labels = None
depends_on = None


def upgrade():
    # Add additional_documents column to consultant_applications table
    op.add_column('consultant_applications', 
                  sa.Column('additional_documents', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade():
    # Remove additional_documents column from consultant_applications table
    op.drop_column('consultant_applications', 'additional_documents')
