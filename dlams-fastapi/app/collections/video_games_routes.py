"""CRUD endpoints for video-game console inventory and games."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

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
)
from app.collections.permissions import (
    get_readable_collection,
    get_writable_collection,
)
from app.models import (
    Collection,
    Console,
    ConsoleLabel,
    Game,
    VideoGameCondition,
)
from app.utils import get_db

router = APIRouter(prefix="/collections/{collection_id}", tags=["video games"])


def _get_console_label(
    db: Session,
    collection_id: int,
    label_id: int,
) -> ConsoleLabel:
    label = (
        db.query(ConsoleLabel)
        .filter(
            ConsoleLabel.id == label_id,
            ConsoleLabel.collection_id == collection_id,
        )
        .first()
    )
    if label is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Console label not found in this collection",
        )
    return label


def _get_or_create_label(
    db: Session,
    collection_id: int,
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
            ConsoleLabel.collection_id == collection_id,
            ConsoleLabel.name == normalized_name,
        )
        .first()
    )
    if label is not None:
        return label

    label = ConsoleLabel(collection_id=collection_id, name=normalized_name)
    db.add(label)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        label = (
            db.query(ConsoleLabel)
            .filter(
                ConsoleLabel.collection_id == collection_id,
                ConsoleLabel.name == normalized_name,
            )
            .first()
        )
        if label is None:
            raise
    return label


def _console_response(db: Session, console: Console) -> ConsoleResponse:
    label = db.query(ConsoleLabel).filter(ConsoleLabel.id == console.console_label_id).one()
    game_count = (
        db.query(func.count(func.distinct(Game.id)))
        .filter(Game.console_label_id == label.id)
        .scalar()
    )
    return ConsoleResponse(
        id=console.id,
        console_label_id=label.id,
        label=label.name,
        edition=console.edition,
        condition=VideoGameCondition(console.condition),
        game_count=game_count or 0,
    )


def _game_response(db: Session, game: Game) -> GameResponse:
    label = db.query(ConsoleLabel).filter(ConsoleLabel.id == game.console_label_id).one()
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
    label = _get_or_create_label(db, collection.id, request.label)
    edition = request.edition.strip() if request.edition else None
    console = Console(
        console_label_id=label.id,
        edition=edition or None,
        condition=request.condition.value,
    )
    db.add(console)
    db.commit()
    db.refresh(console)
    return _console_response(db, console)


@router.get("/consoles", response_model=ConsoleListResponse)
def list_consoles(
    collection: Collection = Depends(get_readable_collection),
    db: Session = Depends(get_db),
) -> ConsoleListResponse:
    rows = (
        db.query(Console)
        .join(ConsoleLabel, ConsoleLabel.id == Console.console_label_id)
        .filter(ConsoleLabel.collection_id == collection.id)
        .order_by(ConsoleLabel.name, Console.id)
        .all()
    )
    return ConsoleListResponse(
        consoles=[_console_response(db, console) for console in rows]
    )


@router.put("/consoles/{console_id}", response_model=ConsoleResponse)
def update_console(
    console_id: int,
    request: ConsoleUpdate,
    collection: Collection = Depends(get_writable_collection),
    db: Session = Depends(get_db),
) -> ConsoleResponse:
    console = (
        db.query(Console)
        .join(ConsoleLabel, ConsoleLabel.id == Console.console_label_id)
        .filter(Console.id == console_id, ConsoleLabel.collection_id == collection.id)
        .first()
    )
    if console is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Console not found",
        )

    old_label = _get_console_label(db, collection.id, console.console_label_id)
    new_name = request.label.strip()
    if not new_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Console label cannot be blank",
        )
    if new_name != old_label.name:
        remaining_count = (
            db.query(func.count(Console.id))
            .filter(
                Console.console_label_id == old_label.id,
                Console.id != console.id,
            )
            .scalar()
        )
        linked_games = (
            db.query(func.count(Game.id))
            .filter(Game.console_label_id == old_label.id)
            .scalar()
        )
        if not remaining_count and linked_games:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot change the last console label used by games",
            )
        new_label = _get_or_create_label(db, collection.id, new_name)
        console.console_label_id = new_label.id
        if not remaining_count and not linked_games:
            db.flush()
            db.delete(old_label)

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
        .join(ConsoleLabel, ConsoleLabel.id == Console.console_label_id)
        .filter(Console.id == console_id, ConsoleLabel.collection_id == collection.id)
        .first()
    )
    if console is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Console not found",
        )

    label = _get_console_label(db, collection.id, console.console_label_id)
    remaining_count = (
        db.query(func.count(Console.id))
        .filter(
            Console.console_label_id == label.id,
            Console.id != console.id,
        )
        .scalar()
    )
    game_count = (
        db.query(func.count(Game.id))
        .filter(Game.console_label_id == label.id)
        .scalar()
    )
    if not remaining_count and game_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete the last console record while games use its label",
        )

    db.delete(console)
    if not remaining_count:
        db.flush()
        db.delete(label)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/console-labels", response_model=ConsoleLabelListResponse)
def list_console_labels(
    collection: Collection = Depends(get_readable_collection),
    db: Session = Depends(get_db),
) -> ConsoleLabelListResponse:
    rows = (
        db.query(ConsoleLabel, func.count(func.distinct(Game.id)))
        .join(Console, Console.console_label_id == ConsoleLabel.id)
        .outerjoin(Game, Game.console_label_id == ConsoleLabel.id)
        .filter(ConsoleLabel.collection_id == collection.id)
        .group_by(ConsoleLabel.id)
        .order_by(ConsoleLabel.name)
        .all()
    )
    return ConsoleLabelListResponse(
        labels=[
            ConsoleLabelResponse(
                id=label.id,
                name=label.name,
                game_count=count,
            )
            for label, count in rows
        ]
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
    label = _get_console_label(db, collection.id, request.console_label_id)
    has_console = (
        db.query(Console.id)
        .filter(Console.console_label_id == label.id)
        .first()
    )
    if has_console is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Add a physical console record before adding games for this label",
        )

    game = Game(
        console_label_id=label.id,
        name=request.name.strip(),
        condition=request.condition.value,
        last_played=request.last_played,
        completed=request.completed,
    )
    if not game.name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Game name cannot be blank",
        )
    db.add(game)
    db.commit()
    db.refresh(game)
    return _game_response(db, game)


@router.get("/games", response_model=GameListResponse)
def list_games(
    collection: Collection = Depends(get_readable_collection),
    db: Session = Depends(get_db),
) -> GameListResponse:
    rows = (
        db.query(Game)
        .join(ConsoleLabel, ConsoleLabel.id == Game.console_label_id)
        .filter(ConsoleLabel.collection_id == collection.id)
        .order_by(Game.id)
        .all()
    )
    return GameListResponse(games=[_game_response(db, game) for game in rows])


@router.put("/games/{game_id}", response_model=GameResponse)
def update_game(
    game_id: int,
    request: GameUpdate,
    collection: Collection = Depends(get_writable_collection),
    db: Session = Depends(get_db),
) -> GameResponse:
    game = (
        db.query(Game)
        .join(ConsoleLabel, ConsoleLabel.id == Game.console_label_id)
        .filter(Game.id == game_id, ConsoleLabel.collection_id == collection.id)
        .first()
    )
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    label = _get_console_label(db, collection.id, request.console_label_id)
    has_console = (
        db.query(Console.id)
        .filter(Console.console_label_id == label.id)
        .first()
    )
    if has_console is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Add a physical console record before using this label",
        )
    game.name = request.name.strip()
    if not game.name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Game name cannot be blank",
        )
    game.condition = request.condition.value
    game.console_label_id = label.id
    game.last_played = request.last_played
    game.completed = request.completed
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
        .join(ConsoleLabel, ConsoleLabel.id == Game.console_label_id)
        .filter(Game.id == game_id, ConsoleLabel.collection_id == collection.id)
        .first()
    )
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    db.delete(game)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
