"""Request and response schemas for collections and read-only sharing."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.collections.video_games_schemas import ConsoleResponse, GameResponse
from app.models.collection import CollectionAccess, CollectionType


class CollectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: CollectionType = CollectionType.VIDEO_GAME


class CollectionResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    type: CollectionType
    access: CollectionAccess


class GrantCreate(BaseModel):
    username: str = Field(min_length=1)


class GrantResponse(BaseModel):
    user_id: int
    username: str


class GrantListResponse(BaseModel):
    grants: list[GrantResponse]


class CollectionListResponse(BaseModel):
    collections: list[CollectionResponse]


class LinkCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, max_length=50)


class LinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str | None
    token: str
    created_at: datetime


class LinkListResponse(BaseModel):
    links: list[LinkResponse]


class SharedCollectionResponse(BaseModel):
    name: str
    type: CollectionType
    consoles: list[ConsoleResponse]
    games: list[GameResponse]
