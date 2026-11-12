from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.utils import CurrentUserDep
from app.collections.video_games.schemas import (
    ConsoleLabelListResponse,
    ConsoleLabelResponse,
)
from app.models import Console, ConsoleLabel, Game
from app.utils import DbSessionDep

console_labels_router = APIRouter(prefix="/console-labels", tags=["video games"])


def get_label(db: Session, label_id: int) -> ConsoleLabel:
    label = db.get(ConsoleLabel, label_id)
    if label is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Console label not found",
        )
    return label


def delete_label_if_unused(db: Session, label: ConsoleLabel) -> None:
    """Drop a label once no console and no game uses it."""
    console_id = db.scalar(
        select(Console.id).where(Console.console_label_id == label.id).limit(1)
    )
    game_id = db.scalar(
        select(Game.id).where(Game.console_label_id == label.id).limit(1)
    )
    if console_id is None and game_id is None:
        db.delete(label)


def _find_owner_label(db: Session, owner_id: int, name: str) -> ConsoleLabel | None:
    return db.scalar(
        select(ConsoleLabel).where(
            ConsoleLabel.user_id == owner_id,
            func.lower(ConsoleLabel.name) == name.lower(),
        )
    )


def get_or_create_label(
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

    label = _find_owner_label(db, owner_id, normalized_name)
    if label is not None:
        return label

    label = ConsoleLabel(user_id=owner_id, name=normalized_name)
    db.add(label)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        label = _find_owner_label(db, owner_id, normalized_name)
        if label is None:
            raise
    return label


@console_labels_router.get("", response_model=ConsoleLabelListResponse)
def list_console_labels(
    db: DbSessionDep,
    current_user: CurrentUserDep,
) -> ConsoleLabelListResponse:
    """The signed-in user's console labels, for the console and game forms."""
    labels = db.scalars(
        select(ConsoleLabel)
        .where(ConsoleLabel.user_id == current_user.id)
        .order_by(func.lower(ConsoleLabel.name))
    ).all()
    return ConsoleLabelListResponse(
        labels=[ConsoleLabelResponse(id=label.id, name=label.name) for label in labels]
    )
