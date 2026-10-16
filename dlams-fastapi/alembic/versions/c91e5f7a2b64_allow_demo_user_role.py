"""Allow the demo user role

Revision ID: c91e5f7a2b64
Revises: b7d4a1c93e52
Create Date: 2026-10-15

"""
from typing import Sequence, Union

from alembic import op


revision: str = "c91e5f7a2b64"
down_revision: Union[str, Sequence[str], None] = "b7d4a1c93e52"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'demo', 'admin')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.execute("UPDATE users SET role = 'user' WHERE role = 'demo'")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'admin')",
    )
