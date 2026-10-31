import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from fastapi.routing import APIRoute
from pydantic import ValidationError
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session

from app.auth.sandbox import delete_sandbox
from app.collections.permissions import get_owned_collection
from app.collections.routes import create_link, delete_link, list_links
from app.collections.schemas import LinkCreate
from app.db import Base
from app.main import app
from app.models import Collection, CollectionGrant, CollectionLink, User, UserRole


class CollectionLinkTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.owner = User(username="owner", hashed_password="hash")
        self.reader = User(username="reader", hashed_password="hash")
        self.db.add_all([self.owner, self.reader])
        self.db.flush()
        self.collection = Collection(owner_id=self.owner.id, name="Shelf")
        self.other = Collection(owner_id=self.owner.id, name="Other")
        self.db.add_all([self.collection, self.other])
        self.db.flush()
        self.db.add(
            CollectionGrant(collection_id=self.collection.id, user_id=self.reader.id)
        )
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def create(self, name: str | None = None, collection=None):
        return create_link(
            LinkCreate(name=name), collection or self.collection, self.db
        )

    def link_count(self) -> int:
        return self.db.scalar(select(func.count()).select_from(CollectionLink))

    def test_owner_creates_named_and_unnamed_links(self) -> None:
        named = self.create("  For Dana  ")
        unnamed = self.create("   ")

        self.assertEqual(named.name, "For Dana")
        self.assertIsNone(unnamed.name)
        self.assertGreaterEqual(len(named.token), 22)
        self.assertNotEqual(named.token, unnamed.token)

    def test_list_shows_only_that_collections_links_in_order(self) -> None:
        first = self.create("first")
        second = self.create("second")
        self.create("elsewhere", collection=self.other)

        links = list_links(self.collection, self.db).links

        self.assertEqual([link.id for link in links], [first.id, second.id])

    def test_a_collection_has_at_most_five_links(self) -> None:
        for index in range(5):
            self.create(f"link {index}")

        with self.assertRaises(HTTPException) as raised:
            self.create("one too many")
        self.assertEqual(raised.exception.status_code, 400)
        self.create("other collection", collection=self.other)

    def test_only_the_owner_reaches_a_collections_sharing(self) -> None:
        stranger = User(username="stranger", hashed_password="hash")
        self.db.add(stranger)
        self.db.commit()

        self.assertEqual(
            get_owned_collection(self.collection.id, self.db, self.owner).id,
            self.collection.id,
        )
        for user in (self.reader, stranger):
            with self.subTest(user=user.username):
                with self.assertRaises(HTTPException) as raised:
                    get_owned_collection(self.collection.id, self.db, user)
                self.assertEqual(raised.exception.status_code, 404)

    def test_every_link_and_grant_route_requires_the_owner(self) -> None:
        sharing_routes = [
            route
            for route in app.routes
            if isinstance(route, APIRoute)
            and route.path.startswith("/collections/{collection_id}/")
            and ("/links" in route.path or "/grants" in route.path)
        ]

        self.assertEqual(len(sharing_routes), 6)
        for route in sharing_routes:
            with self.subTest(route=route.path, methods=sorted(route.methods)):
                calls = [dependency.call for dependency in route.dependant.dependencies]
                self.assertIn(get_owned_collection, calls)

    def test_owner_deletes_a_link(self) -> None:
        link = self.create("gone soon")
        kept = self.create("kept")

        delete_link(link.id, self.collection, self.db)

        links = list_links(self.collection, self.db).links
        self.assertEqual([remaining.id for remaining in links], [kept.id])

    def test_deleting_needs_the_links_own_collection(self) -> None:
        link = self.create("shelf link")

        with self.assertRaises(HTTPException) as raised:
            delete_link(link.id, self.other, self.db)
        self.assertEqual(raised.exception.status_code, 404)
        self.assertEqual(self.link_count(), 1)

    def test_link_names_are_at_most_fifty_characters(self) -> None:
        with self.assertRaises(ValidationError):
            LinkCreate(name="x" * 51)

    def test_a_sandbox_shares_by_link_and_its_links_go_with_it(self) -> None:
        sandbox = User(
            username="sandbox-1234abcd",
            hashed_password="hash",
            role=UserRole.SANDBOX.value,
        )
        self.db.add(sandbox)
        self.db.flush()
        sandbox_collection = Collection(owner_id=sandbox.id, name="Demo shelf")
        self.db.add(sandbox_collection)
        self.db.commit()
        self.create("mine")

        self.create("demo link", collection=sandbox_collection)
        self.assertEqual(self.link_count(), 2)

        delete_sandbox(self.db, sandbox)
        self.db.commit()
        self.assertEqual(self.link_count(), 1)


if __name__ == "__main__":
    unittest.main()
