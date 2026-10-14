# DLAMS architecture

Last updated: 2026-10-14

How the system is put together right now. For status and next steps see
[`DLAMS-PLAN.md`](../DLAMS-PLAN.md); for why things are this way see
[`decisions.md`](./decisions.md). This file describes the present only. Hosts,
paths, and server specifics belong in the git-ignored `.private/ops-notes.md`.

## Components

```
Browser ──► Nginx ──► ui   (serves the built React app)
               │
               └────► api  (FastAPI) ──► db (PostgreSQL)
```

| Component | Folder | Responsibility |
| --- | --- | --- |
| UI | `dlams-ui` | React 19 and TypeScript SPA built with Vite. Renders collections, forms, and admin screens; holds no authority of its own. |
| API | `dlams-fastapi` | Authentication, authorization, validation, and all persistent data. The only writer to the database. |
| Database | (image) | PostgreSQL. Schema changes only through Alembic migrations. |
| Edge | `dlams-deployment/nginx.conf` | TLS termination and routing to `ui` and `api`. |

The API is the security boundary. The UI hides controls the user cannot use,
but every rule is enforced server-side.

## Stack

Versions are the declared ranges from `dlams-ui/package.json` and
`dlams-fastapi/requirements.txt`; those files are the source of truth.

**Frontend (`dlams-ui`)**

| Concern | Library |
| --- | --- |
| Framework and build | React 19, TypeScript 5.9, Vite 7 |
| Routing | `react-router-dom` 7 |
| Server state | `@tanstack/react-query` 5 |
| Forms and validation | `react-hook-form`, `@hookform/resolvers`, `zod` 4 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), `tw-animate-css`, `tailwind-merge`, `clsx`, `class-variance-authority` |
| Components | shadcn/ui pattern over Radix (`@radix-ui/react-label`, `@radix-ui/react-slot`), `vaul` (drawers), `lucide-react` (icons) |
| Lint | ESLint 9 with `typescript-eslint`, `react-hooks`, `react-refresh` |

