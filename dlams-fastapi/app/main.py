"""
main.py
This file contains the main entry point for the FastAPI application.
"""

from fastapi import FastAPI

from app.auth.routes import router as auth_router
from app.collections.routes import router as collections_router
from app.collections.video_games_routes import (
    router as video_games_router,
    stats_router as video_game_stats_router,
)

app = FastAPI()

app.include_router(auth_router)
app.include_router(video_game_stats_router)
app.include_router(collections_router)
app.include_router(video_games_router)
