"""Video-game and console inventory models."""

from enum import Enum
from datetime import date

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    String,
    UniqueConstraint,
    false,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class VideoGameCondition(str, Enum):
    """Condition choices for games and physical console records."""

    LOOSE = "Loose"
    CIB = "CIB"
    NEW = "New"
    ITEM_AND_BOX = "Item & Box"


class ConsoleLabel(Base):
    """A collection-scoped platform label used by games and consoles."""

    __tablename__ = "console_labels"
    __table_args__ = (
        UniqueConstraint(
            "collection_id",
            "name",
            name="uq_console_labels_collection_name",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    collection_id: Mapped[int] = mapped_column(
        ForeignKey("collections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)


class Console(Base):
    """One physical console owned in a collection."""

    __tablename__ = "consoles"
    __table_args__ = (
        CheckConstraint(
            "condition IN ('Loose', 'CIB', 'New', 'Item & Box')",
            name="ck_consoles_condition",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    console_label_id: Mapped[int] = mapped_column(
        ForeignKey("console_labels.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    edition: Mapped[str | None] = mapped_column(String(100), nullable=True)
    condition: Mapped[str] = mapped_column(String(20), nullable=False)


class Game(Base):
    """One owned game record associated with a console label."""

    __tablename__ = "games"
    __table_args__ = (
        CheckConstraint(
            "condition IN ('Loose', 'CIB', 'New', 'Item & Box')",
            name="ck_games_condition",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    console_label_id: Mapped[int] = mapped_column(
        ForeignKey("console_labels.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    condition: Mapped[str] = mapped_column(String(20), nullable=False)
    last_played: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed: Mapped[bool] = mapped_column(
        nullable=False,
        default=False,
        server_default=false(),
    )
