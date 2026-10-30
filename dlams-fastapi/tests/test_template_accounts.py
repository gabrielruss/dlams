import os
import unittest
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from fastapi.routing import APIRoute
from jose import jwt
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.auth.admin_routes import set_user_role
from app.auth.schemas import AdminUserRoleUpdate
from app.auth.utils import ALGORITHM, get_current_user
from app.config import SECRET_KEY
from app.db import Base
from app.main import app
from app.models import User, UserRole


def depends_on_current_user(dependant) -> bool:
    """True when get_current_user is anywhere in the dependency tree."""
    for dependency in dependant.dependencies:
        if dependency.call is get_current_user:
            return True
        if depends_on_current_user(dependency):
            return True
    return False


class TemplateAccountTests(unittest.TestCase):
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

    def request_for(self, username: str, method: str) -> SimpleNamespace:
        expires = datetime.now(UTC) + timedelta(minutes=5)
        token = jwt.encode(
            {"sub": username, "exp": expires}, SECRET_KEY, algorithm=ALGORITHM
        )
        return SimpleNamespace(cookies={"access_token": token}, method=method)

    def test_template_account_can_write(self) -> None:
        user = get_current_user(self.request_for("demo-user", "POST"), self.db)
        self.assertEqual(user.username, "demo-user")

    def test_every_write_route_requires_a_signed_in_user(self) -> None:
        # Only the auth routes that start or end a session may skip sign-in.
        unauthenticated = {"/register", "/login", "/logout", "/demo-sessions"}
        unsafe = {"POST", "PUT", "PATCH", "DELETE"}
        unprotected = []
        for route in app.routes:
            if not isinstance(route, APIRoute):
                continue
            if not unsafe & route.methods:
                continue
            if route.path in unauthenticated:
                continue
            if not depends_on_current_user(route.dependant):
                unprotected.append((sorted(route.methods), route.path))
        self.assertEqual(unprotected, [])

    def test_admin_can_switch_a_user_to_template_and_back(self) -> None:
        changed = set_user_role(
            self.member.id, AdminUserRoleUpdate(role="template"), self.db, self.admin
        )
        self.assertEqual(changed.role, UserRole.TEMPLATE)
        self.db.refresh(self.member)
        self.assertEqual(self.member.role, UserRole.TEMPLATE.value)

        changed = set_user_role(
            self.member.id, AdminUserRoleUpdate(role="user"), self.db, self.admin
        )
        self.assertEqual(changed.role, UserRole.USER)

    def test_only_admins_can_switch_roles(self) -> None:
        for actor in (self.member, self.template):
            with self.assertRaises(HTTPException) as raised:
                set_user_role(
                    self.member.id,
                    AdminUserRoleUpdate(role="template"),
                    self.db,
                    actor,
                )
            self.assertEqual(raised.exception.status_code, 403)

    def test_admin_cannot_change_own_role_or_another_admin(self) -> None:
        other_admin = User(
            username="other-admin",
            hashed_password="hashed-password",
            role=UserRole.ADMIN.value,
        )
        self.db.add(other_admin)
        self.db.commit()

        for target in (self.admin, other_admin):
            with self.assertRaises(HTTPException) as raised:
                set_user_role(
                    target.id, AdminUserRoleUpdate(role="template"), self.db, self.admin
                )
            self.assertEqual(raised.exception.status_code, 400)
            self.db.refresh(target)
            self.assertEqual(target.role, UserRole.ADMIN.value)

    def test_unknown_user_returns_404(self) -> None:
        with self.assertRaises(HTTPException) as raised:
            set_user_role(
                9999, AdminUserRoleUpdate(role="template"), self.db, self.admin
            )
        self.assertEqual(raised.exception.status_code, 404)

    def test_admin_role_cannot_be_assigned(self) -> None:
        for role in ("admin", "superuser"):
            with self.assertRaises(ValidationError):
                AdminUserRoleUpdate(role=role)


if __name__ == "__main__":
    unittest.main()
