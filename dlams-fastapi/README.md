# Start the virtual env

source .venv/bin/activate

# Stop the virtual env

deactivate

# Run the app - manually

uvicorn app.main:app --reload

# Run the app - Docker

docker-compose up -d --build

# Proper imports

First party on top
Third party below that
Local imports below that

## Local PostgreSQL Setup (Homebrew) - if not using Docker

To start the PostgreSQL service:

```bash
brew services start postgresql@14
```

To stop the PostgreSQL service:

```bash
brew services stop postgresql@14
```

## Database Migration Workflow

### Local Development

1. Make changes to your SQLAlchemy models in `app/models/`
2. Generate and test migrations locally:

```bash
# Connect to local app container
docker exec -it dlams-fastapi-app-1 bash

# Create migration
alembic revision --autogenerate -m "Description of your changes"

# Review migration in alembic/versions/
# Apply migration
alembic upgrade head
```

3. Commit and push changes:
   - Modified model files
   - New migration files in `alembic/versions/`
   - Any related code changes

### Todo long term

- Back up production database before running migrations
