"""Collection ownership and read-only sharing endpoints."""

import secrets

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select

from app.auth.sandbox import (
    check_collection_limit,
    is_sandbox,
    reject_sandbox_sharing,
)
from app.auth.utils import CurrentUser
from app.collections.permissions import CollectionWithAccess, OwnedCollection
from app.collections.schemas import (
    CollectionCreate,
    CollectionListResponse,
    CollectionResponse,
    GrantCreate,
    GrantListResponse,
    GrantResponse,
    LinkCreate,
    LinkListResponse,
    LinkResponse,
)
from app.models import (
    Collection,
    CollectionAccess,
    CollectionGrant,
    CollectionLink,
    CollectionType,
    User,
)
from app.utils import DbSession

router = APIRouter(prefix="/collections", tags=["collections"])

MAX_LINKS_PER_COLLECTION = 5


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
    db: DbSession,
    current_user: CurrentUser,
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
    db: DbSession,
    current_user: CurrentUser,
) -> CollectionListResponse:
    owned = db.scalars(
        select(Collection)
        .where(Collection.owner_id == current_user.id)
        .order_by(Collection.id)
    ).all()
    shared = db.scalars(
        select(Collection)
        .join(CollectionGrant, CollectionGrant.collection_id == Collection.id)
        .where(CollectionGrant.user_id == current_user.id)
        .order_by(Collection.id)
    ).all()
    collections = [
        _collection_response(collection, CollectionAccess.OWNER) for collection in owned
    ]
    collections.extend(
        _collection_response(collection, CollectionAccess.VIEW_ONLY)
        for collection in shared
    )
    return CollectionListResponse(collections=collections)


@router.get("/{collection_id}", response_model=CollectionResponse)
def read_collection(found: CollectionWithAccess) -> CollectionResponse:
    collection, access = found
    return _collection_response(collection, access)


@router.post(
    "/{collection_id}/grants",
    response_model=GrantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_grant(
    request: GrantCreate,
    collection: OwnedCollection,
    db: DbSession,
    current_user: CurrentUser,
) -> GrantResponse:
    reject_sandbox_sharing(current_user)
    target = db.scalar(select(User).where(User.username == request.username))
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
    existing = db.scalar(
        select(CollectionGrant).where(
            CollectionGrant.collection_id == collection.id,
            CollectionGrant.user_id == target.id,
        )
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has access to this collection",
        )

    grant = CollectionGrant(collection_id=collection.id, user_id=target.id)
    db.add(grant)
    db.commit()
    return GrantResponse(user_id=target.id, username=target.username)


@router.get("/{collection_id}/grants", response_model=GrantListResponse)
def list_grants(
    collection: OwnedCollection,
    db: DbSession,
    current_user: CurrentUser,
) -> GrantListResponse:
    reject_sandbox_sharing(current_user)
    users = db.scalars(
        select(User)
        .join(CollectionGrant, CollectionGrant.user_id == User.id)
        .where(CollectionGrant.collection_id == collection.id)
        .order_by(User.username)
    ).all()
    return GrantListResponse(
        grants=[
            GrantResponse(user_id=user.id, username=user.username) for user in users
        ]
    )


@router.delete(
    "/{collection_id}/grants/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_grant(
    user_id: int,
    collection: OwnedCollection,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    reject_sandbox_sharing(current_user)
    grant = db.scalar(
        select(CollectionGrant).where(
            CollectionGrant.collection_id == collection.id,
            CollectionGrant.user_id == user_id,
        )
    )
    if grant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access grant not found",
        )
    db.delete(grant)
    db.commit()


@router.post(
    "/{collection_id}/links",
    response_model=LinkResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_link(
    request: LinkCreate,
    collection: OwnedCollection,
    db: DbSession,
) -> LinkResponse:
    count = (
        db.scalar(
            select(func.count())
            .select_from(CollectionLink)
            .where(CollectionLink.collection_id == collection.id)
        )
        or 0
    )
    if count >= MAX_LINKS_PER_COLLECTION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A collection can have at most {MAX_LINKS_PER_COLLECTION} links",
        )
    name = request.name.strip() if request.name else None
    link = CollectionLink(
        collection_id=collection.id,
        name=name or None,
        token=secrets.token_urlsafe(16),
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return LinkResponse.model_validate(link)


@router.get("/{collection_id}/links", response_model=LinkListResponse)
def list_links(
    collection: OwnedCollection,
    db: DbSession,
) -> LinkListResponse:
    links = db.scalars(
        select(CollectionLink)
        .where(CollectionLink.collection_id == collection.id)
        .order_by(CollectionLink.id)
    ).all()

    return LinkListResponse(links=[LinkResponse.model_validate(link) for link in links])


@router.delete(
    "/{collection_id}/links/{link_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_link(
    link_id: int,
    collection: OwnedCollection,
    db: DbSession,
) -> None:
    link = db.scalar(
        select(CollectionLink).where(
            CollectionLink.id == link_id,
            CollectionLink.collection_id == collection.id,
        )
    )
    if link is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found",
        )
    db.delete(link)
    db.commit()
