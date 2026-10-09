import hashlib
import os
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.bootstrap_admin import create_first_admin
from app.auth.routes import create_registration_invitation, register
from app.auth.schemas import RegisterRequest
from app.db import Base
from app.models import RegistrationInvitation, User, UserRole


class RegistrationInvitationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.admin = User(
            username="admin",
            hashed_password="hashed-password",
            role=UserRole.ADMIN.value,
        )
        self.db.add(self.admin)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def request(self, invitation_code: str) -> RegisterRequest:
        return RegisterRequest(
            username="new-user",
            password="password",
            invitation_code=invitation_code,
        )

    def create_invitation(self) -> str:
        with patch("app.auth.routes.secrets.token_urlsafe", return_value="one-time"):
            response = create_registration_invitation(self.db, self.admin)
        return response.invitation_code

    def test_regular_user_cannot_create_an_invitation(self) -> None:
        regular_user = User(username="member", hashed_password="hashed-password")
        self.db.add(regular_user)
        self.db.commit()

        with self.assertRaises(HTTPException) as raised:
            create_registration_invitation(self.db, regular_user)

        self.assertEqual(raised.exception.status_code, 403)

    def test_invitation_code_is_stored_as_a_hash_and_only_used_once(self) -> None:
        invitation_code = self.create_invitation()
        saved_invitation = self.db.query(RegistrationInvitation).one()
        self.assertEqual(
            saved_invitation.token_hash,
            hashlib.sha256(invitation_code.encode("utf-8")).hexdigest(),
        )
        self.assertNotEqual(saved_invitation.token_hash, invitation_code)

        with patch("app.auth.routes.pwd_context.hash", return_value="hashed-password"):
            result = register(self.request(invitation_code), self.db)

        self.assertEqual(result, {"message": "User created successfully"})
        self.assertEqual(
            self.db.query(User).filter(User.username == "new-user").one().role,
            UserRole.USER.value,
        )
        self.assertIsNotNone(saved_invitation.redeemed_at)

        with self.assertRaises(HTTPException) as raised:
            register(self.request(invitation_code), self.db)
        self.assertEqual(raised.exception.status_code, 400)

    def test_registration_rejects_invalid_or_expired_invitation(self) -> None:
        with self.assertRaises(HTTPException) as invalid:
            register(self.request("not-a-valid-code"), self.db)
        self.assertEqual(invalid.exception.status_code, 400)

        invitation_code = self.create_invitation()
        saved_invitation = self.db.query(RegistrationInvitation).one()
        saved_invitation.expires_at = datetime.now(timezone.utc) - timedelta(
            minutes=1
        )
        self.db.commit()

        with self.assertRaises(HTTPException) as expired:
            register(self.request(invitation_code), self.db)
        self.assertEqual(expired.exception.status_code, 400)

    def test_duplicate_username_does_not_consume_invitation(self) -> None:
        invitation_code = self.create_invitation()
        existing_user = User(username="new-user", hashed_password="hashed-password")
        self.db.add(existing_user)
        self.db.commit()

        with self.assertRaises(HTTPException) as raised:
            register(self.request(invitation_code), self.db)

        self.assertEqual(raised.exception.status_code, 400)
        saved_invitation = self.db.query(RegistrationInvitation).one()
        self.assertIsNone(saved_invitation.redeemed_at)

    def test_invitation_fields_are_required_for_registration(self) -> None:
        with self.assertRaises(ValidationError):
            RegisterRequest.model_validate(
                {"username": "new-user", "password": "password"}
            )

    def test_bootstrap_creates_only_the_first_admin(self) -> None:
        self.db.delete(self.admin)
        self.db.commit()

        with patch(
            "app.auth.bootstrap_admin.pwd_context.hash",
            return_value="hashed-bootstrap-password",
        ):
            create_first_admin(self.db, "first-admin", "password")

        created_admin = (
            self.db.query(User)
            .filter(User.username == "first-admin")
            .one()
        )
        self.assertEqual(created_admin.role, UserRole.ADMIN.value)
        with self.assertRaises(ValueError):
            create_first_admin(self.db, "second-admin", "password")


if __name__ == "__main__":
    unittest.main()
