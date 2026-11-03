import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from fastapi.routing import APIRoute
from pydantic import ValidationError
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session

from app.collections.permissions import get_writable_collection
from app.collections.routes import delete_collection, update_collection
from app.collections.schemas import CollectionUpdate
from app.db import Base
from app.main import app
from app.models import (
    Collection,
    CollectionGrant,
    CollectionLink,
    Console,
    ConsoleLabel,
    Game,
    User,
)


class CollectionEditDeleteTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.owner = User(username="test-user", hashed_password="hash")
        self.reader = User(username="reader", hashed_password="hash")
        self.stranger = User(username="stranger", hashed_password="hash")
        self.db.add_all([self.owner, self.reader, self.stranger])
        self.db.flush()

        self.shelf = Collection(owner_id=self.owner.id, name="Shelf")
        self.kept = Collection(owner_id=self.owner.id, name="Kept")
        self.db.add_all([self.shelf, self.kept])
        self.db.flush()
        self.db.add(
            CollectionGrant(collection_id=self.shelf.id, user_id=self.reader.id)
        )
        self.db.add(CollectionLink(collection_id=self.shelf.id, token="shelf-token"))

        self.only_here = ConsoleLabel(user_id=self.owner.id, name="SNES")
        self.shared_label = ConsoleLabel(user_id=self.owner.id, name="Xbox 360")
        self.db.add_all([self.only_here, self.shared_label])
        self.db.flush()
        self.db.add_all(
            [
                Console(
                    collection_id=self.shelf.id,
                    console_label_id=self.only_here.id,
                    condition="CIB",
                ),
                Game(
                    collection_id=self.shelf.id,
                    console_label_id=self.shared_label.id,
                    name="Halo 3",
                    condition="Loose",
                ),
                Game(
                    collection_id=self.kept.id,
                    console_label_id=self.shared_label.id,
                    name="Gears of War",
                    condition="CIB",
                ),
            ]
        )
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def count(self, model: type, **filters: int) -> int:
        query = select(func.count()).select_from(model)
        for column, value in filters.items():
            query = query.where(getattr(model, column) == value)
        return self.db.scalar(query) or 0

    def test_owner_renames_a_collection(self) -> None:
        renamed = update_collection(
            CollectionUpdate(name="  Retro shelf  "), self.shelf, self.db
        )

        self.assertEqual(renamed.name, "Retro shelf")
        self.assertEqual(renamed.access.value, "owner")
        self.assertEqual(self.db.get(Collection, self.shelf.id).name, "Retro shelf")

    def test_a_blank_name_is_rejected(self) -> None:
        with self.assertRaises(HTTPException) as raised:
            update_collection(CollectionUpdate(name="   "), self.shelf, self.db)

        self.assertEqual(raised.exception.status_code, 422)
        self.assertEqual(self.db.get(Collection, self.shelf.id).name, "Shelf")

    def test_a_rename_accepts_only_the_name(self) -> None:
        with self.assertRaises(ValidationError):
            CollectionUpdate.model_validate({"name": "Shelf", "type": "video_game"})

    def test_delete_removes_the_collection_and_everything_in_it(self) -> None:
        shelf_id = self.shelf.id

        delete_collection(self.shelf, self.db)

        self.assertIsNone(self.db.get(Collection, shelf_id))
        self.assertEqual(self.count(Console, collection_id=shelf_id), 0)
        self.assertEqual(self.count(Game, collection_id=shelf_id), 0)
        self.assertEqual(self.count(CollectionLink, collection_id=shelf_id), 0)
        self.assertEqual(self.count(CollectionGrant, collection_id=shelf_id), 0)

    def test_delete_keeps_other_collections_and_labels_they_use(self) -> None:
        only_here_id = self.only_here.id
        shared_label_id = self.shared_label.id

        delete_collection(self.shelf, self.db)

        self.assertIsNotNone(self.db.get(Collection, self.kept.id))
        self.assertEqual(self.count(Game, collection_id=self.kept.id), 1)
        self.assertIsNone(self.db.get(ConsoleLabel, only_here_id))
        self.assertIsNotNone(self.db.get(ConsoleLabel, shared_label_id))

    def test_only_the_owner_can_edit_or_delete(self) -> None:
        with self.assertRaises(HTTPException) as reader:
            get_writable_collection(self.shelf.id, self.db, self.reader)
        with self.assertRaises(HTTPException) as stranger:
            get_writable_collection(self.shelf.id, self.db, self.stranger)

        self.assertEqual(reader.exception.status_code, 403)
        self.assertEqual(stranger.exception.status_code, 404)

    def test_both_routes_require_the_owner(self) -> None:
        routes = [
            route
            for route in app.routes
            if isinstance(route, APIRoute)
            and route.path == "/collections/{collection_id}"
            and route.methods & {"PUT", "DELETE"}
        ]

        self.assertEqual(len(routes), 2)
        for route in routes:
            with self.subTest(methods=sorted(route.methods)):
                calls = [dependency.call for dependency in route.dependant.dependencies]
                self.assertIn(get_writable_collection, calls)


if __name__ == "__main__":
    unittest.main()
