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

## Hybrid Dev: Run API and database in Docker, UI on your Mac

This setup runs only PostgreSQL and the API in Docker. The UI runs directly on
your Mac with Vite hot reload, and Vite proxies `/api` requests to the
containerized API. The API container applies pending Alembic migrations when
it starts.

From this folder, start the database and API:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml up --build -d db api
```

In a terminal in `../dlams-ui`, install dependencies once if needed, then
start Vite with the hybrid development script:

```bash
npm ci
npm run dev:hybrid
```

Open <http://localhost:5173>. API docs are at <http://localhost:8001/docs>.
The `dev:hybrid` script sets the API proxy target to `127.0.0.1:8001` and
reuses the `dev:local` script for the remaining Vite settings. The proxy
target matters because this Docker Compose setup publishes the API on port
`8001`, rather than the `8000` used by the Mac-only API workflow.

Stop the UI with `Ctrl+C` in its terminal. Stop the Docker API and database
from this folder with:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml down
```

The shared development database volume and its saved data are preserved.
If the full Docker development stack is already running, stop its UI service
before using this hybrid setup:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml stop ui
```

## Local Docker Dev: Run UI and API in Docker

From this folder, run:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml up --build -d
```

The `-d` option keeps the services running in the background, so you can close
the terminal. Open <http://localhost:5174>. API docs:
<http://localhost:8001/docs>.

### Try collections, access grants, and video-game API

Rebuild/restart the stack first so the local database applies the newest
migration. The collection-type migration assigns existing collections the
`video_game` type.
If an account previously had the global `demo` role, the migration changes
that role to `user`; grant it `demo` access to a collection instead.
Then open <http://localhost:8001/docs> and use `POST /register` to create two
local accounts, such as `collection-owner` and `demo-user`. Log in as
`collection-owner` with `POST /login`, then:

1. Call `POST /collections` with
   `{"name":"Demo collection","type":"video_game"}` and note its ID.
2. Call `POST /collections/{collection_id}/grants` with that ID and
   `{"username":"demo-user","mode":"demo"}`.
3. Log in as `demo-user` with `POST /login`.
4. Call `GET /collections` and confirm the demo collection appears with
   `"access":"demo"`.
5. Call `GET /collections/video-game-stats` to retrieve game and console
   counts for every collection the signed-in user can access.

For a writable collection, log in as its owner (or a user with an `edit`
grant), then use these endpoints in the API docs:

1. Create a physical console with `POST /collections/{collection_id}/consoles`:
   `{"label":"Xbox 360","edition":"Original white","condition":"CIB"}`.
   Save the returned `console_label_id`.
2. Add a second console with the same `label` and a different `edition`.
   `GET /collections/{collection_id}/console-labels` should still return one
   Xbox 360 label.
3. Create a game with `POST /collections/{collection_id}/games`, using the
   saved ID:
   `{"name":"Example game","condition":"Loose","console_label_id":1,"last_played":null,"completed":false}`.
   Replace `1` with the ID from step 1.
4. Confirm `GET /collections/{collection_id}/games` returns the game and that
   the Xbox 360 label and each console response report `game_count: 1`.
5. Delete one console edition. It should succeed while the other edition
   remains. Deleting the final edition while a game uses its label should
   return HTTP 409. Delete the game first; then deleting the final console
   should succeed and remove the now-unused label.
6. Log in as `demo-user`, then try creating a console or game in the demo
   collection. The API should deny the write with HTTP 403 while allowing
   reads. Browser-local demo editing is not implemented yet.

Console and game conditions are `Loose`, `CIB`, `New`, and `Item & Box`.
Optional `last_played` uses `YYYY-MM-DD`. In the UI, collection and item
create/edit forms open in a right-side drawer, and deleting a game asks for
confirmation. API deletes take effect immediately.

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

New accounts have the `user` role. To give your own local account the `admin`
role, run this in DBeaver's SQL editor after registering:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

Replace `your_username` with your account name and confirm that one row was
updated. Do not give the `admin` role to demo or visitor accounts.

## Production

Production is separate; do not use it for local development. It requires the
configured domain names, HTTPS certificates, and production secrets.
Production login is not verified and has a known API route mismatch. Do not
deploy until that mismatch is fixed and tested.
