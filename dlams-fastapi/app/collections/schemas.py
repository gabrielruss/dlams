"""Request and response schemas for collections and access grants."""

from pydantic import BaseModel, Field

from app.models.collection import CollectionAccess, GrantMode


class CollectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class CollectionResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    access: CollectionAccess


class GrantCreate(BaseModel):
    username: str = Field(min_length=1)
    mode: GrantMode


class GrantUpdate(BaseModel):
    mode: GrantMode


class GrantResponse(BaseModel):
    user_id: int
    username: str
    mode: GrantMode


class GrantListResponse(BaseModel):
    grants: list[GrantResponse]


class CollectionListResponse(BaseModel):
    collections: list[CollectionResponse]
