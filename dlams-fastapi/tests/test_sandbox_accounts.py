import os
import unittest
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException, Response
from jose import jwt
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session

from app.auth.admin_routes import set_user_role
from app.auth.routes import create_demo_session, logout
from app.auth.sandbox import MAX_SANDBOXES, create_sandbox
from app.auth.schemas import AdminUserRoleUpdate
from app.auth.utils import ALGORITHM
from app.collections.permissions import get_writable_collection
from app.collections.routes import (
    create_collection,
    create_grant,
    delete_grant,
    list_grants,
)
from app.collections.schemas import CollectionCreate, GrantCreate
from app.collections.video_games_routes import create_game, delete_game
from app.collections.video_games_schemas import GameCreate
from app.config import SECRET_KEY
from app.db import Base
from app.models import (
    Collection,
    Console,
    ConsoleLabel,
    Game,
    User,
    UserRole,
    VideoGameCondition,
)


class SandboxAccountTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.admin = User(
            username="admin",
            hashed_password="hash",
            role=UserRole.ADMIN.value,
        )
        self.member = User(username="member", hashed_password="hash")
        self.template = User(
            username="demo-user",
            hashed_password="hash",
            role=UserRole.TEMPLATE.value,
        )
        self.db.add_all([self.admin, self.member, self.template])
        self.db.flush()
        label = ConsoleLabel(user_id=self.template.id, name="Xbox 360")
        self.template_collection = Collection(
            owner_id=self.template.id,
            name="Retro game shelf",
        )
        self.db.add_all([label, self.template_collection])
        self.db.flush()
        self.db.add_all(
            [
                Console(
                    collection_id=self.template_collection.id,
                    console_label_id=label.id,
                    edition="White",
                    condition="CIB",
                ),
                Game(
                    collection_id=self.template_collection.id,
                    console_label_id=label.id,
                    name="Halo 3",
                    condition="CIB",
                ),
                Game(
                    collection_id=self.template_collection.id,
                    console_label_id=label.id,
                    name="Gears of War",
                    condition="Loose",
                ),
            ]
        )
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def count(self, model, *conditions) -> int:
        return self.db.scalar(
            select(func.count()).select_from(model).where(*conditions)
        ) or 0

    def sandbox_collection(self, sandbox: User) -> Collection:
        return self.db.scalars(
            select(Collection).where(Collection.owner_id == sandbox.id)
        ).one()

    def add_game(self, collection: Collection, name: str = "Example game"):
        return create_game(
            GameCreate(
                name=name,
                condition=VideoGameCondition.LOOSE,
                console_label="Xbox 360",
            ),
            collection,
            self.db,
        )

    def test_a_demo_session_copies_the_template_and_sets_the_cookie(self) -> None:
        response = Response()

        result = create_demo_session(response, self.db)

        sandbox = self.db.scalars(
            select(User).where(User.username == result.user.username)
        ).one()
        self.assertEqual(sandbox.role, UserRole.SANDBOX.value)
        self.assertTrue(sandbox.username.startswith("sandbox-"))
        self.assertIn("access_token=", response.headers["set-cookie"])
        collection = self.sandbox_collection(sandbox)
        self.assertEqual(collection.name, "Retro game shelf")
        self.assertEqual(self.count(Console, Console.collection_id == collection.id), 1)
        self.assertEqual(self.count(Game, Game.collection_id == collection.id), 2)
        labels = self.db.scalars(
            select(ConsoleLabel).where(ConsoleLabel.user_id == sandbox.id)
        ).all()
        self.assertEqual([label.name for label in labels], ["Xbox 360"])
        game_labels = self.db.scalars(
            select(Game.console_label_id).where(Game.collection_id == collection.id)
        ).all()
        self.assertEqual(set(game_labels), {labels[0].id})

    def test_refuses_a_sandbox_beyond_the_limit(self) -> None:
        for _ in range(MAX_SANDBOXES):
            create_sandbox(self.db)

        with self.assertRaises(HTTPException) as raised:
            create_sandbox(self.db)

        self.assertEqual(raised.exception.status_code, 503)
        self.assertEqual(self.count(User, User.role == UserRole.SANDBOX.value), 10)

    def test_deletes_expired_sandboxes_before_creating_one(self) -> None:
        expired = create_sandbox(self.db)
        expired.created_at = datetime.now(UTC).replace(tzinfo=None) - timedelta(
            minutes=31
        )
        self.db.commit()
        expired_username = expired.username

        create_sandbox(self.db)

        self.assertEqual(self.count(User, User.username == expired_username), 0)
        self.assertEqual(self.count(User, User.role == UserRole.SANDBOX.value), 1)
        self.assertEqual(self.count(Collection), 2)
        self.assertEqual(self.count(ConsoleLabel), 2)
        self.assertEqual(self.count(Game), 4)

    def test_fails_clearly_without_a_template(self) -> None:
        self.template.role = UserRole.USER.value
        self.db.commit()

        with self.assertRaises(HTTPException) as raised:
            create_sandbox(self.db)

        self.assertEqual(raised.exception.status_code, 503)

    def test_limits_a_sandbox_to_three_collections(self) -> None:
        sandbox = create_sandbox(self.db)
        for name in ("Second", "Third"):
            create_collection(CollectionCreate(name=name), self.db, sandbox)

        with self.assertRaises(HTTPException) as raised:
            create_collection(CollectionCreate(name="Fourth"), self.db, sandbox)

        self.assertEqual(raised.exception.status_code, 403)

    def test_limits_a_sandbox_to_thirty_items_including_the_copied_ones(self) -> None:
        sandbox = create_sandbox(self.db)
        collection = self.sandbox_collection(sandbox)
        for index in range(27):
            self.add_game(collection, f"Game {index}")

        with self.assertRaises(HTTPException) as raised:
            self.add_game(collection)

        self.assertEqual(raised.exception.status_code, 403)

    def test_regular_users_have_no_item_limit(self) -> None:
        collection = Collection(owner_id=self.member.id, name="Big shelf")
        self.db.add(collection)
        self.db.commit()

        for index in range(31):
            self.add_game(collection, f"Game {index}")

        self.assertEqual(self.count(Game, Game.collection_id == collection.id), 31)

    def test_a_sandbox_cannot_share(self) -> None:
        sandbox = create_sandbox(self.db)
        collection = self.sandbox_collection(sandbox)

        for attempt in (
            lambda: create_grant(
                GrantCreate(username="member"), collection.id, self.db, sandbox
            ),
            lambda: list_grants(collection.id, self.db, sandbox),
            lambda: delete_grant(collection.id, self.member.id, self.db, sandbox),
        ):
            with self.assertRaises(HTTPException) as raised:
                attempt()
            self.assertEqual(raised.exception.status_code, 403)

    def test_no_one_can_share_with_a_sandbox(self) -> None:
        sandbox = create_sandbox(self.db)
        collection = Collection(owner_id=self.member.id, name="Shelf")
        self.db.add(collection)
        self.db.commit()

        with self.assertRaises(HTTPException) as raised:
            create_grant(
                GrantCreate(username=sandbox.username),
                collection.id,
                self.db,
                self.member,
            )

        self.assertEqual(raised.exception.status_code, 404)

    def test_deleting_copied_items_leaves_the_template_untouched(self) -> None:
        sandbox = create_sandbox(self.db)
        collection = self.sandbox_collection(sandbox)
        game_ids = self.db.scalars(
            select(Game.id).where(Game.collection_id == collection.id)
        ).all()

        for game_id in game_ids:
            delete_game(game_id, collection, self.db)

        self.assertEqual(self.count(Game, Game.collection_id == collection.id), 0)
        self.assertEqual(
            self.count(Game, Game.collection_id == self.template_collection.id), 2
        )

    def test_a_sandbox_cannot_write_to_the_template(self) -> None:
        sandbox = create_sandbox(self.db)

        with self.assertRaises(HTTPException) as raised:
            get_writable_collection(self.template_collection.id, self.db, sandbox)

        self.assertEqual(raised.exception.status_code, 404)

    def test_signing_out_deletes_the_sandbox(self) -> None:
        sandbox = create_sandbox(self.db)
        sandbox_id = sandbox.id
        token = jwt.encode(
            {
                "sub": sandbox.username,
                "exp": datetime.now(UTC) + timedelta(minutes=5),
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        request = SimpleNamespace(cookies={"access_token": token}, method="POST")

        logout(request, Response(), self.db)

        self.assertEqual(self.count(User, User.id == sandbox_id), 0)
        self.assertEqual(self.count(Collection, Collection.owner_id == sandbox_id), 0)
        self.assertEqual(
            self.count(Game, Game.collection_id == self.template_collection.id), 2
        )

    def test_an_admin_cannot_change_a_sandbox_role(self) -> None:
        sandbox = create_sandbox(self.db)

        with self.assertRaises(HTTPException) as raised:
            set_user_role(
                sandbox.id, AdminUserRoleUpdate(role="user"), self.db, self.admin
            )

        self.assertEqual(raised.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
