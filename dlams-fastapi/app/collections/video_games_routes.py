"""CRUD endpoints for video-game console inventory and games."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.sandbox import check_item_limit
from app.auth.utils import get_current_user
from app.collections.permissions import (
    ReadableCollection,
    get_writable_collection,
)
from app.collections.video_games_schemas import (
    ConsoleCreate,
    ConsoleLabelListResponse,
    ConsoleLabelResponse,
    ConsoleListResponse,
    ConsoleResponse,
    ConsoleUpdate,
    GameCreate,
    GameListResponse,
    GameResponse,
    GameUpdate,
    VideoGameCollectionStats,
    VideoGameCollectionStatsListResponse,
)
from app.models import (
    Collection,
    CollectionGrant,
    CollectionType,
    Console,
    ConsoleLabel,
    Game,
    User,
    VideoGameCondition,
)
from app.utils import DbSession, get_db

router = APIRouter(prefix="/collections/{collection_id}", tags=["video games"])
stats_router = APIRouter(prefix="/collections", tags=["video games"])
labels_router = APIRouter(prefix="/console-labels", tags=["video games"])


@stats_router.get(
    "/video-game-stats",
    response_model=VideoGameCollectionStatsListResponse,
)
def list_video_game_collection_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VideoGameCollectionStatsListResponse:
    shared_ids = db.query(CollectionGrant.collection_id).filter(
        CollectionGrant.user_id == current_user.id
    )
    collection_ids = [
        collection_id
        for (collection_id,) in (
            db.query(Collection.id)
            .filter(
                Collection.type == CollectionType.VIDEO_GAME.value,
                or_(
                    Collection.owner_id == current_user.id,
                    Collection.id.in_(shared_ids),
                ),
            )
            .order_by(Collection.id)
            .all()
        )
    ]
    counts = {collection_id: [0, 0] for collection_id in collection_ids}
    if collection_ids:
        for collection_id, count in (
            db.query(Console.collection_id, func.count(Console.id))
            .filter(Console.collection_id.in_(collection_ids))
            .group_by(Console.collection_id)
            .all()
        ):
            counts[collection_id][1] = count

        for collection_id, count in (
            db.query(Game.collection_id, func.count(Game.id))
            .filter(Game.collection_id.in_(collection_ids))
            .group_by(Game.collection_id)
            .all()
        ):
            counts[collection_id][0] = count

    return VideoGameCollectionStatsListResponse(
        stats=[
            VideoGameCollectionStats(
                collection_id=collection_id,
                game_count=item_counts[0],
                console_count=item_counts[1],
            )
            for collection_id, item_counts in counts.items()
        ]
    )


def _get_label(db: Session, label_id: int) -> ConsoleLabel:
    label = db.get(ConsoleLabel, label_id)
    if label is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Console label not found",
        )
    return label


def _delete_label_if_unused(db: Session, label: ConsoleLabel) -> None:
    """Drop a label once no console and no game uses it."""
    in_use = (
        db.query(Console.id).filter(Console.console_label_id == label.id).first()
        or db.query(Game.id).filter(Game.console_label_id == label.id).first()
    )
    if in_use is None:
        db.delete(label)


def _get_or_create_label(
    db: Session,
    owner_id: int,
    name: str,
) -> ConsoleLabel:
    normalized_name = name.strip()
    if not normalized_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Console label cannot be blank",
        )

    label = (
        db.query(ConsoleLabel)
        .filter(
            ConsoleLabel.user_id == owner_id,
            func.lower(ConsoleLabel.name) == normalized_name.lower(),
        )
        .first()
    )
    if label is not None:
        return label

    label = ConsoleLabel(user_id=owner_id, name=normalized_name)
    db.add(label)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        label = (
            db.query(ConsoleLabel)
            .filter(
                ConsoleLabel.user_id == owner_id,
                func.lower(ConsoleLabel.name) == normalized_name.lower(),
            )
            .first()
        )
        if label is None:
            raise
    return label


def _console_response(db: Session, console: Console) -> ConsoleResponse:
    label = (
        db.query(ConsoleLabel).filter(ConsoleLabel.id == console.console_label_id).one()
    )
    return ConsoleResponse(
        id=console.id,
        console_label_id=label.id,
        label=label.name,
        edition=console.edition,
        condition=VideoGameCondition(console.condition),
    )


def _game_response(db: Session, game: Game) -> GameResponse:
    label = (
        db.query(ConsoleLabel).filter(ConsoleLabel.id == game.console_label_id).one()
    )
    return GameResponse(
        id=game.id,
        name=game.name,
        condition=VideoGameCondition(game.condition),
        console_label_id=label.id,
        console_label=label.name,
        last_played=game.last_played,
        completed=game.completed,
    )


@router.post(
    "/consoles",
    response_model=ConsoleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_console(
    request: ConsoleCreate,
    collection: Collection = Depends(get_writable_collection),
    db: Session = Depends(get_db),
) -> ConsoleResponse:
    check_item_limit(db, collection)
    label = _get_or_create_label(db, collection.owner_id, request.label)
    edition = request.edition.strip() if request.edition else None
    console = Console(
        collection_id=collection.id,
        console_label_id=label.id,
        edition=edition or None,
        condition=request.condition.value,
    )
    db.add(console)
    db.commit()
    db.refresh(console)
    return _console_response(db, console)


def collection_consoles(db: Session, collection_id: int) -> list[ConsoleResponse]:
    rows = db.scalars(
        select(Console)
        .join(ConsoleLabel, ConsoleLabel.id == Console.console_label_id)
        .where(Console.collection_id == collection_id)
        .order_by(ConsoleLabel.name, Console.id)
    ).all()
    return [_console_response(db, console) for console in rows]


def collection_games(db: Session, collection_id: int) -> list[GameResponse]:
    rows = db.scalars(
        select(Game).where(Game.collection_id == collection_id).order_by(Game.id)
    ).all()
    return [_game_response(db, game) for game in rows]


@router.get("/consoles", response_model=ConsoleListResponse)
def list_consoles(
    collection: ReadableCollection,
    db: DbSession,
) -> ConsoleListResponse:
    return ConsoleListResponse(consoles=collection_consoles(db, collection.id))


@router.put("/consoles/{console_id}", response_model=ConsoleResponse)
def update_console(
    console_id: int,
    request: ConsoleUpdate,
    collection: Collection = Depends(get_writable_collection),
    db: Session = Depends(get_db),
) -> ConsoleResponse:
    console = (
        db.query(Console)
        .filter(Console.id == console_id, Console.collection_id == collection.id)
        .first()
    )
    if console is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Console not found",
        )

    old_label = _get_label(db, console.console_label_id)
    new_name = request.label.strip()
    if not new_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Console label cannot be blank",
        )
    if new_name != old_label.name:
        new_label = _get_or_create_label(db, collection.owner_id, new_name)
        if new_label.id == old_label.id:
            old_label.name = new_name
        else:
            console.console_label_id = new_label.id
            db.flush()
            _delete_label_if_unused(db, old_label)

    edition = request.edition.strip() if request.edition else None
    console.edition = edition or None
    console.condition = request.condition.value
    db.commit()
    db.refresh(console)
    return _console_response(db, console)


@router.delete("/consoles/{console_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_console(
    console_id: int,
    collection: Collection = Depends(get_writable_collection),
    db: Session = Depends(get_db),
) -> Response:
    console = (
        db.query(Console)
        .filter(Console.id == console_id, Console.collection_id == collection.id)
        .first()
    )
    if console is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Console not found",
        )

    label = _get_label(db, console.console_label_id)
    db.delete(console)
    db.flush()
    _delete_label_if_unused(db, label)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@labels_router.get("", response_model=ConsoleLabelListResponse)
def list_console_labels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ConsoleLabelListResponse:
    """The signed-in user's console labels, for the console and game forms."""
    rows = (
        db.query(ConsoleLabel)
        .filter(ConsoleLabel.user_id == current_user.id)
        .order_by(func.lower(ConsoleLabel.name))
        .all()
    )
    return ConsoleLabelListResponse(
        labels=[ConsoleLabelResponse(id=label.id, name=label.name) for label in rows]
    )


