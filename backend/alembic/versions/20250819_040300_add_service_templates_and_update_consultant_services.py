"""add_service_templates_and_update_consultant_services

Revision ID: 20250819_040300
Revises: 080c26b075ef
Create Date: 2025-08-19 04:03:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20250819_040300'
down_revision = '1fe59b478f8e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create service_templates table
    op.create_table(
        'service_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('default_description', sa.Text(), nullable=False),
        sa.Column('min_price', sa.Float(), nullable=False),
        sa.Column('max_price', sa.Float(), nullable=False),
        sa.Column('default_duration', sa.String(length=50), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_service_templates_id', 'service_templates', ['id'])
    
    # Add service_template_id to consultant_services table
    op.add_column('consultant_services', sa.Column('service_template_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_consultant_services_service_template_id', 
        'consultant_services', 
        'service_templates', 
        ['service_template_id'], 
        ['id']
    )
    
    # Insert the 8 predefined service templates
    service_templates_table = sa.table('service_templates',
        sa.column('id', sa.Integer),
        sa.column('name', sa.String),
        sa.column('default_description', sa.Text),
        sa.column('min_price', sa.Float),
        sa.column('max_price', sa.Float),
        sa.column('default_duration', sa.String),
        sa.column('order_index', sa.Integer),
        sa.column('is_active', sa.Boolean)
    )
    
    op.bulk_insert(service_templates_table, [
        {
            'id': 1,
            'name': 'Quick Immigration Advice Session',
            'default_description': 'Get fast, trustworthy answers from a licensed RCIC. 30-60 minute live 1-on-1 session for clarification on documents, timelines, or eligibility. Perfect for first-time applicants or people seeking clarity.',
            'min_price': 50.0,
            'max_price': 200.0,
            'default_duration': '30-60 minutes',
            'order_index': 1,
            'is_active': True
        },
        {
            'id': 2,
            'name': 'Eligibility Check & Program Matching',
            'default_description': 'Personalized review of your qualifications with a clear list of immigration options that match your background. Get matched with the most realistic Canadian immigration pathways and understand which programs you qualify for.',
            'min_price': 75.0,
            'max_price': 250.0,
            'default_duration': '45-60 minutes',
            'order_index': 2,
            'is_active': True
        },
        {
            'id': 3,
            'name': 'Strategic Immigration Planning',
            'default_description': 'Build a long-term immigration roadmap with side-by-side comparison of your possible paths. Compare multiple programs based on your goals, get CRS improvement tips, timelines, and risk analysis.',
            'min_price': 100.0,
            'max_price': 350.0,
            'default_duration': '60-90 minutes',
            'order_index': 3,
            'is_active': True
        },
        {
            'id': 4,
            'name': 'Final Application Review',
            'default_description': 'Document and form check for accuracy and completeness before submission. Expert review of your draft forms and supporting documents with feedback to improve your chances of approval.',
            'min_price': 150.0,
            'max_price': 400.0,
            'default_duration': '60-90 minutes',
            'order_index': 4,
            'is_active': True
        },
        {
            'id': 5,
            'name': 'Refusal Letter Evaluation',
            'default_description': 'Clear breakdown of your IRCC refusal letter with step-by-step suggestions to fix or reapply. Understand what went wrong, learn whether to reapply, appeal, or change strategy.',
            'min_price': 100.0,
            'max_price': 300.0,
            'default_duration': '45-75 minutes',
            'order_index': 5,
            'is_active': True
        },
        {
            'id': 6,
            'name': 'International Applicant Guidance',
            'default_description': 'Tailored guidance for clients applying from outside Canada. Country-specific advice, support with proving ties, finances, and intent. Culturally aware advice from consultants who know your region.',
            'min_price': 75.0,
            'max_price': 275.0,
            'default_duration': '45-75 minutes',
            'order_index': 6,
            'is_active': True
        },
        {
            'id': 7,
            'name': 'Expert Support for DIY Applicants',
            'default_description': 'Targeted help with complex form fields, GCKey errors, document prep, cover letters, and troubleshooting. Stay in control of your application while getting expert support where needed.',
            'min_price': 50.0,
            'max_price': 200.0,
            'default_duration': '30-60 minutes',
            'order_index': 7,
            'is_active': True
        },
        {
            'id': 8,
            'name': 'Future Path Planning (Students, Workers, PGWP Holders)',
            'default_description': 'Timeline planning for those already in Canada planning permanent residence. Understand your next steps: Express Entry, PNP, bridging work permits, etc. Build a timeline around permit expiry.',
            'min_price': 75.0,
            'max_price': 250.0,
            'default_duration': '45-75 minutes',
            'order_index': 8,
            'is_active': True
        }
    ])


def downgrade() -> None:
    # Remove foreign key and column from consultant_services
    op.drop_constraint('fk_consultant_services_service_template_id', 'consultant_services', type_='foreignkey')
    op.drop_column('consultant_services', 'service_template_id')
    
    # Drop service_templates table
    op.drop_index('ix_service_templates_id', 'service_templates')
    op.drop_table('service_templates')
