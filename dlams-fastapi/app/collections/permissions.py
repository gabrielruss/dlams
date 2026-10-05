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
    """Return the user's access mode, or None when they have no access."""
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
    return CollectionAccess(grant.mode)


def get_readable_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Collection:
    """Return a collection the signed-in user owns or has a grant to read."""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )
    if get_collection_access(db, collection, current_user) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )
    return collection


def get_writable_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Collection:
    """Return a collection the user owns or has explicit edit access to."""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )

    access = get_collection_access(db, collection, current_user)
    if access is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )
    if access not in (CollectionAccess.OWNER, CollectionAccess.EDIT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Collection is read-only",
        )
    return collection
