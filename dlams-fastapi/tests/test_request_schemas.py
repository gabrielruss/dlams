import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from pydantic import BaseModel, ValidationError

from app.auth.schemas import (
    AdminPasswordReset,
    AdminUserRoleUpdate,
    LoginRequest,
    RegisterRequest,
)
from app.collections.schemas import (
    CollectionCreate,
    CollectionUpdate,
    GrantCreate,
    LinkCreate,
)
from app.collections.video_games.schemas import (
    ConsoleCreate,
    ConsoleUpdate,
    GameCreate,
    GameUpdate,
)
from app.schemas import RequestSchema

console_body = {"label": "SNES", "edition": None, "condition": "Loose"}
game_body = {
    "name": "Chrono Trigger",
    "condition": "CIB",
    "console_label": "SNES",
    "last_played": None,
    "completed": False,
}

valid_request_bodies: list[tuple[type[BaseModel], dict]] = [
    (LoginRequest, {"username": "test-user", "password": "secret"}),
    (
        RegisterRequest,
        {"username": "test-user", "password": "secret", "invitation_code": "code"},
    ),
    (AdminUserRoleUpdate, {"role": "user"}),
    (AdminPasswordReset, {"password": "secret"}),
    (CollectionCreate, {"name": "Shelf", "type": "video_game"}),
    (CollectionUpdate, {"name": "Shelf"}),
    (GrantCreate, {"username": "member"}),
    (LinkCreate, {"name": None}),
    (ConsoleCreate, console_body),
    (ConsoleUpdate, console_body),
    (GameCreate, game_body),
    (GameUpdate, game_body),
]


class RequestSchemaTests(unittest.TestCase):
    def test_each_request_extends_request_schema(self) -> None:
        for schema, _ in valid_request_bodies:
            with self.subTest(schema=schema.__name__):
                self.assertTrue(issubclass(schema, RequestSchema))

    def test_each_request_accepts_the_body_the_ui_sends(self) -> None:
        for schema, body in valid_request_bodies:
            with self.subTest(schema=schema.__name__):
                schema.model_validate(body)

    def test_each_request_rejects_an_unknown_field(self) -> None:
        for schema, body in valid_request_bodies:
            with self.subTest(schema=schema.__name__):
                with self.assertRaises(ValidationError) as raised:
                    schema.model_validate({**body, "unexpected": "value"})
                self.assertEqual(
                    raised.exception.errors()[0]["type"], "extra_forbidden"
                )


if __name__ == "__main__":
    unittest.main()
