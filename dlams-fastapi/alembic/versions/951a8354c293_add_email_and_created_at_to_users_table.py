"""Add email and created_at to users table

Revision ID: 951a8354c293
Revises: a9cbc9724c7e
Create Date: 2025-10-02 XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone

# revision identifiers, used by Alembic.
revision = '951a8354c293'
down_revision = 'a9cbc9724c7e'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add email column (nullable, so no issues)
    op.add_column('users', sa.Column('email', sa.String(), nullable=True))
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Add created_at column as nullable first
    op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=True))
    
    # Update existing rows with current timestamp
    connection = op.get_bind()
    connection.execute(
        sa.text("UPDATE users SET created_at = :now WHERE created_at IS NULL"),
        {"now": datetime.now(timezone.utc)}
    )
    
    # Now make the column NOT NULL
    op.alter_column('users', 'created_at', nullable=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_column('users', 'email')
    op.drop_column('users', 'created_at')