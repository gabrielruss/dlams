import os
import unittest
from datetime import date

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi.routing import APIRoute
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session

from app.auth.utils import get_current_user
from app.collections.item_routes import list_owned_items
from app.collections.schemas import ItemResponse, ItemType
from app.db import Base
from app.main import app
from app.models import (
    Collection,
    CollectionGrant,
    Console,
    ConsoleLabel,
    Game,
    User,
)


class OwnedItemsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)

        self.user = User(username="test-user", hashed_password="hash")
        self.other = User(username="other-user", hashed_password="hash")
        self.db.add_all([self.user, self.other])
        self.db.flush()

        self.shelf = Collection(owner_id=self.user.id, name="Shelf")
        self.to_sell = Collection(owner_id=self.user.id, name="To sell")
        self.others = Collection(owner_id=self.other.id, name="Not mine")
        self.db.add_all([self.shelf, self.to_sell, self.others])
        self.db.flush()
        self.db.add(CollectionGrant(collection_id=self.others.id, user_id=self.user.id))

        self.xbox = ConsoleLabel(user_id=self.user.id, name="Xbox 360")
        self.ps2 = ConsoleLabel(user_id=self.user.id, name="PS2")
        other_label = ConsoleLabel(user_id=self.other.id, name="Xbox 360")
        self.db.add_all([self.xbox, self.ps2, other_label])
        self.db.flush()

        self.console = Console(
            collection_id=self.shelf.id,
            console_label_id=self.xbox.id,
            edition="Original white",
            condition="CIB",
        )
        self.halo = Game(
            collection_id=self.shelf.id,
            console_label_id=self.xbox.id,
            name="Halo 3",
            condition="Loose",
            completed=True,
            last_played=date(2026, 10, 1),
        )
        self.okami = Game(
            collection_id=self.to_sell.id,
            console_label_id=self.ps2.id,
            name="Ōkami",
            condition="CIB",
        )
        self.db.add_all(
            [
                self.console,
                self.halo,
                self.okami,
                Console(
                    collection_id=self.others.id,
                    console_label_id=other_label.id,
                    condition="Loose",
                ),
                Game(
                    collection_id=self.others.id,
                    console_label_id=other_label.id,
                    name="Someone else's game",
                    condition="Loose",
                ),
            ]
        )
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def items(self) -> list[ItemResponse]:
        return list_owned_items(self.db, self.user).items

    def test_lists_items_from_every_owned_collection_only(self) -> None:
        listed = {(item.type, item.id) for item in self.items()}

        self.assertEqual(
            listed,
            {
                (ItemType.CONSOLE, self.console.id),
                (ItemType.GAME, self.halo.id),
                (ItemType.GAME, self.okami.id),
            },
        )

    def test_a_game_carries_its_label_as_a_keyword_and_the_rest_as_details(
        self,
    ) -> None:
        halo = next(item for item in self.items() if item.title == "Halo 3")

        self.assertEqual(
            halo,
            ItemResponse(
                type=ItemType.GAME,
                id=self.halo.id,
                collection_id=self.shelf.id,
                collection_name="Shelf",
                title="Halo 3",
                keywords=["Xbox 360"],
                details=["Loose", "Completed", "Last played 2026-10-01"],
            ),
        )

    def test_a_console_title_includes_its_edition(self) -> None:
        console = next(item for item in self.items() if item.type == ItemType.CONSOLE)

        self.assertEqual(
            console,
            ItemResponse(
                type=ItemType.CONSOLE,
                id=self.console.id,
                collection_id=self.shelf.id,
                collection_name="Shelf",
                title="Xbox 360 — Original white",
                keywords=[],
                details=["CIB"],
            ),
        )

    def test_items_are_sorted_by_title_ignoring_case(self) -> None:
        self.halo.name = "halo 3"
        self.db.commit()

        titles = [item.title for item in self.items()]

        self.assertEqual(titles, ["halo 3", "Xbox 360 — Original white", "Ōkami"])

    def test_a_user_with_no_collections_gets_an_empty_list(self) -> None:
        newcomer = User(username="new-user", hashed_password="hash")
        self.db.add(newcomer)
        self.db.commit()

        self.assertEqual(list_owned_items(self.db, newcomer).items, [])

    def test_the_query_count_does_not_grow_with_the_items(self) -> None:
        for number in range(20):
            self.db.add(
                Game(
                    collection_id=self.shelf.id,
                    console_label_id=self.ps2.id,
                    name=f"Game {number}",
                    condition="Loose",
                )
            )
        self.db.commit()
        self.db.expire_all()
        self.db.refresh(self.user)
        statements: list[str] = []

        def record(_conn, _cursor, statement, *_args) -> None:
            statements.append(statement)

        event.listen(self.engine, "before_cursor_execute", record)
        try:
            items = self.items()
        finally:
            event.remove(self.engine, "before_cursor_execute", record)

        self.assertEqual(len(items), 23)
        self.assertEqual(len(statements), 2)

    def test_the_route_requires_a_signed_in_user(self) -> None:
        route = next(
            route
            for route in app.routes
            if isinstance(route, APIRoute) and route.path == "/items"
        )

        calls = [dependency.call for dependency in route.dependant.dependencies]
        self.assertIn(get_current_user, calls)


if __name__ == "__main__":
    unittest.main()
