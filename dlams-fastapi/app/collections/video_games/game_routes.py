from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.sandbox import check_item_limit
from app.collections.permissions import ReadableCollectionDep, WritableCollectionDep
from app.collections.video_games.label_routes import (
    delete_label_if_unused,
    get_label,
    get_or_create_label,
)
from app.collections.video_games.schemas import (
    GameCreate,
    GameListResponse,
    GameResponse,
    GameUpdate,
)
from app.models import Collection, ConsoleLabel, Game, VideoGameCondition
from app.utils import DbSessionDep

games_router = APIRouter(prefix="/collections/{collection_id}", tags=["video games"])


def _game_response(game: Game, label: ConsoleLabel) -> GameResponse:
    return GameResponse(
        id=game.id,
        name=game.name,
        condition=VideoGameCondition(game.condition),
        console_label_id=label.id,
        console_label=label.name,
        last_played=game.last_played,
        completed=game.completed,
    )


def _get_collection_game(db: Session, collection: Collection, game_id: int) -> Game:
    game = db.scalar(
        select(Game).where(Game.id == game_id, Game.collection_id == collection.id)
    )
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    return game


def _required_game_name(name: str) -> str:
    stripped_name = name.strip()
    if not stripped_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Game name cannot be blank",
        )
    return stripped_name


def collection_games(db: Session, collection_id: int) -> list[GameResponse]:
    rows = db.execute(
        select(Game, ConsoleLabel)
        .join(ConsoleLabel, ConsoleLabel.id == Game.console_label_id)
        .where(Game.collection_id == collection_id)
        .order_by(Game.id)
    ).all()
    return [_game_response(game, label) for game, label in rows]


@games_router.post(
    "/games",
    status_code=status.HTTP_201_CREATED,
)
def create_game(
    request: GameCreate,
    collection: WritableCollectionDep,
    db: DbSessionDep,
) -> GameResponse:
    check_item_limit(db, collection)
    name = _required_game_name(request.name)
    label = get_or_create_label(db, collection.owner_id, request.console_label)

    game = Game(
        collection_id=collection.id,
        console_label_id=label.id,
        name=name,
        condition=request.condition.value,
        last_played=request.last_played,
        completed=request.completed,
    )
    db.add(game)
    db.commit()
    db.refresh(game)
    return _game_response(game, label)


@games_router.get("/games")
def list_games(
    collection: ReadableCollectionDep,
    db: DbSessionDep,
) -> GameListResponse:
    return GameListResponse(games=collection_games(db, collection.id))


@games_router.put("/games/{game_id}")
def update_game(
    game_id: int,
    request: GameUpdate,
    collection: WritableCollectionDep,
    db: DbSessionDep,
) -> GameResponse:
    game = _get_collection_game(db, collection, game_id)
    name = _required_game_name(request.name)
    old_label_id = game.console_label_id
    label = get_or_create_label(db, collection.owner_id, request.console_label)
    game.name = name
    game.condition = request.condition.value
    game.console_label_id = label.id
    game.last_played = request.last_played
    game.completed = request.completed
    if label.id != old_label_id:
        db.flush()
        delete_label_if_unused(db, get_label(db, old_label_id))
    db.commit()
    db.refresh(game)
    return _game_response(game, label)


@games_router.delete("/games/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(
    game_id: int,
    collection: WritableCollectionDep,
    db: DbSessionDep,
) -> Response:
    game = _get_collection_game(db, collection, game_id)
    label = get_label(db, game.console_label_id)
    db.delete(game)
    db.flush()
    delete_label_if_unused(db, label)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
