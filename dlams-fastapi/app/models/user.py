"""
user.py
This file contains all models for Users until this trash gets out of hand.
"""
from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime
from app.db import Base

class User(Base):
    """Authenticated User Class"""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.now(tz=UTC), nullable=False)
