import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.collections.video_games_routes import (
    create_console,
    create_game,
    delete_console,
    delete_game,
    list_console_labels,
    list_games,
    update_console,
    update_game,
)
from app.collections.video_games_schemas import (
    ConsoleCreate,
    ConsoleUpdate,
    GameCreate,
    GameUpdate,
)
from app.db import Base
from app.models import Collection, Console, ConsoleLabel, Game, User
from app.models.video_games import VideoGameCondition


class VideoGamesRouteTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.owner = User(username="owner", hashed_password="hash")
        self.db.add(self.owner)
        self.db.flush()
        self.collection = Collection(owner_id=self.owner.id, name="Games")
        self.db.add(self.collection)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def add_console(self, edition: str | None = None):
        return create_console(
            ConsoleCreate(
                label="Xbox 360",
                edition=edition,
                condition=VideoGameCondition.CIB,
            ),
            self.collection,
            self.db,
        )

    def add_game(self, console_label: str = "Xbox 360", name: str = "Example game"):
        return create_game(
            GameCreate(
                name=name,
                condition=VideoGameCondition.LOOSE,
                console_label=console_label,
            ),
            self.collection,
            self.db,
        )

    def test_shared_console_label_reports_unique_game_count(self) -> None:
        first_console = self.add_console("Original white")
        self.add_console("Star Wars edition")
        game = self.add_game()

        labels = list_console_labels(self.db, self.owner)

        self.assertEqual([label.name for label in labels.labels], ["Xbox 360"])
        console_count = (
            self.db.query(Console)
            .filter_by(console_label_id=first_console.console_label_id)
            .count()
        )
        self.assertEqual(console_count, 2)
        self.assertEqual(game.console_label_id, first_console.console_label_id)

    def test_game_can_create_its_own_console_label(self) -> None:
        game = self.add_game("PS2")

        self.assertEqual(game.console_label, "PS2")
        stored = self.db.query(Game).one()
        self.assertEqual(stored.collection_id, self.collection.id)
        self.assertEqual(self.db.query(Console).count(), 0)
        labels = list_console_labels(self.db, self.owner).labels
        self.assertEqual([label.name for label in labels], ["PS2"])
        listed = list_games(self.collection, self.db).games
        self.assertEqual([item.id for item in listed], [game.id])

    def test_console_label_is_reused_ignoring_case_and_spaces(self) -> None:
        console = self.add_console()
        game = self.add_game("  xbox 360 ")

        self.assertEqual(game.console_label_id, console.console_label_id)
        self.assertEqual(game.console_label, "Xbox 360")
        self.assertEqual(self.db.query(ConsoleLabel).count(), 1)

    def test_changing_only_the_case_of_a_console_label_renames_it(self) -> None:
        console = self.add_console()
        game = self.add_game()

        updated = update_console(
            console.id,
            ConsoleUpdate(
                label="xbox 360",
                edition=None,
                condition=VideoGameCondition.CIB,
            ),
            self.collection,
            self.db,
        )

        self.assertEqual(updated.label, "xbox 360")
        self.assertEqual(updated.console_label_id, console.console_label_id)
        self.assertEqual(self.db.query(ConsoleLabel).count(), 1)
        listed = list_games(self.collection, self.db).games
        self.assertEqual([item.id for item in listed], [game.id])
        self.assertEqual(listed[0].console_label, "xbox 360")

    def test_blank_console_label_is_rejected(self) -> None:
        with self.assertRaises(ValidationError):
            GameCreate(
                name="Game",
                condition=VideoGameCondition.LOOSE,
                console_label="",
            )
        with self.assertRaises(HTTPException) as raised:
            self.add_game("   ")
        self.assertEqual(raised.exception.status_code, 422)

    def test_labels_are_reused_across_the_owners_collections(self) -> None:
        other = Collection(owner_id=self.collection.owner_id, name="Other")
        self.db.add(other)
        self.db.commit()
        first = self.add_game("PS2")
        second = create_game(
            GameCreate(
                name="Elsewhere",
                condition=VideoGameCondition.NEW,
                console_label="ps2",
            ),
            other,
            self.db,
        )

        self.assertEqual(self.db.query(ConsoleLabel).count(), 1)
        self.assertEqual(first.console_label_id, second.console_label_id)
        self.assertEqual(len(list_games(self.collection, self.db).games), 1)
        self.assertEqual(len(list_games(other, self.db).games), 1)

    def test_a_label_stays_while_another_collection_still_uses_it(self) -> None:
        other = Collection(owner_id=self.collection.owner_id, name="Other")
        self.db.add(other)
        self.db.commit()
        first = self.add_game("PS2")
        create_game(
            GameCreate(
                name="Elsewhere",
                condition=VideoGameCondition.NEW,
                console_label="PS2",
            ),
            other,
            self.db,
        )

        delete_game(first.id, self.collection, self.db)

        self.assertEqual(self.db.query(ConsoleLabel).count(), 1)

    def test_label_list_only_includes_the_signed_in_users_labels(self) -> None:
        stranger = User(username="stranger", hashed_password="hash")
        self.db.add(stranger)
        self.db.commit()
        self.add_game("PS2")

        self.assertEqual(
            [label.name for label in list_console_labels(self.db, self.owner).labels],
            ["PS2"],
        )
        self.assertEqual(list_console_labels(self.db, stranger).labels, [])

    def test_changing_a_games_console_drops_the_unused_old_label(self) -> None:
        game = self.add_game("PS2")

        updated = update_game(
            game.id,
            GameUpdate(
                name="Example game",
                condition=VideoGameCondition.LOOSE,
                console_label="PS3",
                completed=False,
            ),
            self.collection,
            self.db,
        )

        self.assertEqual(updated.console_label, "PS3")
        names = [label.name for label in self.db.query(ConsoleLabel).all()]
        self.assertEqual(names, ["PS3"])

    def test_deleting_a_game_drops_its_label_only_when_unused(self) -> None:
        self.add_console()
        kept = self.add_game("Xbox 360")
        removed = self.add_game("PS2")

        delete_game(removed.id, self.collection, self.db)
        names = sorted(label.name for label in self.db.query(ConsoleLabel).all())
        self.assertEqual(names, ["Xbox 360"])

        delete_game(kept.id, self.collection, self.db)
        names = sorted(label.name for label in self.db.query(ConsoleLabel).all())
        self.assertEqual(names, ["Xbox 360"])  # a console still uses it

    def test_last_console_can_be_deleted_while_games_use_its_label(self) -> None:
        console = self.add_console()
        self.add_game()

        delete_console(console.id, self.collection, self.db)

        self.assertEqual(self.db.query(Console).count(), 0)
        self.assertEqual(self.db.query(Game).count(), 1)
        labels = list_console_labels(self.db, self.owner).labels
        self.assertEqual([label.name for label in labels], ["Xbox 360"])

    def test_relabelling_a_console_keeps_a_label_games_still_use(self) -> None:
        console = self.add_console()
        self.add_game()

        update_console(
            console.id,
            ConsoleUpdate(label="Xbox", condition=VideoGameCondition.CIB),
            self.collection,
            self.db,
        )

        names = sorted(label.name for label in self.db.query(ConsoleLabel).all())
        self.assertEqual(names, ["Xbox", "Xbox 360"])

    def test_one_edition_can_be_deleted_and_last_can_follow_game_deletion(self) -> None:
        first_console = self.add_console("Original white")
        second_console = self.add_console("Star Wars edition")
        game = self.add_game()

        delete_console(first_console.id, self.collection, self.db)
        self.assertEqual(self.db.query(Console).count(), 1)

        delete_game(game.id, self.collection, self.db)
        delete_console(second_console.id, self.collection, self.db)

        self.assertEqual(self.db.query(Console).count(), 0)
        self.assertEqual(list_console_labels(self.db, self.owner).labels, [])


if __name__ == "__main__":
    unittest.main()
