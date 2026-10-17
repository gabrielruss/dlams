"""Read-only sharing; console labels belong to users; items belong to collections

Revision ID: b8e1d6a42c07
Revises: c91e5f7a2b64
Create Date: 2026-10-16

Reshapes collection_grants, console_labels, consoles, and games:

* collection_grants lose their access mode (all sharing is read-only).
* console_labels belong to a user (the collection owner) and are reused
  across that user's collections.
* consoles and games each carry their own collection_id.

These four tables are dropped and recreated, which deletes every row in them.
The owner confirmed on 2026-10-16 that there is no data to keep; take a
backup (dlams-deployment/scripts/backup-db.sh) before deploying anyway. The
downgrade restores the previous (empty) table shapes.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b8e1d6a42c07"
down_revision: Union[str, Sequence[str], None] = "c91e5f7a2b64"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CONDITION_CHECK = "condition IN ('Loose', 'CIB', 'New', 'Item & Box')"


def _drop_item_tables() -> None:
    for table in ("games", "consoles", "console_labels", "collection_grants"):
        op.drop_table(table)


def _create_games(*, with_collection: bool) -> None:
    columns = [sa.Column("id", sa.Integer(), nullable=False)]
    if with_collection:
        columns.append(sa.Column("collection_id", sa.Integer(), nullable=False))
    columns += [
        sa.Column("console_label_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("condition", sa.String(length=20), nullable=False),
        sa.Column("last_played", sa.Date(), nullable=True),
        sa.Column(
            "completed",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
        sa.CheckConstraint(CONDITION_CHECK, name="ck_games_condition"),
        sa.ForeignKeyConstraint(
            ["console_label_id"], ["console_labels.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
    ]
    if with_collection:
        columns.append(
            sa.ForeignKeyConstraint(
                ["collection_id"], ["collections.id"], ondelete="CASCADE"
            )
        )
    op.create_table("games", *columns)
    op.create_index(op.f("ix_games_id"), "games", ["id"])
    op.create_index(
        op.f("ix_games_console_label_id"), "games", ["console_label_id"]
    )
    if with_collection:
        op.create_index(
            op.f("ix_games_collection_id"), "games", ["collection_id"]
        )


def _create_consoles(*, with_collection: bool) -> None:
    columns = [sa.Column("id", sa.Integer(), nullable=False)]
    if with_collection:
        columns.append(sa.Column("collection_id", sa.Integer(), nullable=False))
    columns += [
        sa.Column("console_label_id", sa.Integer(), nullable=False),
        sa.Column("edition", sa.String(length=100), nullable=True),
        sa.Column("condition", sa.String(length=20), nullable=False),
        sa.CheckConstraint(CONDITION_CHECK, name="ck_consoles_condition"),
        sa.ForeignKeyConstraint(
            ["console_label_id"], ["console_labels.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
    ]
    if with_collection:
        columns.append(
            sa.ForeignKeyConstraint(
                ["collection_id"], ["collections.id"], ondelete="CASCADE"
            )
        )
    op.create_table("consoles", *columns)
    op.create_index(op.f("ix_consoles_id"), "consoles", ["id"])
    op.create_index(
        op.f("ix_consoles_console_label_id"), "consoles", ["console_label_id"]
    )
    if with_collection:
        op.create_index(
            op.f("ix_consoles_collection_id"), "consoles", ["collection_id"]
        )


def upgrade() -> None:
    _drop_item_tables()

    op.create_table(
        "collection_grants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("collection_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["collection_id"], ["collections.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "collection_id",
            "user_id",
            name="uq_collection_grants_collection_user",
        ),
    )
    op.create_index(op.f("ix_collection_grants_id"), "collection_grants", ["id"])
    op.create_index(
        op.f("ix_collection_grants_collection_id"),
        "collection_grants",
        ["collection_id"],
    )
    op.create_index(
        op.f("ix_collection_grants_user_id"), "collection_grants", ["user_id"]
    )

    op.create_table(
        "console_labels",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_console_labels_id"), "console_labels", ["id"])
    op.create_index(
        op.f("ix_console_labels_user_id"), "console_labels", ["user_id"]
    )
    op.create_index(
        "uq_console_labels_user_name_lower",
        "console_labels",
        ["user_id", sa.text("lower(name)")],
        unique=True,
    )

    _create_consoles(with_collection=True)
    _create_games(with_collection=True)


def downgrade() -> None:
    _drop_item_tables()

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
            ["collection_id"], ["collections.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "collection_id",
            "user_id",
            name="uq_collection_grants_collection_user",
        ),
    )
    op.create_index(op.f("ix_collection_grants_id"), "collection_grants", ["id"])
    op.create_index(
        op.f("ix_collection_grants_collection_id"),
        "collection_grants",
        ["collection_id"],
    )
    op.create_index(
        op.f("ix_collection_grants_user_id"), "collection_grants", ["user_id"]
    )

    op.create_table(
        "console_labels",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("collection_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(
            ["collection_id"], ["collections.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "collection_id",
            "name",
            name="uq_console_labels_collection_name",
        ),
    )
    op.create_index(op.f("ix_console_labels_id"), "console_labels", ["id"])
    op.create_index(
        op.f("ix_console_labels_collection_id"),
        "console_labels",
        ["collection_id"],
    )

    _create_consoles(with_collection=False)
    _create_games(with_collection=False)
