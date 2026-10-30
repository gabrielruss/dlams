import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.admin_routes import reset_user_password
from app.auth.schemas import AdminPasswordReset
from app.auth.utils import pwd_context
from app.db import Base
from app.models import User, UserRole


class AdminPasswordResetTests(unittest.TestCase):
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
        self.template = User(
            username="demo-user",
            hashed_password="hashed-password",
            role=UserRole.TEMPLATE.value,
        )
        self.db.add_all([self.admin, self.member, self.template])
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def reset(self, target: User, actor: User, password: str = "new-password"):
        return reset_user_password(
            target.id, AdminPasswordReset(password=password), self.db, actor
        )

    def test_admin_sets_a_new_password(self) -> None:
        for target in (self.member, self.template, self.admin):
            with self.subTest(target=target.username):
                self.reset(target, self.admin)
                self.db.refresh(target)
                self.assertTrue(
                    pwd_context.verify("new-password", target.hashed_password)
                )

    def test_only_admins_can_reset_passwords(self) -> None:
        with self.assertRaises(HTTPException) as raised:
            self.reset(self.template, self.member)
        self.assertEqual(raised.exception.status_code, 403)
        self.db.refresh(self.template)
        self.assertEqual(self.template.hashed_password, "hashed-password")

    def test_another_admin_and_sandbox_accounts_are_refused(self) -> None:
        other_admin = User(
            username="other-admin",
            hashed_password="hashed-password",
            role=UserRole.ADMIN.value,
        )
        sandbox = User(
            username="sandbox-1234abcd",
            hashed_password="hashed-password",
            role=UserRole.SANDBOX.value,
        )
        self.db.add_all([other_admin, sandbox])
        self.db.commit()

        for target in (other_admin, sandbox):
            with self.subTest(target=target.username):
                with self.assertRaises(HTTPException) as raised:
                    self.reset(target, self.admin)
                self.assertEqual(raised.exception.status_code, 400)

    def test_unknown_user_returns_404(self) -> None:
        with self.assertRaises(HTTPException) as raised:
            reset_user_password(
                9999, AdminPasswordReset(password="new-password"), self.db, self.admin
            )
        self.assertEqual(raised.exception.status_code, 404)

    def test_password_follows_the_registration_length_rules(self) -> None:
        for password in ("short", "x" * 31):
            with self.subTest(length=len(password)):
                with self.assertRaises(ValidationError):
                    AdminPasswordReset(password=password)


if __name__ == "__main__":
    unittest.main()
