"""Reusable collection-level authorization dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.utils import CurrentUser
from app.models import Collection, CollectionAccess, CollectionGrant, User
from app.utils import DbSession


def _not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Collection not found",
    )


def get_collection_access(
    db: Session,
    collection: Collection,
    user: User,
) -> CollectionAccess | None:
    """Return the user's access, or None when they have none."""
    if collection.owner_id == user.id:
        return CollectionAccess.OWNER

    grant = db.scalar(
        select(CollectionGrant).where(
            CollectionGrant.collection_id == collection.id,
            CollectionGrant.user_id == user.id,
        )
    )
    if grant is None:
        return None
    return CollectionAccess.VIEW_ONLY


def get_collection_with_access(
    collection_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> tuple[Collection, CollectionAccess]:
    """Return a collection and the user's access, or 404 when they have none."""
    collection = db.get(Collection, collection_id)
    access = (
        None
        if collection is None
        else get_collection_access(db, collection, current_user)
    )
    if collection is None or access is None:
        raise _not_found()
    return collection, access


def get_readable_collection(
    collection_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> Collection:
    """Return a collection the signed-in user owns or has a grant to read."""
    collection, _ = get_collection_with_access(collection_id, db, current_user)
    return collection


def get_writable_collection(
    collection_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> Collection:
    """Return a collection the signed-in user owns. Shared collections are read-only."""
    collection, access = get_collection_with_access(collection_id, db, current_user)
    if access is not CollectionAccess.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Collection is read-only",
        )
    return collection


def get_owned_collection(
    collection_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> Collection:
    """Return a collection the signed-in user owns, for managing who can see it.
    Anyone else gets 404, so a reader cannot tell these routes exist for them."""
    collection = db.scalar(
        select(Collection).where(
            Collection.id == collection_id,
            Collection.owner_id == current_user.id,
        )
    )
    if collection is None:
        raise _not_found()
    return collection


CollectionWithAccess = Annotated[
    tuple[Collection, CollectionAccess], Depends(get_collection_with_access)
]
ReadableCollection = Annotated[Collection, Depends(get_readable_collection)]
WritableCollection = Annotated[Collection, Depends(get_writable_collection)]
OwnedCollection = Annotated[Collection, Depends(get_owned_collection)]
