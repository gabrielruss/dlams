"""
schemas.py
This file contains the Pydantic models for the authentication module.
"""

from pydantic import BaseModel

class LoginRequest(BaseModel):
    """Class representing the login request."""
    username: str
    password: str
