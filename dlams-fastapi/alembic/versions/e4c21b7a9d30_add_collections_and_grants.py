"""Add collections and per-collection access grants.

Revision ID: e4c21b7a9d30
Revises: d0af1c2b4e67
Create Date: 2026-10-04

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "e4c21b7a9d30"
down_revision: str | Sequence[str] | None = "d0af1c2b4e67"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("ck_users_role", "users", type_="check")
    op.execute("UPDATE users SET role = 'user' WHERE role = 'demo'")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'admin')",
    )

    op.create_table(
        "collections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_collections_id"), "collections", ["id"])
    op.create_index(
        op.f("ix_collections_owner_id"),
        "collections",
        ["owner_id"],
    )

    op.create_table(
        "collection_grants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("collection_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("mode", sa.String(length=20), nullable=False),
        sa.CheckConstraint(
            "mode IN ('edit', 'view-only', 'demo')",
            name="ck_collection_grants_mode",
        ),
        sa.ForeignKeyConstraint(
            ["collection_id"],
            ["collections.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "collection_id",
            "user_id",
            name="uq_collection_grants_collection_user",
        ),
    )
    op.create_index(
        op.f("ix_collection_grants_id"),
        "collection_grants",
        ["id"],
    )
    op.create_index(
        op.f("ix_collection_grants_collection_id"),
        "collection_grants",
        ["collection_id"],
    )
    op.create_index(
        op.f("ix_collection_grants_user_id"),
        "collection_grants",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_collection_grants_user_id"),
        table_name="collection_grants",
    )
    op.drop_index(
        op.f("ix_collection_grants_collection_id"),
        table_name="collection_grants",
    )
    op.drop_index(
        op.f("ix_collection_grants_id"),
        table_name="collection_grants",
    )
    op.drop_table("collection_grants")

    op.drop_index(op.f("ix_collections_owner_id"), table_name="collections")
    op.drop_index(op.f("ix_collections_id"), table_name="collections")
    op.drop_table("collections")

    op.drop_constraint("ck_users_role", "users", type_="check")
    op.create_check_constraint(
        "ck_users_role",
        "users",
        "role IN ('user', 'demo', 'admin')",
    )
