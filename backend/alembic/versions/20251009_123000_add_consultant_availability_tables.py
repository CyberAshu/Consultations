"""add_consultant_availability_tables

Revision ID: 20251009_123000
Revises: 20250916_100000
Create Date: 2025-10-09 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251009_123000'
down_revision = '20250916_100000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum type for day_of_week (if not exists)
    # Use raw SQL to handle IF NOT EXISTS
    connection = op.get_bind()
    
    # Check if enum exists and create only if it doesn't
    result = connection.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dayofweek')"
    ))
    enum_exists = result.scalar()
    
    if not enum_exists:
        day_of_week_enum = postgresql.ENUM(
            'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
            name='dayofweek',
            create_type=True
        )
        day_of_week_enum.create(connection, checkfirst=False)
    
    # Reference the existing or newly created enum
    day_of_week_enum = postgresql.ENUM(
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
        name='dayofweek',
        create_type=False
    )
    
    # Create consultant_availability table
    op.create_table(
        'consultant_availability',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('consultant_id', sa.Integer(), nullable=False),
        sa.Column('day_of_week', day_of_week_enum, nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('timezone', sa.String(), nullable=False, server_default='America/Toronto'),
        sa.Column('slot_interval_minutes', sa.Integer(), nullable=True, server_default='15'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['consultant_id'], ['consultants.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('consultant_id', 'day_of_week', 'start_time', 
                           name='uq_consultant_day_start_time')
    )
    op.create_index(op.f('ix_consultant_availability_id'), 'consultant_availability', ['id'], unique=False)
    op.create_index('ix_consultant_availability_consultant_id', 'consultant_availability', ['consultant_id'], unique=False)
    op.create_index('ix_consultant_availability_day', 'consultant_availability', ['day_of_week'], unique=False)
    
    # Create consultant_blocked_time table
    op.create_table(
        'consultant_blocked_time',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('consultant_id', sa.Integer(), nullable=False),
        sa.Column('start_datetime', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_datetime', sa.DateTime(timezone=True), nullable=False),
        sa.Column('reason', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['consultant_id'], ['consultants.id'], ondelete='CASCADE')
    )
    op.create_index(op.f('ix_consultant_blocked_time_id'), 'consultant_blocked_time', ['id'], unique=False)
    op.create_index('ix_consultant_blocked_time_consultant_id', 'consultant_blocked_time', ['consultant_id'], unique=False)
    op.create_index('ix_consultant_blocked_time_dates', 'consultant_blocked_time', ['start_datetime', 'end_datetime'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_consultant_blocked_time_dates', table_name='consultant_blocked_time')
    op.drop_index('ix_consultant_blocked_time_consultant_id', table_name='consultant_blocked_time')
    op.drop_index(op.f('ix_consultant_blocked_time_id'), table_name='consultant_blocked_time')
    
    op.drop_index('ix_consultant_availability_day', table_name='consultant_availability')
    op.drop_index('ix_consultant_availability_consultant_id', table_name='consultant_availability')
    op.drop_index(op.f('ix_consultant_availability_id'), table_name='consultant_availability')
    
    # Drop tables
    op.drop_table('consultant_blocked_time')
    op.drop_table('consultant_availability')
    
    # Drop enum type
    day_of_week_enum = postgresql.ENUM(name='dayofweek')
    day_of_week_enum.drop(op.get_bind(), checkfirst=True)
