"""Add video-game collection records.

Revision ID: f6b31c8d2a40
Revises: e4c21b7a9d30
Create Date: 2026-10-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f6b31c8d2a40"
down_revision: Union[str, Sequence[str], None] = "e4c21b7a9d30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CONDITION_CHECK = "condition IN ('Loose', 'CIB', 'New', 'Item & Box')"


def upgrade() -> None:
    op.create_table(
        "console_labels",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("collection_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(
            ["collection_id"],
            ["collections.id"],
            ondelete="CASCADE",
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

    op.create_table(
        "consoles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("console_label_id", sa.Integer(), nullable=False),
        sa.Column("edition", sa.String(length=100), nullable=True),
        sa.Column("condition", sa.String(length=20), nullable=False),
        sa.CheckConstraint(CONDITION_CHECK, name="ck_consoles_condition"),
        sa.ForeignKeyConstraint(
            ["console_label_id"],
            ["console_labels.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_consoles_id"), "consoles", ["id"])
    op.create_index(
        op.f("ix_consoles_console_label_id"),
        "consoles",
        ["console_label_id"],
    )

    op.create_table(
        "games",
        sa.Column("id", sa.Integer(), nullable=False),
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
            ["console_label_id"],
            ["console_labels.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_games_id"), "games", ["id"])
    op.create_index(
        op.f("ix_games_console_label_id"),
        "games",
        ["console_label_id"],
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_games_console_label_id"), table_name="games")
    op.drop_index(op.f("ix_games_id"), table_name="games")
    op.drop_table("games")

    op.drop_index(
        op.f("ix_consoles_console_label_id"),
        table_name="consoles",
    )
    op.drop_index(op.f("ix_consoles_id"), table_name="consoles")
    op.drop_table("consoles")

    op.drop_index(
        op.f("ix_console_labels_collection_id"),
        table_name="console_labels",
    )
    op.drop_index(op.f("ix_console_labels_id"), table_name="console_labels")
    op.drop_table("console_labels")
