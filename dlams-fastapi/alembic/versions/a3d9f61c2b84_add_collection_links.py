"""Add read-only share links to collections.

Revision ID: a3d9f61c2b84
Revises: f4c2e8a7b913
Create Date: 2026-10-30

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "a3d9f61c2b84"
down_revision: str | Sequence[str] | None = "f4c2e8a7b913"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "collection_links",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("collection_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=True),
        sa.Column("token", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["collection_id"],
            ["collections.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token"),
    )
    op.create_index(
        op.f("ix_collection_links_id"), "collection_links", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_collection_links_collection_id"),
        "collection_links",
        ["collection_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_collection_links_collection_id"), table_name="collection_links"
    )
    op.drop_index(op.f("ix_collection_links_id"), table_name="collection_links")
    op.drop_table("collection_links")
