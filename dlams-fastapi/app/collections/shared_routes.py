"""Public, read-only view of a collection through a share link."""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.collections.schemas import SharedCollectionResponse
from app.collections.video_games_routes import collection_consoles, collection_games
from app.models import Collection, CollectionLink, CollectionType
from app.utils import DbSession

router = APIRouter(prefix="/shared", tags=["share links"])


@router.get("/{token}", response_model=SharedCollectionResponse)
def read_shared_collection(token: str, db: DbSession) -> SharedCollectionResponse:
    collection = db.scalar(
        select(Collection)
        .join(CollectionLink, CollectionLink.collection_id == Collection.id)
        .where(CollectionLink.token == token)
    )
    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This link is no longer active.",
        )
    return SharedCollectionResponse(
        name=collection.name,
        type=CollectionType(collection.type),
        consoles=collection_consoles(db, collection.id),
        games=collection_games(db, collection.id),
    )
