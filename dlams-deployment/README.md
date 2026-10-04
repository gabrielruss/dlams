# Run DLAMS locally

Both local setups use the same development database and saved data. This
database is separate from production and is not used by the production
deployment.

## Local Only Dev: Run UI and API on your Mac

Start the shared development database. Run this from this folder:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml up -d db
```

In a terminal in `../dlams-fastapi`, create and prepare the Python environment
once:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Then, in that terminal, start the API:

```bash
export DATABASE_URL=postgresql://dlams_dev:dlams_dev@127.0.0.1:5433/dlams_dev
export SECRET_KEY=local-development-only-secret
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In another terminal in `../dlams-ui`, run:

```bash
npm ci
npm run dev:local
```

## Local Docker Dev: Run UI and API in Docker

From this folder, run:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml up --build -d
```

The `-d` option keeps the services running in the background, so you can close
the terminal. Open <http://localhost:5174>. API docs:
<http://localhost:8001/docs>.

To view the service logs:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml logs -f
```

To stop the services:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml down
```

This stops the UI and API but keeps the shared development database and its
data. The Mac-only setup can still use that database. To erase it too, add
`--volumes` to the `down` command. The database is empty the first time you
start it, so register a development user before logging in.

### Connect to the development database

In DBeaver, create a PostgreSQL connection with:

- Host: `127.0.0.1`
- Port: `5433`
- Database: `dlams_dev`
- Username: `dlams_dev`
- Password: `dlams_dev`

These are local development credentials, not your DLAMS app login.

## Production

Production is separate; do not use it for local development. It requires the
configured domain names, HTTPS certificates, and production secrets.
Production login is not verified and has a known API route mismatch. Do not
deploy until that mismatch is fixed and tested.
