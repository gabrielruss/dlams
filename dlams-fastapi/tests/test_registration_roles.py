import hashlib
import os
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from app.auth.routes import register
from app.auth.schemas import RegisterRequest, UserResponse
from app.db import Base
from app.models import RegistrationInvitation, User, UserRole


class RegistrationRoleTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.admin = User(
            username="admin",
            hashed_password="hashed-admin-password",
            role=UserRole.ADMIN.value,
        )
        self.db.add(self.admin)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def test_registration_rejects_requested_privileged_roles(self) -> None:
        for role in (UserRole.ADMIN.value, "demo"):
            with self.subTest(role=role):
                with self.assertRaises(ValidationError):
                    RegisterRequest.model_validate(
                        {
                            "username": "visitor",
                            "password": "password",
                            "invitation_code": "valid-invitation",
                            "role": role,
                        }
                    )

    def test_new_accounts_are_regular_users(self) -> None:
        invitation_code = "valid-invitation"
        now = datetime.now(timezone.utc)
        self.db.add(
            RegistrationInvitation(
                token_hash=hashlib.sha256(
                    invitation_code.encode("utf-8")
                ).hexdigest(),
                created_by_id=self.admin.id,
                created_at=now,
                expires_at=now + timedelta(days=7),
            )
        )
        self.db.commit()
        request = RegisterRequest(
            username="visitor",
            password="password",
            invitation_code=invitation_code,
        )

        with patch(
            "app.auth.routes.pwd_context.hash",
            return_value="hashed-password",
        ):
            result = register(request, self.db)

        self.assertEqual(result, {"message": "User created successfully"})
        saved_user = self.db.query(User).filter(User.username == "visitor").one()
        self.assertEqual(saved_user.role, UserRole.USER.value)
        response_user = UserResponse.model_validate(saved_user)
        self.assertEqual(response_user.model_dump(mode="json")["role"], "user")

    def test_database_rejects_unknown_roles(self) -> None:
        self.db.add(
            User(
                username="visitor",
                hashed_password="hashed-password",
                role="demo",
            )
        )

        with self.assertRaises(IntegrityError):
            self.db.commit()

        self.db.rollback()


if __name__ == "__main__":
    unittest.main()
