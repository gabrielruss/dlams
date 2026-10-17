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

### Shortcuts

From the repository root, `make` wraps the Docker commands above:

- `make dev` builds and starts the dev stack in the background.
- `make watch` starts the stack and keeps the API in sync as you edit: changes
  under `dlams-fastapi/app` and `dlams-fastapi/alembic` are copied into the
  container and the API restarts (which also applies new migrations), and a
  change to `requirements.txt` triggers a rebuild. UI changes already
  hot-reload without this.
- `make logs`, `make down`, and `make test` (backend unit tests, which need
  `dlams-fastapi/.venv`). `make help` lists them.

### Try collections, access grants, and video-game API

Rebuild/restart the stack first so the local database applies the newest
migration. The collection-type migration assigns existing collections the
`video_game` type.
If an account previously had the global `demo` role, the migration changes
that role to `user`; grant it `demo` access to a collection instead.
Registration requires a one-time invitation. On an empty development database,
create its first admin from the API container:

```bash
docker compose -p dlams-dev -f docker-compose.dev.yml exec api python -m app.auth.bootstrap_admin
```

Log in to <http://localhost:5174> as that admin, create two invitations in the
“Invite someone” panel, then open each invitation link to register accounts
such as `collection-owner` and `demo-user`. Log in as `collection-owner` in
the API docs at <http://localhost:8001/docs>, then:

1. Call `POST /collections` with
   `{"name":"Demo collection","type":"video_game"}` and note its ID.
2. Call `POST /collections/{collection_id}/grants` with that ID and
   `{"username":"demo-user"}`. Sharing is read-only, so a grant has no mode.
3. Log in as `demo-user` with `POST /login`.
4. Call `GET /collections` and confirm the collection appears with
   `"access":"view-only"`.
5. Call `GET /collections/video-game-stats` to retrieve game and console
   counts for every collection the signed-in user can access.

To write to a collection, log in as its owner (shared users cannot write),
then use these endpoints in the API docs:

1. Create a physical console with `POST /collections/{collection_id}/consoles`:
   `{"label":"Xbox 360","edition":"Original white","condition":"CIB"}`.
   Save the returned `console_label_id`.
2. Add a second console with the same `label` and a different `edition`.
   `GET /console-labels` (your labels, across all your collections) should
   still return one Xbox 360 label.
3. Create a game with `POST /collections/{collection_id}/games`:
   `{"name":"Example game","condition":"Loose","console_label":"Xbox 360","last_played":null,"completed":false}`.
   The console is required but is a name, not an ID. A name that does not
   exist yet (for example `"PS2"`) creates a label with no console record, so
   a collection with no consoles can still hold games. Names match ignoring
   case.
4. Confirm `GET /collections/{collection_id}/games` returns the game and that
   each console response reports `game_count: 1` (games in that collection).
5. Delete one console edition. It should succeed while the other edition
   remains. Deleting the final edition while a game uses its label also
   succeeds, and the label stays because the game uses it. A label is removed
   only once no console and no game uses it.
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
`--volumes` to the `down` command. On a new empty database, bootstrap its
first admin from the API container, then use that account to issue registration
invitations.

### Connect to the development database

In DBeaver, create a PostgreSQL connection with:

- Host: `127.0.0.1`
- Port: `5433`
- Database: `dlams_dev`
- Username: `dlams_dev`
- Password: `dlams_dev`

These are local development credentials, not your DLAMS app login.

New accounts have the `user` role. To give your own local account the `admin`
role manually, run this in DBeaver's SQL editor:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

Replace `your_username` with your account name and confirm that one row was
updated. Do not give the `admin` role to demo or visitor accounts.

## Production

Production is separate; do not use it for local development. It requires the
configured domain names, HTTPS certificates, and production secrets. Back up
the production database before deploying schema changes. The API container
applies Alembic migrations on startup.

Registration is invitation-only: the API rejects registration without a
valid, unused invitation. To bootstrap the first admin after deploying the
updated API image, SSH to the Pi and run:

```bash
docker exec -it dlams-api python -m app.auth.bootstrap_admin
```

This command creates an admin account only if no admin exists, prompts for a
username and password without echoing the password, and stores the password
hash. Log into the site as that admin and use the “Invite someone” panel to
create a registration link. Each invitation works once and expires after
seven days. Share it privately; anyone holding an unused link can create one
regular account.

### Database backups

`dlams-deployment/scripts/backup-db.sh` dumps the production database with
`pg_dump` inside the `db` container, writes a compressed dump named
`dlams-<UTC timestamp>.dump` to `~/dlams-backups`, checks that the archive is
readable, deletes dumps older than 14 days, and can copy the new dump to
another machine. It needs only Docker and, for the off-device copy, `rsync`.
No credentials are in the script: the container supplies the database user
and name.

A backup that lives only on the host does not survive losing the host, so set
an off-device destination. Dumps contain password hashes and personal data;
keep them private, and keep the destination out of tracked files (record it
in `.private/ops-notes.md`).

