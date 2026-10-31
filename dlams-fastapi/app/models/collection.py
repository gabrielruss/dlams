"""Collection models and the access levels a user can have to one."""

from datetime import UTC, datetime
from enum import Enum

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class CollectionAccess(str, Enum):
    """A user's access to a collection: the owner writes, anyone shared reads."""

    OWNER = "owner"
    VIEW_ONLY = "view-only"


class CollectionType(str, Enum):
    """Content type supported by a collection."""

    VIDEO_GAME = "video_game"


class Collection(Base):
    """A named collection owned by one user."""

    __tablename__ = "collections"
    __table_args__ = (
        CheckConstraint(
            "type IN ('video_game')",
            name="ck_collections_type",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=CollectionType.VIDEO_GAME.value,
        server_default=CollectionType.VIDEO_GAME.value,
    )


class CollectionGrant(Base):
    """Read-only access to a collection for a user who does not own it."""

    __tablename__ = "collection_grants"
    __table_args__ = (
        UniqueConstraint(
            "collection_id",
            "user_id",
            name="uq_collection_grants_collection_user",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    collection_id: Mapped[int] = mapped_column(
        ForeignKey("collections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )


class CollectionLink(Base):
    """A read-only share link to a collection, opened by its token."""

    __tablename__ = "collection_links"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    collection_id: Mapped[int] = mapped_column(
        ForeignKey("collections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    token: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
