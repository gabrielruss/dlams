"""Rename the demo user role to template

Revision ID: f4c2e8a7b913
Revises: e7a3c5d91f20
Create Date: 2026-10-29

"""

from collections.abc import Sequence

from alembic import op

revision: str = "f4c2e8a7b913"
down_revision: str | Sequence[str] | None = "e7a3c5d91f20"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.execute("UPDATE users SET role = 'template' WHERE role = 'demo'")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'template', 'admin', 'sandbox')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.execute("UPDATE users SET role = 'demo' WHERE role = 'template'")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'demo', 'admin', 'sandbox')",
    )
