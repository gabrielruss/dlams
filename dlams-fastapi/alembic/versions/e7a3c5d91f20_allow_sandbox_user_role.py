"""Allow the sandbox user role

Revision ID: e7a3c5d91f20
Revises: b8e1d6a42c07
Create Date: 2026-10-29

"""
from typing import Sequence, Union

from alembic import op


revision: str = "e7a3c5d91f20"
down_revision: Union[str, Sequence[str], None] = "b8e1d6a42c07"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'demo', 'admin', 'sandbox')",
    )


def downgrade() -> None:
    sandbox_collections = (
        "SELECT id FROM collections WHERE owner_id IN "
        "(SELECT id FROM users WHERE role = 'sandbox')"
    )
    op.execute(f"DELETE FROM games WHERE collection_id IN ({sandbox_collections})")
    op.execute(f"DELETE FROM consoles WHERE collection_id IN ({sandbox_collections})")
    op.execute(
        "DELETE FROM collections WHERE owner_id IN "
        "(SELECT id FROM users WHERE role = 'sandbox')"
    )
    op.execute(
        "DELETE FROM console_labels WHERE user_id IN "
        "(SELECT id FROM users WHERE role = 'sandbox')"
    )
    op.execute("DELETE FROM users WHERE role = 'sandbox'")
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'demo', 'admin')",
    )
