"""
create_tables.py
This file will create all tables defined by Base's subclasses (like User).
"""

from app.db import Base, engine

Base.metadata.create_all(bind=engine)
