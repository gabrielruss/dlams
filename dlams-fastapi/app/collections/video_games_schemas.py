"""API schemas for console inventory and video-game records."""

from datetime import date

from pydantic import BaseModel, Field

from app.models.video_games import VideoGameCondition


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
    last_played: date | None = None
    completed: bool = False


class GameUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    condition: VideoGameCondition
    console_label: str = Field(min_length=1, max_length=100)
    last_played: date | None = None
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
