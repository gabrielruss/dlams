"""Collection models and collection-level access modes."""

from enum import Enum

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class CollectionAccess(str, Enum):
    """Access granted to a user for a collection."""

    OWNER = "owner"
    EDIT = "edit"
    VIEW_ONLY = "view-only"
    DEMO = "demo"


class CollectionType(str, Enum):
    """Content type supported by a collection."""

    VIDEO_GAME = "video_game"


class GrantMode(str, Enum):
    """Modes that can be assigned on a collection grant."""

    EDIT = "edit"
    VIEW_ONLY = "view-only"
    DEMO = "demo"


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
    """A user's access mode for a collection they do not own."""

    __tablename__ = "collection_grants"
    __table_args__ = (
        CheckConstraint(
            "mode IN ('edit', 'view-only', 'demo')",
            name="ck_collection_grants_mode",
        ),
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
    mode: Mapped[str] = mapped_column(String(20), nullable=False)
