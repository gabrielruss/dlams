import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.collections.routes import create_collection
from app.collections.schemas import CollectionCreate
from app.db import Base
from app.models import Collection, CollectionType, User


class CollectionTypeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.owner = User(username="owner", hashed_password="hash")
        self.db.add(self.owner)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def test_collection_creation_defaults_to_video_game_type(self) -> None:
        request = CollectionCreate(name="Games")
        response = create_collection(request, self.db, self.owner)

        self.assertEqual(request.type, CollectionType.VIDEO_GAME)
        self.assertEqual(response.type, CollectionType.VIDEO_GAME)
        self.assertEqual(response.name, "Games")

    def test_collection_creation_accepts_supported_type(self) -> None:
        request = CollectionCreate(name="Games", type="video_game")

        self.assertEqual(request.type, CollectionType.VIDEO_GAME)

    def test_collection_creation_rejects_unknown_type(self) -> None:
        with self.assertRaises(ValidationError):
            CollectionCreate(name="Books", type="book")

    def test_database_rejects_unknown_collection_type(self) -> None:
        self.db.add(
            Collection(
                owner_id=self.owner.id,
                name="Invalid",
                type="book",
            )
        )

        with self.assertRaises(IntegrityError):
            self.db.commit()


if __name__ == "__main__":
    unittest.main()
