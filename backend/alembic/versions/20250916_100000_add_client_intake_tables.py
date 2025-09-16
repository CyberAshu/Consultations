"""add_client_intake_tables

Revision ID: 20250916_100000
Revises: 20250827_040400
Create Date: 2025-09-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON

# revision identifiers, used by Alembic.
revision = '20250916_100000'
down_revision = '20250827_040400'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create client_intakes table
    op.create_table('client_intakes',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('client_id', UUID(as_uuid=True), nullable=False, index=True),
        
        # Status and metadata
        sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'updated', name='intakestatus'), default='pending'),
        sa.Column('current_stage', sa.Integer(), default=1),
        sa.Column('completed_stages', JSON()),
        
        # Stage 1: Location & Role
        sa.Column('location', sa.Enum('inside_canada', 'outside_canada', 'not_sure', name='location')),
        sa.Column('client_role', sa.Enum('principal_applicant', 'sponsor', 'spouse_partner', 'dependent', 'employer_hr_rep', 'other', name='clientrole')),
        
        # Stage 2: Identity, Contact & Consent
        sa.Column('full_name', sa.String()),
        sa.Column('email', sa.String()),
        sa.Column('phone', sa.String()),
        sa.Column('preferred_language', sa.String()),
        sa.Column('preferred_language_other', sa.String()),
        sa.Column('timezone', sa.String()),
        sa.Column('consent_acknowledgement', JSON()),
        
        # Stage 3: Household Composition
        sa.Column('marital_status', sa.Enum('single', 'married', 'common_law', 'separated', 'divorced', 'widowed', name='maritalstatus')),
        sa.Column('has_dependants', sa.Boolean()),
        sa.Column('dependants_count', sa.Integer()),
        sa.Column('dependants_accompanying', sa.String()),
        
        # Stage 4: Education History
        sa.Column('highest_education', sa.Enum('high_school', 'one_year_diploma', 'two_plus_year_diploma', 'bachelors', 'masters', 'doctorate', name='educationlevel')),
        sa.Column('eca_status', sa.Enum('yes', 'in_progress', 'no', 'not_sure', name='ecastatus')),
        sa.Column('eca_provider', sa.Enum('wes', 'ces', 'icas', 'iqas', 'mcc', 'others', 'not_applicable', name='ecaprovider')),
        sa.Column('eca_result', sa.String()),
        
        # Stage 5: Language Skills
        sa.Column('language_test_taken', sa.String()),
        sa.Column('test_type', sa.Enum('ielts', 'celpip', 'tef', 'tcf', name='languagetesttype')),
        sa.Column('test_date', sa.DateTime(timezone=True)),
        sa.Column('language_scores', JSON()),
        
        # Stage 6: Work History
        sa.Column('years_experience', sa.Integer()),
        sa.Column('noc_codes', JSON()),
        sa.Column('teer_level', sa.Enum('teer_0', 'teer_1', 'teer_2', 'teer_3', 'not_sure', name='teerlevel')),
        sa.Column('regulated_occupation', sa.String()),
        sa.Column('work_country', JSON()),
        
        # Stage 7: Job Offer & LMIA
        sa.Column('job_offer_status', sa.Enum('yes', 'no', 'interviewing', 'not_sure', name='jobofferstatus')),
        sa.Column('employer_name', sa.String()),
        sa.Column('job_location', JSON()),
        sa.Column('wage_offer', sa.Float()),
        sa.Column('lmia_status', sa.Enum('approved', 'in_progress', 'exempt', 'not_applicable', 'unknown', name='lmiastatus')),
        
        # Stage 8: Status in Canada (for inland applicants)
        sa.Column('current_status', sa.Enum('visitor', 'student', 'worker', 'pgwp', 'trp', 'refugee_claimant', 'no_status', 'other', name='canadianstatus')),
        sa.Column('status_expiry', sa.DateTime(timezone=True)),
        sa.Column('province_residing', sa.String()),
        
        # Stage 9: Proof of Funds & Settlement Ties
        sa.Column('proof_of_funds', sa.Enum('under_5k', 'five_to_10k', 'ten_to_20k', 'twenty_to_50k', 'over_50k', name='proofoffundsrange')),
        sa.Column('family_ties', sa.Boolean()),
        sa.Column('relationship_type', sa.String()),
        
        # Stage 10: Application History & Inadmissibility
        sa.Column('prior_applications', sa.Boolean()),
        sa.Column('application_outcomes', JSON()),
        sa.Column('inadmissibility_flags', JSON()),
        
        # Stage 11: Provincial/Program Interest
        sa.Column('program_interest', JSON()),
        sa.Column('province_interest', JSON()),
        
        # Stage 12: Timeline & Document Readiness
        sa.Column('urgency', sa.Enum('immediately', 'one_to_three_months', 'three_to_six_months', 'flexible', name='urgencylevel')),
        sa.Column('target_arrival', sa.DateTime(timezone=True)),
        sa.Column('docs_ready', JSON()),
        
        # Metadata
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
    )
    
    # Create unique index on client_id
    op.create_unique_constraint('uq_client_intakes_client_id', 'client_intakes', ['client_id'])
    
    # Create intake_documents table
    op.create_table('intake_documents',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('intake_id', sa.Integer(), sa.ForeignKey('client_intakes.id'), nullable=False),
        sa.Column('file_name', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer()),
        sa.Column('file_type', sa.String()),
        sa.Column('stage', sa.Integer()),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes
    op.create_index('ix_intake_documents_intake_id', 'intake_documents', ['intake_id'])
    op.create_index('ix_intake_documents_stage', 'intake_documents', ['stage'])

def downgrade() -> None:
    # Drop tables and enums
    op.drop_table('intake_documents')
    op.drop_table('client_intakes')
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS intakestatus")
    op.execute("DROP TYPE IF EXISTS location")
    op.execute("DROP TYPE IF EXISTS clientrole")
    op.execute("DROP TYPE IF EXISTS maritalstatus")
    op.execute("DROP TYPE IF EXISTS educationlevel")
    op.execute("DROP TYPE IF EXISTS ecastatus")
    op.execute("DROP TYPE IF EXISTS ecaprovider")
    op.execute("DROP TYPE IF EXISTS languagetesttype")
    op.execute("DROP TYPE IF EXISTS teerlevel")
    op.execute("DROP TYPE IF EXISTS jobofferstatus")
    op.execute("DROP TYPE IF EXISTS lmiastatus")
    op.execute("DROP TYPE IF EXISTS canadianstatus")
    op.execute("DROP TYPE IF EXISTS proofoffundsrange")
    op.execute("DROP TYPE IF EXISTS urgencylevel")