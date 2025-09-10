"""
models.py
This file contains all models until this trash gets out of hand.
"""
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String

# Base class for all models in sqlalchemy
Base = declarative_base()

class User(Base):
    """Authenticated User Class"""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
