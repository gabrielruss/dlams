"""Request and response schemas for collections and read-only sharing."""

from pydantic import BaseModel, Field

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
