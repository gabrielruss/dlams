"""Add a type to collections.

Revision ID: 71c4e8a2f963
Revises: f6b31c8d2a40
Create Date: 2026-10-08

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "71c4e8a2f963"
down_revision: str | Sequence[str] | None = "f6b31c8d2a40"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("collections") as batch_op:
        batch_op.add_column(
            sa.Column(
                "type",
                sa.String(length=30),
                server_default="video_game",
                nullable=False,
            )
        )
        batch_op.create_check_constraint(
            "ck_collections_type",
            "type IN ('video_game')",
        )


def downgrade() -> None:
    with op.batch_alter_table("collections") as batch_op:
        batch_op.drop_constraint("ck_collections_type", type_="check")
        batch_op.drop_column("type")
