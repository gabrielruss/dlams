import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.collections.video_games_routes import (
    create_console,
    create_game,
    delete_console,
    delete_game,
    list_console_labels,
)
from app.collections.video_games_schemas import ConsoleCreate, GameCreate
from app.db import Base
from app.models import Collection, Console, User
from app.models.video_games import VideoGameCondition


class VideoGamesRouteTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        owner = User(username="owner", hashed_password="hash")
        self.db.add(owner)
        self.db.flush()
        self.collection = Collection(owner_id=owner.id, name="Games")
        self.db.add(self.collection)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def add_console(self, edition: str | None = None):
        return create_console(
            ConsoleCreate(
                label="Xbox 360",
                edition=edition,
                condition=VideoGameCondition.CIB,
            ),
            self.collection,
            self.db,
        )

    def add_game(self, console_label_id: int):
        return create_game(
            GameCreate(
                name="Example game",
                condition=VideoGameCondition.LOOSE,
                console_label_id=console_label_id,
            ),
            self.collection,
            self.db,
        )

    def test_shared_console_label_reports_unique_game_count(self) -> None:
        first_console = self.add_console("Original white")
        self.add_console("Star Wars edition")
        game = self.add_game(first_console.console_label_id)

        labels = list_console_labels(self.collection, self.db)

        self.assertEqual(len(labels.labels), 1)
        self.assertEqual(labels.labels[0].name, "Xbox 360")
        self.assertEqual(labels.labels[0].game_count, 1)
        console_count = (
            self.db.query(Console)
            .filter_by(console_label_id=first_console.console_label_id)
            .count()
        )
        self.assertEqual(console_count, 2)
        self.assertEqual(game.console_label_id, first_console.console_label_id)

    def test_last_console_cannot_be_deleted_while_games_use_its_label(self) -> None:
        console = self.add_console()
        self.add_game(console.console_label_id)

        with self.assertRaises(HTTPException) as raised:
            delete_console(console.id, self.collection, self.db)

        self.assertEqual(raised.exception.status_code, 409)
        self.assertEqual(self.db.query(Console).count(), 1)

    def test_one_edition_can_be_deleted_and_last_can_follow_game_deletion(self) -> None:
        first_console = self.add_console("Original white")
        second_console = self.add_console("Star Wars edition")
        game = self.add_game(first_console.console_label_id)

        delete_console(first_console.id, self.collection, self.db)
        self.assertEqual(self.db.query(Console).count(), 1)

        delete_game(game.id, self.collection, self.db)
        delete_console(second_console.id, self.collection, self.db)

        self.assertEqual(self.db.query(Console).count(), 0)
        self.assertEqual(list_console_labels(self.collection, self.db).labels, [])


if __name__ == "__main__":
    unittest.main()
