from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.sandbox import check_item_limit
from app.collections.permissions import ReadableCollection, WritableCollection
from app.collections.video_games.label_routes import (
    delete_label_if_unused,
    get_label,
    get_or_create_label,
)
from app.collections.video_games.schemas import (
    ConsoleCreate,
    ConsoleListResponse,
    ConsoleResponse,
    ConsoleUpdate,
)
from app.models import Collection, Console, ConsoleLabel, VideoGameCondition
from app.utils import DbSession

consoles_router = APIRouter(prefix="/collections/{collection_id}", tags=["video games"])


def _console_response(console: Console, label: ConsoleLabel) -> ConsoleResponse:
    return ConsoleResponse(
        id=console.id,
        console_label_id=label.id,
        label=label.name,
        edition=console.edition,
        condition=VideoGameCondition(console.condition),
    )


def _get_collection_console(
    db: Session, collection: Collection, console_id: int
) -> Console:
    console = db.scalar(
        select(Console).where(
            Console.id == console_id, Console.collection_id == collection.id
        )
    )
    if console is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Console not found",
        )
    return console


def collection_consoles(db: Session, collection_id: int) -> list[ConsoleResponse]:
    rows = db.execute(
        select(Console, ConsoleLabel)
        .join(ConsoleLabel, ConsoleLabel.id == Console.console_label_id)
        .where(Console.collection_id == collection_id)
        .order_by(ConsoleLabel.name, Console.id)
    ).all()
    return [_console_response(console, label) for console, label in rows]


@consoles_router.post(
    "/consoles",
    response_model=ConsoleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_console(
    request: ConsoleCreate,
    collection: WritableCollection,
    db: DbSession,
) -> ConsoleResponse:
    check_item_limit(db, collection)
    label = get_or_create_label(db, collection.owner_id, request.label)
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
    return _console_response(console, label)


@consoles_router.get("/consoles", response_model=ConsoleListResponse)
def list_consoles(
    collection: ReadableCollection,
    db: DbSession,
) -> ConsoleListResponse:
    return ConsoleListResponse(consoles=collection_consoles(db, collection.id))


@consoles_router.put("/consoles/{console_id}", response_model=ConsoleResponse)
def update_console(
    console_id: int,
    request: ConsoleUpdate,
    collection: WritableCollection,
    db: DbSession,
) -> ConsoleResponse:
    console = _get_collection_console(db, collection, console_id)

    label = get_label(db, console.console_label_id)
    new_name = request.label.strip()
    if not new_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Console label cannot be blank",
        )
    if new_name != label.name:
        new_label = get_or_create_label(db, collection.owner_id, new_name)
        if new_label.id == label.id:
            label.name = new_name
        else:
            console.console_label_id = new_label.id
            db.flush()
            delete_label_if_unused(db, label)
            label = new_label

    edition = request.edition.strip() if request.edition else None
    console.edition = edition or None
    console.condition = request.condition.value
    db.commit()
    db.refresh(console)
    return _console_response(console, label)


@consoles_router.delete(
    "/consoles/{console_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_console(
    console_id: int,
    collection: WritableCollection,
    db: DbSession,
) -> Response:
    console = _get_collection_console(db, collection, console_id)
    label = get_label(db, console.console_label_id)
    db.delete(console)
    db.flush()
    delete_label_if_unused(db, label)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
