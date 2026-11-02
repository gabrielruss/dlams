"""
main.py
This file contains the main entry point for the FastAPI application.
"""

from fastapi import FastAPI

from app.auth.admin_routes import router as admin_users_router
from app.auth.routes import router as auth_router
from app.collections.item_routes import router as items_router
from app.collections.routes import router as collections_router
from app.collections.shared_routes import router as shared_router
from app.collections.video_games_routes import (
    labels_router as console_labels_router,
)
from app.collections.video_games_routes import (
    router as video_games_router,
)
from app.collections.video_games_routes import (
    stats_router as video_game_stats_router,
)

app = FastAPI()

app.include_router(auth_router)
app.include_router(admin_users_router)
app.include_router(video_game_stats_router)
app.include_router(console_labels_router)
app.include_router(collections_router)
app.include_router(video_games_router)
app.include_router(shared_router)
app.include_router(items_router)