Settings, all optional environment variables:

| Variable | Default | Meaning |
| --- | --- | --- |
| `DLAMS_DB_CONTAINER` | `dlams-db` | Name of the db container |
| `DLAMS_BACKUP_DIR` | `~/dlams-backups` | Where dumps are kept |
| `DLAMS_BACKUP_KEEP_DAYS` | `14` | Delete dumps older than this |
| `DLAMS_BACKUP_REMOTE` | unset | `rsync` destination, for example `user@host:/path/` |

**Run it by hand** before any deploy that includes a migration:

```bash
~/dlams/dlams-deployment/scripts/backup-db.sh
```

**Schedule it nightly** on the host with `crontab -e`:

```cron
15 3 * * * DLAMS_BACKUP_REMOTE=user@host:/path/ ~/dlams/dlams-deployment/scripts/backup-db.sh >> ~/dlams-backups/backup.log 2>&1
```

Cron runs with a minimal environment, so confirm the line works by running the
same command once in a shell. Then check that
`~/dlams-backups/backup.log` has a "wrote" line the next morning and that the
off-device copy arrived.

**Test a restore once** so you know a dump works before you need it. This
restores into a scratch database and does not touch production data:

```bash
cd ~/dlams/dlams-deployment
f=~/dlams-backups/<a dump file>.dump
docker exec dlams-db sh -c 'createdb -U "$POSTGRES_USER" restore_test'
docker exec -i dlams-db sh -c 'pg_restore -U "$POSTGRES_USER" -d restore_test --no-owner' < "$f"
docker exec dlams-db sh -c 'psql -U "$POSTGRES_USER" -d restore_test -c "select count(*) from users;"'
docker exec dlams-db sh -c 'dropdb -U "$POSTGRES_USER" restore_test'
```

The count should match the number of users on the site.

**Restore for real** (this replaces the production database with the dump):

```bash
cd ~/dlams/dlams-deployment
docker compose stop api
docker exec dlams-db sh -c 'dropdb -U "$POSTGRES_USER" "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
docker exec -i dlams-db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner' < ~/dlams-backups/<dump file>.dump
docker compose start api
```

The dump includes Alembic's version table, so the API's start-up migration
resumes from the schema the dump was taken at.

Not covered: point-in-time recovery, and the dump is only as recent as the
last run. Re-enter anything added since the last backup.

### Demo account

The public demo is a `demo-user` account with the `demo` role. Only an admin
can set that role, from "Manage users". A demo account can sign in and read
everything it can see, but the API rejects any other request it makes with
HTTP 403, including creating collections. Its credentials are public by
design, so give it a password you use nowhere else.

A visitor will eventually be able to use the app as if it were a full
account, with edits applied only in their own browser. That browser-local
editing is not built yet; until it is, demo accounts see a read-only UI with
no add, edit, or delete controls.

Provision it once on production, signed in as an admin:

1. **Create the invitation.** Use "Invite someone" in the sidebar and copy the
   link. Open it in a private browser window and register `demo-user` with the
   public demo password. It starts as an ordinary account.
2. **Enter the content as that account.** Still in the private window, create
   a collection (for example "Retro game shelf", type video game) and add
   content that looks real: roughly 10 to 15 games across 3 or 4 consoles, a
   mix of conditions, some completed, some with a last-played date, and at
   least one console with two editions. The account owns the collection.
3. **Switch the role.** In your own admin session, open "Manage users" and
   choose "Make demo" on the `demo-user` row. It takes effect on the
   account's next request, even in an open session.
4. **Verify as the visitor.** Sign in as `demo-user` in a private window. You
   should see its collection with no add, edit, or delete controls and no
   "New collection" button.
5. **Prove the API refuses writes.** In that same demo session, from the
   browser console, run
   `fetch("/api/collections", {method: "POST", credentials: "include", headers: {"Content-Type": "application/json"}, body: JSON.stringify({name: "x"})}).then(r => r.status)`.
   It should print `403`, and the collection list should be unchanged.

Things to know:

- **Editing the content later.** Use "Make regular" on the row, sign in as the
  account, make the changes, then "Make demo" again. Do not leave it as a
  regular account while its password is public.
- **Taking it down.** An admin can deactivate the account from "Manage users"
  at any time and reactivate it later.
- **Changing the demo password.** There is no password-change screen. Rotating
  it today means a database update on the host; record the procedure in
  `.private/ops-notes.md` if you do it.
- **Backups.** The curated content lives only in the production database,
  which the nightly backup covers (see "Database backups"). Keep a list of the
  games and consoles you entered in case you need to re-enter them.

The production Nginx `/api/` proxy is configured to strip the prefix before
forwarding to FastAPI, and the production auth cookie is configured as
Secure. These source changes still need deployment and a live end-to-end check;
do not treat production login or registration as verified until tested on the
Pi.
