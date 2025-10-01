"""
user.py
This file contains all models for Users until this trash gets out of hand.
"""
from sqlalchemy import Column, Integer, String
from app.db import Base

class User(Base):
    """Authenticated User Class"""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
