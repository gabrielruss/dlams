import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-only-secret")

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.collections.video_games_routes import list_video_game_collection_stats
from app.db import Base
from app.models import (
    Collection,
    CollectionGrant,
    Console,
    ConsoleLabel,
    Game,
    User,
)


class VideoGameCollectionStatsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)

        self.owner = User(username="owner", hashed_password="hash")
        self.reader = User(username="reader", hashed_password="hash")
        other_owner = User(username="other", hashed_password="hash")
        self.db.add_all([self.owner, self.reader, other_owner])
        self.db.flush()

        self.owned_collection = Collection(
            owner_id=self.reader.id,
            name="Owned games",
        )
        self.granted_collection = Collection(
            owner_id=self.owner.id,
            name="Shared games",
        )
        self.private_collection = Collection(
            owner_id=other_owner.id,
            name="Private games",
        )
        self.db.add_all(
            [
                self.owned_collection,
                self.granted_collection,
                self.private_collection,
            ]
        )
        self.db.flush()
        self.db.add(
            CollectionGrant(
                collection_id=self.granted_collection.id,
                user_id=self.reader.id,
                mode="demo",
            )
        )

        label = ConsoleLabel(
            collection_id=self.owned_collection.id,
            name="Xbox 360",
        )
        self.db.add(label)
        self.db.flush()
        self.db.add_all(
            [
                Console(
                    console_label_id=label.id,
                    condition="CIB",
                ),
                Console(
                    console_label_id=label.id,
                    condition="Loose",
                ),
                Game(
                    console_label_id=label.id,
                    name="Example game",
                    condition="Loose",
                    completed=False,
                ),
            ]
        )
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def test_stats_cover_owned_and_granted_collections_only(self) -> None:
        response = list_video_game_collection_stats(self.db, self.reader)
        stats_by_collection_id = {
            stats.collection_id: stats for stats in response.stats
        }

        self.assertEqual(
            set(stats_by_collection_id),
            {self.owned_collection.id, self.granted_collection.id},
        )
        self.assertEqual(
            stats_by_collection_id[self.owned_collection.id].game_count,
            1,
        )
        self.assertEqual(
            stats_by_collection_id[self.owned_collection.id].console_count,
            2,
        )
        self.assertEqual(
            stats_by_collection_id[self.granted_collection.id].game_count,
            0,
        )
        self.assertEqual(
            stats_by_collection_id[self.granted_collection.id].console_count,
            0,
        )


if __name__ == "__main__":
    unittest.main()
