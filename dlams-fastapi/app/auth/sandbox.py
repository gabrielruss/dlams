"""
sandbox.py
Temporary demo accounts. Each "Try the demo" click copies the demo template
account into a sandbox account that the visitor can change freely. Sandboxes
are limited in number and size. The visitor's session lasts 30 minutes; the
account stays for 7 days so its share links keep working, unless its slot is
needed sooner.
"""

import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import case, delete, exists, func, select
from sqlalchemy.orm import Session

from app.auth.utils import ACCESS_TOKEN_EXPIRE_MINUTES, pwd_context
from app.models import (
    Collection,
    CollectionLink,
    Console,
    ConsoleLabel,
    Game,
    User,
    UserRole,
)

SANDBOX_SESSION = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
SANDBOX_LIFETIME = timedelta(days=7)
MAX_SANDBOXES = 10
MAX_SANDBOX_COLLECTIONS = 3
MAX_SANDBOX_ITEMS = 30


def is_sandbox(user: User) -> bool:
    """True for a temporary demo account."""
    return user.role == UserRole.SANDBOX.value


def delete_sandbox(db: Session, user: User) -> None:
    """Delete a sandbox account and everything it owns. The caller commits."""
    collection_ids = db.scalars(
        select(Collection.id).where(Collection.owner_id == user.id)
    ).all()
    db.execute(
        delete(CollectionLink).where(CollectionLink.collection_id.in_(collection_ids))
    )
    db.execute(delete(Game).where(Game.collection_id.in_(collection_ids)))
    db.execute(delete(Console).where(Console.collection_id.in_(collection_ids)))
    db.execute(delete(Collection).where(Collection.owner_id == user.id))
    db.execute(delete(ConsoleLabel).where(ConsoleLabel.user_id == user.id))
    db.execute(delete(User).where(User.id == user.id))


def delete_expired_sandboxes(db: Session) -> None:
    """Delete every sandbox older than its lifetime. The caller commits."""
    cutoff = _now() - SANDBOX_LIFETIME
    expired = db.scalars(
        select(User).where(
            User.role == UserRole.SANDBOX.value,
            User.created_at < cutoff,
        )
    ).all()
    for user in expired:
        delete_sandbox(db, user)


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _sandbox_to_replace(db: Session) -> User | None:
    """The sandbox to delete for a new one: the oldest whose session is over,
    preferring one without share links. None while every sandbox is in use."""
    has_links = exists().where(
        CollectionLink.collection_id == Collection.id,
        Collection.owner_id == User.id,
    )
    return db.scalars(
        select(User)
        .where(
            User.role == UserRole.SANDBOX.value,
            User.created_at < _now() - SANDBOX_SESSION,
        )
        .order_by(case((has_links, 1), else_=0), User.created_at, User.id)
    ).first()


def _copy_template(db: Session, template: User, sandbox: User) -> None:
    labels: dict[int, ConsoleLabel] = {}
    for label in db.scalars(
        select(ConsoleLabel).where(ConsoleLabel.user_id == template.id)
    ).all():
        labels[label.id] = ConsoleLabel(user_id=sandbox.id, name=label.name)
        db.add(labels[label.id])
    db.flush()

    collections = db.scalars(
        select(Collection)
        .where(Collection.owner_id == template.id)
        .order_by(Collection.id)
    ).all()
    for collection in collections:
        copy = Collection(
            owner_id=sandbox.id,
            name=collection.name,
            type=collection.type,
        )
        db.add(copy)
        db.flush()

        consoles = db.scalars(
            select(Console)
            .where(Console.collection_id == collection.id)
            .order_by(Console.id)
        ).all()
        for console in consoles:
            db.add(
                Console(
                    collection_id=copy.id,
                    console_label_id=labels[console.console_label_id].id,
                    edition=console.edition,
                    condition=console.condition,
                )
            )

        games = db.scalars(
            select(Game).where(Game.collection_id == collection.id).order_by(Game.id)
        ).all()
        for game in games:
            db.add(
                Game(
                    collection_id=copy.id,
                    console_label_id=labels[game.console_label_id].id,
                    name=game.name,
                    condition=game.condition,
                    last_played=game.last_played,
                    completed=game.completed,
                )
            )


def create_sandbox(db: Session) -> User:
    """Copy the demo template into a new sandbox account."""
    delete_expired_sandboxes(db)
    db.commit()

    active = (
        db.scalar(
            select(func.count())
            .select_from(User)
            .where(User.role == UserRole.SANDBOX.value)
        )
        or 0
    )
    if active >= MAX_SANDBOXES:
        replaced = _sandbox_to_replace(db)
        if replaced is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The demo is busy. Try again in a few minutes.",
            )
        delete_sandbox(db, replaced)
        db.commit()

    template = db.scalars(
        select(User)
        .where(User.role == UserRole.TEMPLATE.value, User.is_active.is_(True))
        .order_by(User.id)
    ).first()
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The demo is not available right now.",
        )

    sandbox = User(
        username=f"sandbox-{secrets.token_hex(4)}",
        hashed_password=pwd_context.hash(uuid.uuid4().hex),
        role=UserRole.SANDBOX.value,
    )
    db.add(sandbox)
    db.flush()
    _copy_template(db, template, sandbox)
    db.commit()
    db.refresh(sandbox)
    return sandbox


def check_collection_limit(db: Session, user: User) -> None:
    """Refuse a new collection once a sandbox has reached its limit."""
    if not is_sandbox(user):
        return
    count = (
        db.scalar(
            select(func.count())
            .select_from(Collection)
            .where(Collection.owner_id == user.id)
        )
        or 0
    )
    if count >= MAX_SANDBOX_COLLECTIONS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Demo accounts can have up to {MAX_SANDBOX_COLLECTIONS} collections",
        )


def check_item_limit(db: Session, collection: Collection) -> None:
    """Refuse a new console or game once a sandbox has reached its limit."""
    owner = db.get(User, collection.owner_id)
    if owner is None or not is_sandbox(owner):
        return
    collection_ids = select(Collection.id).where(Collection.owner_id == owner.id)
    consoles = (
        db.scalar(
            select(func.count())
            .select_from(Console)
            .where(Console.collection_id.in_(collection_ids))
        )
        or 0
    )
    games = (
        db.scalar(
            select(func.count())
            .select_from(Game)
            .where(Game.collection_id.in_(collection_ids))
        )
        or 0
    )
    if consoles + games >= MAX_SANDBOX_ITEMS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Demo accounts can have up to {MAX_SANDBOX_ITEMS} items",
        )


def reject_sandbox_sharing(user: User) -> None:
    """Sandbox accounts cannot share or see sharing."""
    if is_sandbox(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo accounts cannot share collections",
        )
