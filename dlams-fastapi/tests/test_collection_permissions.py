import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.collections.permissions import (
    get_collection_access,
    get_readable_collection,
    get_writable_collection,
)
from app.collections.routes import create_grant
from app.collections.schemas import GrantCreate
from app.db import Base
from app.models import (
    Collection,
    CollectionAccess,
    CollectionGrant,
    GrantMode,
    User,
    UserRole,
)


class CollectionPermissionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)

        self.owner = User(
            username="owner",
            hashed_password="hash",
            role=UserRole.USER.value,
        )
        self.reader = User(username="reader", hashed_password="hash")
        self.admin = User(
            username="admin",
            hashed_password="hash",
            role=UserRole.ADMIN.value,
        )
        self.db.add_all([self.owner, self.reader, self.admin])
        self.db.flush()
        self.collection = Collection(owner_id=self.owner.id, name="Demo")
        self.db.add(self.collection)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def add_grant(self, user: User, mode: GrantMode) -> None:
        self.db.add(
            CollectionGrant(
                collection_id=self.collection.id,
                user_id=user.id,
                mode=mode.value,
            )
        )
        self.db.commit()

    def test_owner_can_read_and_write_without_an_admin_role(self) -> None:
        self.assertEqual(
            get_collection_access(self.db, self.collection, self.owner),
            CollectionAccess.OWNER,
        )
        self.assertIs(
            get_readable_collection(
                self.collection.id,
                self.db,
                self.owner,
            ),
            self.collection,
        )
        self.assertIs(
            get_writable_collection(
                self.collection.id,
                self.db,
                self.owner,
            ),
            self.collection,
        )

    def test_edit_grant_can_read_and_write(self) -> None:
        self.add_grant(self.reader, GrantMode.EDIT)

        self.assertEqual(
            get_collection_access(self.db, self.collection, self.reader),
            CollectionAccess.EDIT,
        )
        self.assertIs(
            get_writable_collection(
                self.collection.id,
                self.db,
                self.reader,
            ),
            self.collection,
        )

    def test_view_only_and_demo_grants_are_read_only(self) -> None:
        for mode in (GrantMode.VIEW_ONLY, GrantMode.DEMO):
            with self.subTest(mode=mode):
                self.add_grant(self.reader, mode)
                self.assertIs(
                    get_readable_collection(
                        self.collection.id,
                        self.db,
                        self.reader,
                    ),
                    self.collection,
                )
                with self.assertRaises(HTTPException) as raised:
                    get_writable_collection(
                        self.collection.id,
                        self.db,
                        self.reader,
                    )
                self.assertEqual(raised.exception.status_code, 403)
                self.db.query(CollectionGrant).delete()
                self.db.commit()

    def test_global_admin_has_no_implicit_collection_access(self) -> None:
        with self.assertRaises(HTTPException) as raised:
            get_readable_collection(
                self.collection.id,
                self.db,
                self.admin,
            )
        self.assertEqual(raised.exception.status_code, 404)

    def test_only_collection_owner_can_create_access_grants(self) -> None:
        target = User(username="target", hashed_password="hash")
        self.db.add(target)
        self.db.commit()
        request = GrantCreate(username="target", mode=GrantMode.DEMO)

        result = create_grant(
            request,
            self.collection.id,
            self.db,
            self.owner,
        )
        self.assertEqual(result.user_id, target.id)
        self.assertEqual(result.mode, GrantMode.DEMO)

        with self.assertRaises(HTTPException) as raised:
            create_grant(
                request,
                self.collection.id,
                self.db,
                self.admin,
            )
        self.assertEqual(raised.exception.status_code, 404)

        with self.assertRaises(HTTPException) as raised:
            get_writable_collection(
                self.collection.id,
                self.db,
                self.admin,
            )
        self.assertEqual(raised.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
