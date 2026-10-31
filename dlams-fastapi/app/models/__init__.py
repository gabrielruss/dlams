"""init for exporting all models"""

from app.models.collection import (
    Collection,
    CollectionAccess,
    CollectionGrant,
    CollectionLink,
    CollectionType,
)
from app.models.user import RegistrationInvitation, User, UserRole
from app.models.video_games import (
    Console,
    ConsoleLabel,
    Game,
    VideoGameCondition,
)

__all__ = [
    "Console",
    "Collection",
    "CollectionAccess",
    "CollectionGrant",
    "CollectionLink",
    "CollectionType",
    "ConsoleLabel",
    "Game",
    "RegistrationInvitation",
    "VideoGameCondition",
    "User",
    "UserRole",
]
