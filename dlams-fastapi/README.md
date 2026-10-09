# DLAMS API

FastAPI backend with PostgreSQL and Alembic migrations.

Use the [deployment guide](../dlams-deployment/README.md) to run the API with
the UI. Install API dependencies with `python -m pip install -r requirements.txt`.

After changing a database model, create and apply a migration with Alembic.
Back up production data before applying production migrations.
