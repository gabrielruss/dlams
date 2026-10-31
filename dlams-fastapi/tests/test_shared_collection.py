import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.collections.routes import create_link, delete_link
from app.collections.schemas import LinkCreate
from app.collections.shared_routes import read_shared_collection
from app.collections.video_games_routes import create_console, create_game
from app.collections.video_games_schemas import ConsoleCreate, GameCreate
from app.db import Base
from app.models import Collection, User
from app.models.video_games import VideoGameCondition


class SharedCollectionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.owner = User(username="owner", hashed_password="hash")
        self.db.add(self.owner)
        self.db.flush()
        self.shelf = Collection(owner_id=self.owner.id, name="Shelf")
        self.private = Collection(owner_id=self.owner.id, name="Private")
        self.db.add_all([self.shelf, self.private])
        self.db.commit()
        self.add_items(self.shelf, "Halo 3")
        self.add_items(self.private, "Secret game")

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def add_items(self, collection: Collection, game_name: str) -> None:
        create_console(
            ConsoleCreate(label="Xbox 360", condition=VideoGameCondition.CIB),
            collection,
            self.db,
        )
        create_game(
            GameCreate(
                name=game_name,
                condition=VideoGameCondition.LOOSE,
                console_label="Xbox 360",
            ),
            collection,
            self.db,
        )

    def share(self, collection: Collection):
        return create_link(LinkCreate(name=None), collection, self.db)

    def test_a_link_shows_only_its_own_collection(self) -> None:
        link = self.share(self.shelf)

        shared = read_shared_collection(link.token, self.db)

        self.assertEqual(shared.name, "Shelf")
        self.assertEqual(shared.type.value, "video_game")
        self.assertEqual([game.name for game in shared.games], ["Halo 3"])
        self.assertEqual([console.label for console in shared.consoles], ["Xbox 360"])

    def test_an_unknown_or_deleted_link_is_no_longer_active(self) -> None:
        link = self.share(self.shelf)
        delete_link(link.id, self.shelf, self.db)

        for token in (link.token, "not-a-real-token"):
            with self.subTest(token=token):
                with self.assertRaises(HTTPException) as raised:
                    read_shared_collection(token, self.db)
                self.assertEqual(raised.exception.status_code, 404)
                self.assertEqual(
                    raised.exception.detail, "This link is no longer active."
                )

    def test_the_response_names_nothing_about_the_owner(self) -> None:
        link = self.share(self.shelf)

        shared = read_shared_collection(link.token, self.db)

        self.assertEqual(
            set(shared.model_dump()), {"name", "type", "consoles", "games"}
        )


if __name__ == "__main__":
    unittest.main()
