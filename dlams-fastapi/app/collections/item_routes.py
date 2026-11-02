"""Every item in the signed-in user's own collections, for search."""

from fastapi import APIRouter

from app.auth.utils import CurrentUser
from app.collections.schemas import ItemListResponse
from app.collections.video_games_items import owned_video_game_items
from app.utils import DbSession

router = APIRouter(prefix="/items", tags=["search"])


@router.get("", response_model=ItemListResponse)
def list_owned_items(db: DbSession, current_user: CurrentUser) -> ItemListResponse:
    items = owned_video_game_items(db, current_user.id)
    items.sort(key=lambda item: (item.title.lower(), item.type.value, item.id))
    return ItemListResponse(items=items)
