"""
schemas.py
This file contains the Pydantic models for the authentication module.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models import UserRole

class LoginRequest(BaseModel):
    """Class representing the login request."""
    username: str
    password: str

class RegisterRequest(LoginRequest):
    """Registration accepts credentials only, never a requested role."""

    class Config:
        extra = "forbid"

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
