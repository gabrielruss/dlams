"""Collection ownership and read-only sharing endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.sandbox import (
    check_collection_limit,
    is_sandbox,
    reject_sandbox_sharing,
)
from app.auth.utils import get_current_user
from app.collections.permissions import get_collection_with_access
from app.collections.schemas import (
    CollectionCreate,
    CollectionListResponse,
    CollectionResponse,
    GrantCreate,
    GrantListResponse,
    GrantResponse,
)
from app.models import (
    Collection,
    CollectionAccess,
    CollectionGrant,
    CollectionType,
    User,
)
from app.utils import get_db

router = APIRouter(prefix="/collections", tags=["collections"])


def _get_owned_collection(
    collection_id: int,
    db: Session,
    current_user: User,
) -> Collection:
    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.owner_id == current_user.id,
        )
        .first()
    )
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )
    return collection


def _collection_response(
    collection: Collection,
    access: CollectionAccess,
) -> CollectionResponse:
    return CollectionResponse(
        id=collection.id,
        owner_id=collection.owner_id,
        name=collection.name,
        type=CollectionType(collection.type),
        access=access,
    )


@router.post(
    "",
    response_model=CollectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_collection(
    request: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CollectionResponse:
    check_collection_limit(db, current_user)
    collection = Collection(
        owner_id=current_user.id,
        name=request.name,
        type=request.type.value,
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return _collection_response(collection, CollectionAccess.OWNER)


@router.get("", response_model=CollectionListResponse)
def list_collections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CollectionListResponse:
    owned = (
        db.query(Collection)
        .filter(Collection.owner_id == current_user.id)
        .order_by(Collection.id)
        .all()
    )
    shared = (
        db.query(Collection)
        .join(CollectionGrant, CollectionGrant.collection_id == Collection.id)
        .filter(CollectionGrant.user_id == current_user.id)
        .order_by(Collection.id)
        .all()
    )
    collections = [
        _collection_response(collection, CollectionAccess.OWNER)
        for collection in owned
    ]
    collections.extend(
        _collection_response(collection, CollectionAccess.VIEW_ONLY)
        for collection in shared
    )
    return CollectionListResponse(collections=collections)


@router.get("/{collection_id}", response_model=CollectionResponse)
def read_collection(
    found: tuple[Collection, CollectionAccess] = Depends(get_collection_with_access),
) -> CollectionResponse:
    collection, access = found
    return _collection_response(collection, access)


@router.post(
    "/{collection_id}/grants",
    response_model=GrantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_grant(
    request: GrantCreate,
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GrantResponse:
    reject_sandbox_sharing(current_user)
    _get_owned_collection(collection_id, db, current_user)
    target = (
        db.query(User)
        .filter(User.username == request.username)
        .first()
    )
    if target is None or is_sandbox(target):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if target.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Collection owners do not need an access grant",
        )
    existing = (
        db.query(CollectionGrant)
        .filter(
            CollectionGrant.collection_id == collection_id,
            CollectionGrant.user_id == target.id,
        )
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has access to this collection",
        )

    grant = CollectionGrant(collection_id=collection_id, user_id=target.id)
    db.add(grant)
    db.commit()
    return GrantResponse(user_id=target.id, username=target.username)


@router.get("/{collection_id}/grants", response_model=GrantListResponse)
def list_grants(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GrantListResponse:
    reject_sandbox_sharing(current_user)
    _get_owned_collection(collection_id, db, current_user)
    users = (
        db.query(User)
        .join(CollectionGrant, CollectionGrant.user_id == User.id)
        .filter(CollectionGrant.collection_id == collection_id)
        .order_by(User.username)
        .all()
    )
    return GrantListResponse(
        grants=[
            GrantResponse(user_id=user.id, username=user.username)
            for user in users
        ]
    )


@router.delete(
    "/{collection_id}/grants/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_grant(
    collection_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    reject_sandbox_sharing(current_user)
    _get_owned_collection(collection_id, db, current_user)
    grant = (
        db.query(CollectionGrant)
        .filter(
            CollectionGrant.collection_id == collection_id,
            CollectionGrant.user_id == user_id,
        )
        .first()
    )
    if grant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access grant not found",
        )
    db.delete(grant)
    db.commit()
