"""
schemas.py
This file contains the Pydantic models for the authentication module.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class LoginRequest(BaseModel):
    """Class representing the login request."""
    username: str
    password: str

class UserResponse(BaseModel):
    """ Schema for user data """
    id: int
    username: str
    email: Optional[str]
    created_at: datetime

    class Config:
        """ Allows Pydantic to work with SQLAlchemy models """
        from_attributes = True

class AuthResponse(BaseModel):
    """Schema for auth responses"""
    message: str
    user: UserResponse
