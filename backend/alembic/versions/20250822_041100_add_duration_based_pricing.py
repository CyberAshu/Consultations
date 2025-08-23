"""add_duration_based_pricing

Revision ID: 20250822_041100
Revises: 20250819_040300
Create Date: 2025-08-22 04:11:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250822_041100'
down_revision = '20250819_040300'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create service_duration_options table (admin-controlled)
    op.create_table(
        'service_duration_options',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('service_template_id', sa.Integer(), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('duration_label', sa.String(100), nullable=False),  # e.g., "30 minutes", "1 hour"
        sa.Column('min_price', sa.Float(), nullable=False),
        sa.Column('max_price', sa.Float(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('order_index', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_service_duration_options_id', 'service_duration_options', ['id'])
    op.create_foreign_key(
        'fk_service_duration_options_service_template_id',
        'service_duration_options',
        'service_templates',
        ['service_template_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # Create consultant_service_pricing table (RCIC-controlled)
    op.create_table(
        'consultant_service_pricing',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('consultant_service_id', sa.Integer(), nullable=False),
        sa.Column('duration_option_id', sa.Integer(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_consultant_service_pricing_id', 'consultant_service_pricing', ['id'])
    op.create_foreign_key(
        'fk_consultant_service_pricing_consultant_service_id',
        'consultant_service_pricing',
        'consultant_services',
        ['consultant_service_id'],
        ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'fk_consultant_service_pricing_duration_option_id',
        'consultant_service_pricing',
        'service_duration_options',
        ['duration_option_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # Add unique constraint to prevent duplicate pricing for same service+duration combination
    op.create_unique_constraint(
        'uq_consultant_service_pricing_service_duration',
        'consultant_service_pricing',
        ['consultant_service_id', 'duration_option_id']
    )

    # Insert default duration options for each service template
    service_duration_options_table = sa.table('service_duration_options',
        sa.column('service_template_id', sa.Integer),
        sa.column('duration_minutes', sa.Integer),
        sa.column('duration_label', sa.String),
        sa.column('min_price', sa.Float),
        sa.column('max_price', sa.Float),
        sa.column('order_index', sa.Integer),
        sa.column('is_active', sa.Boolean)
    )
    
    # Duration options for each service template
    duration_options = [
        # Service 1: Quick Immigration Advice Session
        {'service_template_id': 1, 'duration_minutes': 30, 'duration_label': '30 minutes', 'min_price': 50.0, 'max_price': 150.0, 'order_index': 1},
        {'service_template_id': 1, 'duration_minutes': 45, 'duration_label': '45 minutes', 'min_price': 75.0, 'max_price': 175.0, 'order_index': 2},
        {'service_template_id': 1, 'duration_minutes': 60, 'duration_label': '1 hour', 'min_price': 100.0, 'max_price': 200.0, 'order_index': 3},
        
        # Service 2: Eligibility Check & Program Matching
        {'service_template_id': 2, 'duration_minutes': 45, 'duration_label': '45 minutes', 'min_price': 75.0, 'max_price': 200.0, 'order_index': 1},
        {'service_template_id': 2, 'duration_minutes': 60, 'duration_label': '1 hour', 'min_price': 100.0, 'max_price': 250.0, 'order_index': 2},
        
        # Service 3: Strategic Immigration Planning
        {'service_template_id': 3, 'duration_minutes': 60, 'duration_label': '1 hour', 'min_price': 100.0, 'max_price': 275.0, 'order_index': 1},
        {'service_template_id': 3, 'duration_minutes': 90, 'duration_label': '1.5 hours', 'min_price': 150.0, 'max_price': 350.0, 'order_index': 2},
        
        # Service 4: Final Application Review
        {'service_template_id': 4, 'duration_minutes': 60, 'duration_label': '1 hour', 'min_price': 150.0, 'max_price': 300.0, 'order_index': 1},
        {'service_template_id': 4, 'duration_minutes': 90, 'duration_label': '1.5 hours', 'min_price': 225.0, 'max_price': 400.0, 'order_index': 2},
        
        # Service 5: Refusal Letter Evaluation
        {'service_template_id': 5, 'duration_minutes': 45, 'duration_label': '45 minutes', 'min_price': 100.0, 'max_price': 225.0, 'order_index': 1},
        {'service_template_id': 5, 'duration_minutes': 75, 'duration_label': '1.25 hours', 'min_price': 165.0, 'max_price': 300.0, 'order_index': 2},
        
        # Service 6: International Applicant Guidance
        {'service_template_id': 6, 'duration_minutes': 45, 'duration_label': '45 minutes', 'min_price': 75.0, 'max_price': 200.0, 'order_index': 1},
        {'service_template_id': 6, 'duration_minutes': 75, 'duration_label': '1.25 hours', 'min_price': 125.0, 'max_price': 275.0, 'order_index': 2},
        
        # Service 7: Expert Support for DIY Applicants
        {'service_template_id': 7, 'duration_minutes': 30, 'duration_label': '30 minutes', 'min_price': 50.0, 'max_price': 150.0, 'order_index': 1},
        {'service_template_id': 7, 'duration_minutes': 45, 'duration_label': '45 minutes', 'min_price': 75.0, 'max_price': 175.0, 'order_index': 2},
        {'service_template_id': 7, 'duration_minutes': 60, 'duration_label': '1 hour', 'min_price': 100.0, 'max_price': 200.0, 'order_index': 3},
        
        # Service 8: Future Path Planning (Students, Workers, PGWP Holders)
        {'service_template_id': 8, 'duration_minutes': 45, 'duration_label': '45 minutes', 'min_price': 75.0, 'max_price': 200.0, 'order_index': 1},
        {'service_template_id': 8, 'duration_minutes': 75, 'duration_label': '1.25 hours', 'min_price': 125.0, 'max_price': 250.0, 'order_index': 2},
    ]
    
    for option in duration_options:
        option['is_active'] = True
    
    op.bulk_insert(service_duration_options_table, duration_options)


def downgrade() -> None:
    # Remove foreign key constraints and drop tables in reverse order
    op.drop_constraint('uq_consultant_service_pricing_service_duration', 'consultant_service_pricing', type_='unique')
    op.drop_constraint('fk_consultant_service_pricing_duration_option_id', 'consultant_service_pricing', type_='foreignkey')
    op.drop_constraint('fk_consultant_service_pricing_consultant_service_id', 'consultant_service_pricing', type_='foreignkey')
    op.drop_index('ix_consultant_service_pricing_id', 'consultant_service_pricing')
    op.drop_table('consultant_service_pricing')
    
    op.drop_constraint('fk_service_duration_options_service_template_id', 'service_duration_options', type_='foreignkey')
    op.drop_index('ix_service_duration_options_id', 'service_duration_options')
    op.drop_table('service_duration_options')
