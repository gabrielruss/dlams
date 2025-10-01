"""
create_tables.py
This file will create all tables defined by Base's subclasses (like User).
"""

from app.db import engine, Base

Base.metadata.create_all(bind=engine)
