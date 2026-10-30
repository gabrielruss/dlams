"""
utils.py
DB util functions
"""

from app.db import SessionLocal


def get_db():
    """This function creates a new database session for each request and closes it afterward."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
