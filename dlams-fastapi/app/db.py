"""
db.py
This file contains db setup stuff.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL environment variable is not set.")

# sets up the connection to the db
engine = create_engine(DATABASE_URL)

# allows us to interact with the db in code
# autocommit = false - this means we must db.commit() manually.
# this is recommended for most applications
# autoflush = false - same rec for safety. objects must be explicitly flushed
# flushing in SQLAlchemy is sending changes we make to object in the session to the db
# flushing doesn't commit
# so you make changes to the db, then send them to session db, then commit to make perm
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models in sqlalchemy
Base = declarative_base()
