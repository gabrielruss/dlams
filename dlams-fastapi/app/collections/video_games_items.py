"""Video-game items in the type-neutral shape that search uses."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.collections.schemas import ItemResponse, ItemType
from app.models import Collection, Console, ConsoleLabel, Game


def _console_title(label: str, edition: str | None) -> str:
    return f"{label} — {edition}" if edition else label


def _game_details(game: Game) -> list[str]:
    details = [game.condition]
    if game.completed:
        details.append("Completed")
    if game.last_played:
        details.append(f"Last played {game.last_played.isoformat()}")
    return details


def owned_video_game_items(db: Session, owner_id: int) -> list[ItemResponse]:
    consoles = db.execute(
        select(Console, ConsoleLabel.name, Collection.name)
        .join(ConsoleLabel, ConsoleLabel.id == Console.console_label_id)
        .join(Collection, Collection.id == Console.collection_id)
        .where(Collection.owner_id == owner_id)
    ).all()
    games = db.execute(
        select(Game, ConsoleLabel.name, Collection.name)
        .join(ConsoleLabel, ConsoleLabel.id == Game.console_label_id)
        .join(Collection, Collection.id == Game.collection_id)
        .where(Collection.owner_id == owner_id)
    ).all()
    return [
        ItemResponse(
            type=ItemType.CONSOLE,
            id=console.id,
            collection_id=console.collection_id,
            collection_name=collection_name,
            title=_console_title(label, console.edition),
            keywords=[],
            details=[console.condition],
        )
        for console, label, collection_name in consoles
    ] + [
        ItemResponse(
            type=ItemType.GAME,
            id=game.id,
            collection_id=game.collection_id,
            collection_name=collection_name,
            title=game.name,
            keywords=[label],
            details=_game_details(game),
        )
        for game, label, collection_name in games
    ]
