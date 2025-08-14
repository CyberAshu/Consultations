"""add_section_completion_tracking_to_consultant_applications

Revision ID: f4eac5aa35fd
Revises: c3ea43121a3a
Create Date: 2025-08-14 12:10:44.855273

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f4eac5aa35fd'
down_revision = 'c3ea43121a3a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add section completion tracking fields
    op.add_column('consultant_applications', sa.Column('section_1_completed', sa.Boolean(), nullable=True, default=False))
    op.add_column('consultant_applications', sa.Column('section_2_completed', sa.Boolean(), nullable=True, default=False))
    op.add_column('consultant_applications', sa.Column('section_3_completed', sa.Boolean(), nullable=True, default=False))
    op.add_column('consultant_applications', sa.Column('section_4_completed', sa.Boolean(), nullable=True, default=False))
    op.add_column('consultant_applications', sa.Column('section_5_completed', sa.Boolean(), nullable=True, default=False))
    op.add_column('consultant_applications', sa.Column('section_6_completed', sa.Boolean(), nullable=True, default=False))
    op.add_column('consultant_applications', sa.Column('section_7_completed', sa.Boolean(), nullable=True, default=False))
    
    # Add admin action fields
    op.add_column('consultant_applications', sa.Column('sections_requested', sa.JSON(), nullable=True))
    op.add_column('consultant_applications', sa.Column('sections_requested_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('consultant_applications', sa.Column('sections_requested_by', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove section completion tracking fields
    op.drop_column('consultant_applications', 'section_1_completed')
    op.drop_column('consultant_applications', 'section_2_completed')
    op.drop_column('consultant_applications', 'section_3_completed')
    op.drop_column('consultant_applications', 'section_4_completed')
    op.drop_column('consultant_applications', 'section_5_completed')
    op.drop_column('consultant_applications', 'section_6_completed')
    op.drop_column('consultant_applications', 'section_7_completed')
    
    # Remove admin action fields
    op.drop_column('consultant_applications', 'sections_requested')
    op.drop_column('consultant_applications', 'sections_requested_at')
    op.drop_column('consultant_applications', 'sections_requested_by')