@router.post(
    "/games",
    response_model=GameResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_game(
    request: GameCreate,
    collection: Collection = Depends(get_writable_collection),
    db: Session = Depends(get_db),
) -> GameResponse:
    check_item_limit(db, collection)
    name = request.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Game name cannot be blank",
        )
    label = _get_or_create_label(db, collection.owner_id, request.console_label)

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
    return _game_response(db, game)


@router.get("/games", response_model=GameListResponse)
def list_games(
    collection: ReadableCollection,
    db: DbSession,
) -> GameListResponse:
    return GameListResponse(games=collection_games(db, collection.id))


@router.put("/games/{game_id}", response_model=GameResponse)
def update_game(
    game_id: int,
    request: GameUpdate,
    collection: Collection = Depends(get_writable_collection),
    db: Session = Depends(get_db),
) -> GameResponse:
    game = (
        db.query(Game)
        .filter(Game.id == game_id, Game.collection_id == collection.id)
        .first()
    )
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    name = request.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Game name cannot be blank",
        )
    old_label_id = game.console_label_id
    label = _get_or_create_label(db, collection.owner_id, request.console_label)
    game.name = name
    game.condition = request.condition.value
    game.console_label_id = label.id
    game.last_played = request.last_played
    game.completed = request.completed
    if label.id != old_label_id:
        db.flush()
        _delete_label_if_unused(db, _get_label(db, old_label_id))
    db.commit()
    db.refresh(game)
    return _game_response(db, game)


@router.delete("/games/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(
    game_id: int,
    collection: Collection = Depends(get_writable_collection),
    db: Session = Depends(get_db),
) -> Response:
    game = (
        db.query(Game)
        .filter(Game.id == game_id, Game.collection_id == collection.id)
        .first()
    )
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    label = _get_label(db, game.console_label_id)
    db.delete(game)
    db.flush()
    _delete_label_if_unused(db, label)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
