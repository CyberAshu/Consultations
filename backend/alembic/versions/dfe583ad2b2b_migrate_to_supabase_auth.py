"""migrate_to_supabase_auth

Revision ID: dfe583ad2b2b
Revises: 001
Create Date: 2025-07-30 15:40:30.561438

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dfe583ad2b2b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # NOTE: This migration will break existing data relationships since we're converting
    # from integer IDs to UUIDs. You'll need to manually update these relationships
    # to point to actual Supabase Auth user IDs after migration.
    
    # Step 1: Drop foreign key constraints that reference users table
    try:
        op.drop_constraint('consultant_reviews_client_id_fkey', 'consultant_reviews', type_='foreignkey')
    except:
        pass
    try:
        op.drop_constraint('consultants_user_id_fkey', 'consultants', type_='foreignkey')
    except:
        pass
    try:
        op.drop_constraint('bookings_client_id_fkey', 'bookings', type_='foreignkey')
    except:
        pass
    try:
        op.drop_constraint('blog_posts_author_id_fkey', 'blog_posts', type_='foreignkey')
    except:
        pass
    try:
        op.drop_constraint('blog_comments_author_id_fkey', 'blog_comments', type_='foreignkey')
    except:
        pass
    try:
        op.drop_constraint('blog_likes_user_id_fkey', 'blog_likes', type_='foreignkey')
    except:
        pass
    
    # Step 2: Use raw SQL to modify columns with USING clause
    # Since we can't directly convert integers to UUIDs, we'll set them to a dummy UUID
    # and you'll need to update them with actual Supabase Auth user IDs later
    
    dummy_uuid = "00000000-0000-0000-0000-000000000000"
    
    op.execute(f"ALTER TABLE consultants ALTER COLUMN user_id TYPE UUID USING '{dummy_uuid}'::uuid")
    op.execute(f"ALTER TABLE bookings ALTER COLUMN client_id TYPE UUID USING '{dummy_uuid}'::uuid")
    op.execute(f"ALTER TABLE blog_posts ALTER COLUMN author_id TYPE UUID USING '{dummy_uuid}'::uuid")
    op.execute(f"ALTER TABLE blog_comments ALTER COLUMN author_id TYPE UUID USING '{dummy_uuid}'::uuid")
    op.execute(f"ALTER TABLE blog_likes ALTER COLUMN user_id TYPE UUID USING '{dummy_uuid}'::uuid")
    op.execute(f"ALTER TABLE consultant_reviews ALTER COLUMN client_id TYPE UUID USING '{dummy_uuid}'::uuid")
    
    # Step 3: Rename users table to users_legacy for reference/backup
    op.rename_table('users', 'users_legacy')
    
    # Step 4: Drop indexes that referenced the old users table
    try:
        op.drop_index('ix_users_email', table_name='users_legacy')
    except:
        pass
    try:
        op.drop_index('ix_users_full_name', table_name='users_legacy')
    except:
        pass
    try:
        op.drop_index('ix_users_id', table_name='users_legacy')
    except:
        pass
    
    # Step 5: Update users_legacy table structure
    # Drop the default first, then change the type
    op.execute("ALTER TABLE users_legacy ALTER COLUMN id DROP DEFAULT")
    # Drop the sequence if it exists
    op.execute("DROP SEQUENCE IF EXISTS users_id_seq CASCADE")
    op.execute(f"ALTER TABLE users_legacy ALTER COLUMN id TYPE UUID USING '{dummy_uuid}'::uuid")
    op.drop_column('users_legacy', 'hashed_password')
    
    # Recreate indexes for users_legacy
    op.create_index('ix_users_legacy_email', 'users_legacy', ['email'], unique=True)
    op.create_index('ix_users_legacy_full_name', 'users_legacy', ['full_name'], unique=False)
    op.create_index('ix_users_legacy_id', 'users_legacy', ['id'], unique=False)


def downgrade() -> None:
    # This is a one-way migration - we don't want to go back to the old auth system
    # If you need to rollback, you'll need to restore from backup
    raise Exception("This migration cannot be rolled back. Please restore from backup if needed.")