There is no client-side store library: server state is TanStack Query, and
the selected collection is in the URL. A store is a candidate for the
browser-local demo overlay (see the plan's open questions).

**Backend (`dlams-fastapi`)**

| Concern | Library |
| --- | --- |
| Web framework and server | FastAPI (on Starlette), Uvicorn |
| Validation and schemas | Pydantic 2 |
| ORM | SQLAlchemy 2 |
| Migrations | Alembic |
| Database driver | `psycopg2-binary` (PostgreSQL) |
| Passwords | `passlib` with `bcrypt` |
| Tokens | `python-jose` (HS256 JWT; pulls in `ecdsa`, `rsa`) |
| Config | `python-dotenv` |
| Tests | standard-library `unittest` |

Runtime images: API on `python:3.13-bookworm`, UI built on `node:20-alpine`
and served by `nginx:alpine`, database `postgres:15` (development uses 14).

## Request flow

- **Same-origin API.** The browser calls `/api/...` on the same host that
  served the UI. Nginx (in production) and the Vite dev proxy (in
  development) strip the `/api` prefix before forwarding to FastAPI, so the
  API never sees `/api`. CORS is not enabled.
- **UI client.** `dlams-ui/src/lib/api/client.ts` wraps `fetch` with
  `credentials: "include"` and throws `ApiError` (message from the API's
  `detail`). One module per resource in `lib/api/` builds on it.
- **Server state.** All server data goes through TanStack Query v5
  (`lib/queryClient.ts`: 30 s stale time, no retries). Components use
  per-feature hooks (`useCollections`, `useVideoGamesCollection`,
  `useAdminUsers`, ...). After a write, queries are invalidated rather than
  patched by hand.
- **Routing.** React Router in `App.tsx`: `/` (home), `/login`, `/register`,
  `/admin/users`. `App` first resolves the current user; unauthenticated
  visitors are redirected to `/login`, non-admins away from `/admin/users`.
  The selected collection is kept in the URL.

## Authentication and sessions

- Login returns an HTTP-only, `SameSite=Lax` cookie `access_token` holding an
  HS256 JWT (`sub` = username, 30 minute expiry). The `Secure` flag is set by
  the `COOKIE_SECURE` environment variable (true in production).
- `get_current_user` (`app/auth/utils.py`) runs on every protected request:
  it decodes the cookie, then loads the user from the database. A missing or
  deactivated user gets 401, so deactivation takes effect on the next request.
  Login for a deactivated account returns 403 after the password check.
- Passwords are hashed with bcrypt (passlib).
- **Registration is invite-only.** An admin creates an invitation; the raw
  token is shown once, only its SHA-256 hash is stored, it expires after seven
  days, and it is consumed in the same transaction that creates the account.
  New accounts are always role `user`. The invite link carries the token in
  the URL fragment (`/register#invite=...`).
- The first admin is created by an operator command run inside the API
  environment (`python -m app.auth.bootstrap_admin`).

## Authorization model

Two independent layers:

1. **Global role** on the user: `user` or `admin`. `admin` can issue
   invitations and activate or deactivate users (`require_admin`). Admin
   confers **no** access to other users' collections.
2. **Per-collection access**, resolved in `app/collections/permissions.py`:

   | Access | How it arises | Reads | Persistent writes |
   | --- | --- | --- | --- |
   | `owner` | `collections.owner_id` is the user | yes | yes |
   | `edit` | grant with mode `edit` | yes | yes |
   | `view-only` | grant with mode `view-only` | yes | no (403) |
   | `demo` | grant with mode `demo` | yes | no (403); browser-local edits planned |

   Two FastAPI dependencies implement this: `get_readable_collection` and
   `get_writable_collection`. A user with no access gets 404, not 403, so
   collection ids are not discoverable. The UI mirrors write access through
   `lib/permissions.ts` (`canWriteCollection`).

## Data model

```
users ─┬─< collections ─┬─< collection_grants >── users
       │                └─< console_labels ─┬─< consoles
       └─< registration_invitations         └─< games
```

| Table | Notes |
| --- | --- |
| `users` | `username` (unique), bcrypt `hashed_password`, optional unique `email`, `role` (`user`/`admin`, check constraint), `is_active`, `created_at`. |
| `registration_invitations` | `token_hash` (unique), `created_by_id` (RESTRICT), `expires_at`, `redeemed_at`. |
| `collections` | `owner_id` (CASCADE), `name`, `type` (check constraint; only `video_game`). |
| `collection_grants` | One row per (collection, user), unique; `mode` is `edit`, `view-only`, or `demo`. Cascades from both collection and user. |
| `console_labels` | Collection-scoped platform names, unique per collection. Shared by consoles and games. |
| `consoles` | One physical console: label, `edition`, `condition`. |
| `games` | One owned game: `name`, label, `condition`, `last_played`, `completed`. |

- `condition` is one of `Loose`, `CIB`, `New`, `Item & Box`.
- Consoles and games reference a label with `RESTRICT`, which is why deleting
  a user with data is not yet supported (see decisions).
- Models are in `dlams-fastapi/app/models/`, one module per domain
  (`user.py`, `collection.py`, `video_games.py`), re-exported from
  `models/__init__.py`.

## API surface

All routes are served at the API root (the `/api` prefix is added only by
the edge).

| Area | Routes | Access |
| --- | --- | --- |
| Auth | `POST /register`, `POST /login`, `POST /logout`, `GET /verify` | public / signed-in |
| Invitations | `POST /invitations` | admin |
| Admin users | `GET /admin/users`, `POST /admin/users/{id}/deactivate`, `POST /admin/users/{id}/activate` | admin; no self-deactivation |
| Collections | `POST /collections`, `GET /collections`, `GET /collections/{id}` | signed-in; list includes owned and granted |
| Grants | `GET`, `POST`, `PUT`, `DELETE` under `/collections/{id}/grants` | collection owner |
| Video games | `/collections/{id}/consoles`, `/console-labels`, `/games` (list, create, update, delete) | read: any access; write: owner or `edit` |
| Stats | `GET /collections/video-game-stats` | signed-in; owned and granted collections |

Handlers are grouped by module: `app/auth/` (`routes.py`, `admin_routes.py`,
`utils.py`, `bootstrap_admin.py`) and `app/collections/` (`routes.py`,
`video_games_routes.py`, `permissions.py`, schemas). Routers are registered
in `app/main.py`.

## Collection types

A collection has a `type`, and everything type-specific hangs off it.

- **Backend:** type-specific routes and models live beside the generic
  collection code (`video_games_*`). The type is constrained in the database.
- **Frontend:** `collectionWorkspaceResolver.ts` maps a collection type to its
  workspace component through a typed registry. Adding a type means adding
  its workspace and stats renderer there; the compiler flags a missing entry.
- Only `video_game` exists. The shared-fields and inheritance strategy for
  further types is an open question in the plan.

## Frontend layout

```
dlams-ui/src/
  App.tsx, main.tsx          routing, providers
  pages/                     Home, Login, Register, AdminUsers
  components/
    AppSidebar.tsx           collections, invite drawer, admin link, logout
    auth/                    login/register forms, invite drawer, auth hooks
    admin/                   user management table and hook
    collections/             navigation, workspace dispatch, stats
    video-games/             console and game managers, workspace, hooks
    ui/                      shadcn/ui primitives (button, drawer, form, ...)
  lib/api/                   fetch client and one module per resource
  lib/                       queryClient, permissions, utils
  schemas/, types/           zod schemas and shared TypeScript types
```

Forms open in right-side drawers; the sidebar lists collections with counts.
Styling is Tailwind with shadcn/ui; the owner's styling pass has not started
(see the conventions file for the rule).

## Environments and deployment

| Mode | Where it runs | Notes |
| --- | --- | --- |
| Production | Docker Compose on one host: `db`, `api`, `ui`, `nginx` | `dlams-deployment/docker-compose.yml`. `SECRET_KEY` is required from an untracked `.env`. |
| Development stack | `dlams-deployment/docker-compose.dev.yml` | Own project name and database volume, separate from production. `make dev` / `make watch` from the repo root. |
| Hybrid | API in Docker, UI on the host | `npm run dev:hybrid`. |
| Host-only | UI and API on the host | See the deployment README. |

- **Migrations run on API start.** The API image's command is
  `alembic upgrade head && uvicorn app.main:app`. Deploying a new migration
  therefore changes the production schema on the next API start.
- **Where production runs.** A single Raspberry Pi, with every service in
  Docker Compose. There is no staging environment and no automated database
  backup.
- **Deploy.** A GitHub Actions runner is installed on the Pi itself
  (self-hosted, so the Pi polls GitHub for jobs and nothing connects in to
  it). A push to `main` triggers `.github/workflows/deploy.yml`, which runs
  on that runner: `git pull` in the checkout, `docker compose up -d --build
  api ui nginx`, reload nginx, and list containers. The `db` service is not
  rebuilt. Images are built on the Pi, so builds are slow and CI does not
  run tests or lint before deploying.
- **Nginx** routes `/` to the `ui` container and `/api/` to the `api`
  container (prefix stripped).

## Configuration

| Variable | Used by | Purpose |
| --- | --- | --- |
| `SECRET_KEY` | API | JWT signing; the API refuses to start without it. |
| `DATABASE_URL` | API, Alembic | PostgreSQL connection string. |
| `COOKIE_SECURE` | API | `true` in production so the cookie is `Secure`. |
| `POSTGRES_*` | Compose `db` | Database credentials for the production stack. |
| `VITE_API_URL` | UI build | API base path (the same-origin `/api` proxy). |
| `API_PROXY_TARGET` | Vite dev server | Where the dev proxy forwards `/api`. |

## Testing

- **API:** `unittest` under `dlams-fastapi/tests/`, covering auth,
  invitations, deactivation, collection permissions and types, and video-game
  routes. Run with `make test` (needs a local `dlams-fastapi/.venv`).
- **UI:** no test framework yet; light integration testing is planned.
  `npm run lint` and `npm run build` are the current checks.

## Where to look first

| To change... | Start in |
| --- | --- |
| Who can do what to a collection | `app/collections/permissions.py` |
| A video-game endpoint | `app/collections/video_games_routes.py` |
| The schema | `app/models/` plus a new file in `alembic/versions/` |
| A server-data hook | `dlams-ui/src/components/<feature>/use*.ts` and `lib/api/` |
| What a collection type renders | `components/collections/collectionWorkspaceResolver.ts` |
| Dev or deploy wiring | `dlams-deployment/`, root `Makefile`, `.github/workflows/deploy.yml` |
