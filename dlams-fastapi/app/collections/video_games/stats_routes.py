from fastapi import APIRouter
from sqlalchemy import func, or_, select

from app.auth.utils import CurrentUser
from app.collections.video_games.schemas import (
    VideoGameCollectionStats,
    VideoGameCollectionStatsListResponse,
)
from app.models import Collection, CollectionGrant, CollectionType, Console, Game
from app.utils import DbSession

video_game_stats_router = APIRouter(prefix="/collections", tags=["video games"])


@video_game_stats_router.get(
    "/video-game-stats",
    response_model=VideoGameCollectionStatsListResponse,
)
def list_video_game_collection_stats(
    db: DbSession,
    current_user: CurrentUser,
) -> VideoGameCollectionStatsListResponse:
    shared_collection_ids = select(CollectionGrant.collection_id).where(
        CollectionGrant.user_id == current_user.id
    )
    collection_ids = db.scalars(
        select(Collection.id)
        .where(
            Collection.type == CollectionType.VIDEO_GAME.value,
            or_(
                Collection.owner_id == current_user.id,
                Collection.id.in_(shared_collection_ids),
            ),
        )
        .order_by(Collection.id)
    ).all()
    console_counts: dict[int, int] = {}
    game_counts: dict[int, int] = {}
    if collection_ids:
        console_counts = dict(
            db.execute(
                select(Console.collection_id, func.count(Console.id))
                .where(Console.collection_id.in_(collection_ids))
                .group_by(Console.collection_id)
            )
            .tuples()
            .all()
        )
        game_counts = dict(
            db.execute(
                select(Game.collection_id, func.count(Game.id))
                .where(Game.collection_id.in_(collection_ids))
                .group_by(Game.collection_id)
            )
            .tuples()
            .all()
        )

    return VideoGameCollectionStatsListResponse(
        stats=[
            VideoGameCollectionStats(
                collection_id=collection_id,
                game_count=game_counts.get(collection_id, 0),
                console_count=console_counts.get(collection_id, 0),
            )
            for collection_id in collection_ids
        ]
    )
