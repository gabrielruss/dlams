import os
import unittest
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import patch

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException, Response
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.admin_routes import activate_user, deactivate_user, list_users
from app.auth.routes import login
from app.auth.schemas import LoginRequest
from app.auth.utils import ALGORITHM, get_current_user
from app.config import SECRET_KEY
from app.db import Base
from app.models import User, UserRole


class UserDeactivationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.admin = User(
            username="admin",
            hashed_password="hashed-password",
            role=UserRole.ADMIN.value,
        )
        self.member = User(username="member", hashed_password="hashed-password")
        self.db.add_all([self.admin, self.member])
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def request_for(self, username: str) -> SimpleNamespace:
        expires = datetime.now(timezone.utc) + timedelta(minutes=5)
        token = jwt.encode(
            {"sub": username, "exp": expires}, SECRET_KEY, algorithm=ALGORITHM
        )
        return SimpleNamespace(cookies={"access_token": token}, method="GET")

    def test_new_users_are_active_by_default(self) -> None:
        self.assertTrue(self.member.is_active)

    def test_regular_user_cannot_manage_users(self) -> None:
        for call in (
            lambda: list_users(self.db, self.member),
            lambda: deactivate_user(self.admin.id, self.db, self.member),
            lambda: activate_user(self.admin.id, self.db, self.member),
        ):
            with self.assertRaises(HTTPException) as raised:
                call()
            self.assertEqual(raised.exception.status_code, 403)
        self.assertTrue(self.admin.is_active)

    def test_admin_lists_users_with_active_state(self) -> None:
        result = list_users(self.db, self.admin)

        self.assertEqual(
            [(user.username, user.is_active) for user in result.users],
            [("admin", True), ("member", True)],
        )

    def test_deactivated_user_loses_an_existing_session(self) -> None:
        request = self.request_for("member")
        self.assertEqual(get_current_user(request, self.db).username, "member")

        deactivate_user(self.member.id, self.db, self.admin)

        with self.assertRaises(HTTPException) as raised:
            get_current_user(request, self.db)
        self.assertEqual(raised.exception.status_code, 401)

    def test_deactivated_user_cannot_log_in(self) -> None:
        deactivate_user(self.member.id, self.db, self.admin)

        with patch("app.auth.routes.pwd_context.verify", return_value=True):
            with self.assertRaises(HTTPException) as raised:
                login(
                    Response(),
                    LoginRequest(username="member", password="password"),
                    self.db,
                )
        self.assertEqual(raised.exception.status_code, 403)

    def test_reactivated_user_can_use_the_app_again(self) -> None:
        deactivate_user(self.member.id, self.db, self.admin)

        activate_user(self.member.id, self.db, self.admin)

        user = get_current_user(self.request_for("member"), self.db)
        self.assertEqual(user.username, "member")

    def test_admin_cannot_deactivate_themselves(self) -> None:
        with self.assertRaises(HTTPException) as raised:
            deactivate_user(self.admin.id, self.db, self.admin)

        self.assertEqual(raised.exception.status_code, 400)
        self.assertTrue(self.admin.is_active)

    def test_unknown_user_returns_404(self) -> None:
        with self.assertRaises(HTTPException) as raised:
            deactivate_user(9999, self.db, self.admin)

        self.assertEqual(raised.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
