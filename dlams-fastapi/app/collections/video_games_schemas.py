"""API schemas for console inventory and video-game records."""

from datetime import UTC, date, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field

from app.models.video_games import VideoGameCondition


def _not_in_the_future(value: date) -> date:
    if value > datetime.now(UTC).date():
        raise ValueError("Last played can't be in the future")
    return value


LastPlayedDate = Annotated[date, AfterValidator(_not_in_the_future)]


class ConsoleCreate(BaseModel):
    label: str = Field(min_length=1, max_length=100)
    edition: str | None = Field(default=None, max_length=100)
    condition: VideoGameCondition


class ConsoleUpdate(BaseModel):
    label: str = Field(min_length=1, max_length=100)
    edition: str | None = Field(default=None, max_length=100)
    condition: VideoGameCondition


class ConsoleResponse(BaseModel):
    id: int
    console_label_id: int
    label: str
    edition: str | None
    condition: VideoGameCondition


class ConsoleListResponse(BaseModel):
    consoles: list[ConsoleResponse]


class ConsoleLabelResponse(BaseModel):
    id: int
    name: str


class ConsoleLabelListResponse(BaseModel):
    labels: list[ConsoleLabelResponse]


class GameCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    condition: VideoGameCondition
    console_label: str = Field(min_length=1, max_length=100)
    last_played: LastPlayedDate | None = None
    completed: bool = False


class GameUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    condition: VideoGameCondition
    console_label: str = Field(min_length=1, max_length=100)
    last_played: LastPlayedDate | None = None
    completed: bool


class GameResponse(BaseModel):
    id: int
    name: str
    condition: VideoGameCondition
    console_label_id: int
    console_label: str
    last_played: date | None
    completed: bool


class GameListResponse(BaseModel):
    games: list[GameResponse]


class VideoGameCollectionStats(BaseModel):
    collection_id: int
    game_count: int
    console_count: int


class VideoGameCollectionStatsListResponse(BaseModel):
    stats: list[VideoGameCollectionStats]
