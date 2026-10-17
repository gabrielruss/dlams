"""Reusable collection-level authorization dependencies."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.utils import get_current_user
from app.models import Collection, CollectionAccess, CollectionGrant, User
from app.utils import get_db


def get_collection_access(
    db: Session,
    collection: Collection,
    user: User,
) -> CollectionAccess | None:
    """Return the user's access, or None when they have none."""
    if collection.owner_id == user.id:
        return CollectionAccess.OWNER

    grant = (
        db.query(CollectionGrant)
        .filter(
            CollectionGrant.collection_id == collection.id,
            CollectionGrant.user_id == user.id,
        )
        .first()
    )
    if grant is None:
        return None
    return CollectionAccess.VIEW_ONLY


def get_collection_with_access(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> tuple[Collection, CollectionAccess]:
    """Return a collection and the user's access, or 404 when they have none."""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    access = (
        None
        if collection is None
        else get_collection_access(db, collection, current_user)
    )
    if collection is None or access is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )
    return collection, access


def get_readable_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Collection:
    """Return a collection the signed-in user owns or has a grant to read."""
    collection, _ = get_collection_with_access(collection_id, db, current_user)
    return collection


def get_writable_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Collection:
    """Return a collection the signed-in user owns. Shared collections are read-only."""
    collection, access = get_collection_with_access(collection_id, db, current_user)
    if access is not CollectionAccess.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Collection is read-only",
        )
    return collection
