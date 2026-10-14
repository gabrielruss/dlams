"""
schemas.py
This file contains the Pydantic models for the authentication module.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models import UserRole

class LoginRequest(BaseModel):
    """Class representing the login request."""
    username: str
    password: str

class RegisterRequest(LoginRequest):
    """Registration requires an invitation and never accepts a requested role."""

    username: str = Field(min_length=4, max_length=100)
    password: str = Field(min_length=6, max_length=30)
    invitation_code: str = Field(min_length=1, max_length=200)

    class Config:
        extra = "forbid"


class RegistrationInvitationResponse(BaseModel):
    """The raw invitation code is returned only when an invite is created."""

    invitation_code: str
    expires_at: datetime

class UserResponse(BaseModel):
    """ Schema for user data """
    id: int
    username: str
    email: Optional[str]
    created_at: datetime
    role: UserRole

    class Config:
        """ Allows Pydantic to work with SQLAlchemy models """
        from_attributes = True

class AuthResponse(BaseModel):
    """Schema for auth responses"""
    message: str
    user: UserResponse


class AdminUserResponse(BaseModel):
    """A user as shown on the admin user-management screen."""

    id: int
    username: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        """ Allows Pydantic to work with SQLAlchemy models """
        from_attributes = True


class AdminUserListResponse(BaseModel):
    """All users, for admin user management."""

    users: list[AdminUserResponse]
