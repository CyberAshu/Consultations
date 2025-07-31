"""update_consultant_applications_table_with_phase1_fields

Revision ID: 74fc1b53ccf7
Revises: 78052e7247ad
Create Date: 2025-07-31 15:06:29.497541

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '74fc1b53ccf7'
down_revision = '78052e7247ad'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to consultant_applications table
    
    # Section 2: Additional Licensing & Credentials fields
    op.add_column('consultant_applications', sa.Column('proof_of_good_standing_url', sa.String(), nullable=True))
    op.add_column('consultant_applications', sa.Column('insurance_certificate_url', sa.String(), nullable=True))
    op.add_column('consultant_applications', sa.Column('government_id_url', sa.String(), nullable=True))
    
    # Section 3: Practice Details
    op.add_column('consultant_applications', sa.Column('practice_type', sa.String(), nullable=True))
    op.add_column('consultant_applications', sa.Column('business_firm_name', sa.String(), nullable=True))
    op.add_column('consultant_applications', sa.Column('website_linkedin', sa.String(), nullable=True))
    op.add_column('consultant_applications', sa.Column('canadian_business_registration', sa.Boolean(), nullable=True))
    op.add_column('consultant_applications', sa.Column('irb_authorization', sa.Boolean(), nullable=True))
    op.add_column('consultant_applications', sa.Column('taking_clients_private_practice', sa.Boolean(), nullable=True))
    op.add_column('consultant_applications', sa.Column('representing_clients_ircc_irb', sa.Boolean(), nullable=True))
    
    # Section 4: Areas of Expertise
    op.add_column('consultant_applications', sa.Column('areas_of_expertise', sa.JSON(), nullable=True))
    op.add_column('consultant_applications', sa.Column('other_expertise', sa.Text(), nullable=True))
    
    # Section 5: Languages Spoken
    op.add_column('consultant_applications', sa.Column('primary_language', sa.String(), nullable=True))
    op.add_column('consultant_applications', sa.Column('other_languages', sa.JSON(), nullable=True))
    op.add_column('consultant_applications', sa.Column('multilingual_consultations', sa.Boolean(), nullable=True))
    
    # Section 6: Declarations & Agreements
    op.add_column('consultant_applications', sa.Column('confirm_licensed_rcic', sa.Boolean(), nullable=True))
    op.add_column('consultant_applications', sa.Column('agree_terms_guidelines', sa.Boolean(), nullable=True))
    op.add_column('consultant_applications', sa.Column('agree_compliance_irpa', sa.Boolean(), nullable=True))
    op.add_column('consultant_applications', sa.Column('agree_no_outside_contact', sa.Boolean(), nullable=True))
    op.add_column('consultant_applications', sa.Column('consent_session_reviews', sa.Boolean(), nullable=True))
    
    # Section 7: Signature & Submission
    op.add_column('consultant_applications', sa.Column('digital_signature_name', sa.String(), nullable=True))
    op.add_column('consultant_applications', sa.Column('submission_date', sa.DateTime(timezone=True), nullable=True))
    
    # Admin fields
    op.add_column('consultant_applications', sa.Column('admin_notes', sa.Text(), nullable=True))
    op.add_column('consultant_applications', sa.Column('reviewed_by', sa.String(), nullable=True))
    op.add_column('consultant_applications', sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    pass
