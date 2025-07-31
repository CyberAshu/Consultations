"""add_newsletter_subscriptions_table

Revision ID: 961d9cc15969
Revises: 708bd9365233
Create Date: 2025-07-31 14:31:47.204794

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '961d9cc15969'
down_revision = '708bd9365233'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create newsletter_subscriptions table
    op.create_table(
        'newsletter_subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, default='active'),
        sa.Column('subscribed_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('unsubscribed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='uq_newsletter_email')
    )
    op.create_index('ix_newsletter_email', 'newsletter_subscriptions', ['email'])
    op.create_index('ix_newsletter_status', 'newsletter_subscriptions', ['status'])


def downgrade() -> None:
    pass
