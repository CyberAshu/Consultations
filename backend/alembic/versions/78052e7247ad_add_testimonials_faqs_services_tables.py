"""add_testimonials_faqs_services_tables

Revision ID: 78052e7247ad
Revises: 961d9cc15969
Create Date: 2025-07-31 14:40:38.535620

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '78052e7247ad'
down_revision = '961d9cc15969'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create testimonials table
    op.create_table(
        'testimonials',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('quote', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=255), nullable=False),
        sa.Column('rating', sa.Float(), nullable=False, server_default='5.0'),
        sa.Column('flag', sa.String(length=10), nullable=True),
        sa.Column('outcome', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.String(length=10), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_testimonials_id', 'testimonials', ['id'])
    op.create_index('ix_testimonials_is_active', 'testimonials', ['is_active'])
    
    # Create FAQs table
    op.create_table(
        'faqs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.String(length=10), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_faqs_id', 'faqs', ['id'])
    op.create_index('ix_faqs_category', 'faqs', ['category'])
    op.create_index('ix_faqs_is_active', 'faqs', ['is_active'])
    
    # Create services table
    op.create_table(
        'services',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('icon', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('color', sa.String(length=100), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.String(length=10), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_services_id', 'services', ['id'])
    op.create_index('ix_services_is_active', 'services', ['is_active'])


def downgrade() -> None:
    # Drop services table
    op.drop_index('ix_services_is_active', 'services')
    op.drop_index('ix_services_id', 'services')
    op.drop_table('services')
    
    # Drop FAQs table
    op.drop_index('ix_faqs_is_active', 'faqs')
    op.drop_index('ix_faqs_category', 'faqs')
    op.drop_index('ix_faqs_id', 'faqs')
    op.drop_table('faqs')
    
    # Drop testimonials table
    op.drop_index('ix_testimonials_is_active', 'testimonials')
    op.drop_index('ix_testimonials_id', 'testimonials')
    op.drop_table('testimonials')
