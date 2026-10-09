"""Create the first DLAMS admin account from inside the API environment."""

from getpass import getpass
import sys

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.utils import pwd_context
from app.db import SessionLocal
from app.models import User, UserRole


def create_first_admin(db: Session, username: str, password: str) -> None:
    """Create an admin only when the database has no admin account yet."""
    if db.scalar(select(User.id).where(User.role == UserRole.ADMIN.value)):
        raise ValueError("An admin account already exists.")
    if db.scalar(select(User.id).where(User.username == username)):
        raise ValueError("That username is already registered.")
    if not 4 <= len(username) <= 100:
        raise ValueError("Username must be between 4 and 100 characters.")
    if not 6 <= len(password) <= 30:
        raise ValueError("Password must be between 6 and 30 characters.")

    db.add(
        User(
            username=username,
            hashed_password=pwd_context.hash(password),
            role=UserRole.ADMIN.value,
        )
    )
    db.commit()


def main() -> int:
    username = input("Admin username: ").strip()
    password = getpass("Admin password (6-30 characters): ")
    confirmation = getpass("Confirm admin password: ")
    if password != confirmation:
        print("Passwords do not match.", file=sys.stderr)
        return 1

    with SessionLocal() as db:
        try:
            create_first_admin(db, username, password)
        except ValueError as exc:
            db.rollback()
            print(str(exc), file=sys.stderr)
            return 1

    print(f"Created DLAMS admin account {username!r}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
