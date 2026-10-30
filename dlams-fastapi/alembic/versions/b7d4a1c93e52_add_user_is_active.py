"""Add is_active to users

Revision ID: b7d4a1c93e52
Revises: 8b21f4a69c73
Create Date: 2026-10-12

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "b7d4a1c93e52"
down_revision: str | Sequence[str] | None = "8b21f4a69c73"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.true(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "is_active")
