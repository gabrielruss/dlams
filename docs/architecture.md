# DLAMS architecture

Last updated: 2026-10-31

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
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`), `tw-animate-css`, `tailwind-merge`, `clsx`, `class-variance-authority`, `cn` |
| Components | shadcn/ui pattern over Radix (`@radix-ui/react-label`, `@radix-ui/react-slot`, and the `radix-ui` umbrella package that newer generated components import) and Base UI (`@base-ui/react`, used by the Combobox), `vaul` (drawers), `lucide-react` (icons) |
| Lint | ESLint 9 with `typescript-eslint`, `react-hooks`, `react-refresh` (its export rule is off under `src/components/ui/`, where the shadcn CLI writes files) |

There is no client-side store library: server state is TanStack Query, and
the selected collection is in the URL.

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
| Lint and format | Ruff (dev only, `requirements-dev.txt`; config in `pyproject.toml`) |

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
- **Routing.** React Router in `App.tsx`: `/s/:token` (a share link's
  read-only page, `pages/SharedCollection.tsx`) is matched first and never
  checks a session. Everything else goes through `SessionRoutes`: `/` (home),
  `/login`, `/register`, `/admin/users`; it first resolves the current user;
  unauthenticated visitors are redirected to `/login`, non-admins away from
  `/admin/users`.
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
- **Demo sessions.** `POST /demo-sessions` (no sign-in) copies the `template`
  template account into a new `sandbox` account and sets its session cookie.
  The visitor's session lasts 30 minutes and nobody can sign back in, but
  the account stays for 7 days so its share links keep working; the next
  demo request after that deletes it. At most 10 exist: when a new demo
  needs a slot, the oldest sandbox past its session is deleted, one without
  share links first; if every sandbox is mid-session, the demo is busy
  (`app/auth/sandbox.py`). Signing out does not delete a sandbox.

## Authorization model

Two independent layers:

1. **Global role** on the user: `user`, `admin`, `template`, or `sandbox`. `admin` can
   issue invitations, activate or deactivate users, and switch an account
   between `user` and `template` (`require_admin`). Admin confers **no** access
   to other users' collections. A `template` account is an ordinary account
   that demo sessions copy; only its owner signs into it. A test fails if a
   write route does not depend on `get_current_user` (only `/register`,
   `/login`, `/logout`, and `/demo-sessions` are exempt). `sandbox` accounts
   write normally to what they
   own, within 3 collections and 30 consoles and games, and are refused on
   every sharing route.
2. **Per-collection access**, resolved in `app/collections/permissions.py`:

   | Access | How it arises | Reads | Persistent writes |
   | --- | --- | --- | --- |
   | `owner` | `collections.owner_id` is the user | yes | yes |
   | `view-only` | a row in `collection_grants` for the user | yes | no (403) |

   All sharing is read-only: only the owner ever writes.

   FastAPI dependencies in `permissions.py` implement this, and routes
   declare them in their signature through `Annotated` aliases.
   `get_collection_with_access` (`CollectionWithAccess`) loads the
   collection and the user's access; `get_readable_collection`
   (`ReadableCollection`) and `get_writable_collection`
   (`WritableCollection`, owner only; a grant reader gets 403) build on it.
   `get_owned_collection` (`OwnedCollection`) is owner only and answers
   everyone else with 404; the grant and link routes use it. A user with no
   access gets 404, not 403, so collection ids are not discoverable.
   `DbSession` and `CurrentUser` are the aliases for the database session and
   the signed-in user. The UI mirrors write access through
   `lib/permissions.ts` (`canWriteCollection`, `isAdmin`); admin checks go
   through `isAdmin` in the UI and `require_admin` in the API, never a raw
   role string.

## Data model

```
users ─┬─< collections ─┬─< collection_grants >── users
       │                ├─< collection_links
       │                ├─< games ──────┐
       │                └─< consoles ───┤
       ├─< console_labels >─────────────┘
       └─< registration_invitations
```

| Table | Notes |
| --- | --- |
| `users` | `username` (unique), bcrypt `hashed_password`, optional unique `email`, `role` (`user`/`admin`/`template`/`sandbox`, check constraint), `is_active`, `created_at`. |
| `registration_invitations` | `token_hash` (unique), `created_by_id` (RESTRICT), `expires_at`, `redeemed_at`. |
| `collections` | `owner_id` (CASCADE), `name`, `type` (check constraint; only `video_game`). |
| `collection_grants` | One row per (collection, user), unique: that user can read the collection. Cascades from both collection and user. |
| `collection_links` | Read-only share links: `collection_id` (cascades), optional `name` (50), unique random `token` (128 bits), `created_at`. At most 5 per collection, enforced by the API. |
| `console_labels` | Platform names owned by a user (`user_id`, CASCADE), reused across that user's collections; unique per user ignoring case. Created from the console or game form; deleted when no console and no game uses them. |
| `consoles` | One physical console: `collection_id` (CASCADE), required `console_label_id`, `edition`, `condition`. |
| `games` | One owned game: `collection_id` (CASCADE), required `console_label_id`, `name`, `condition`, `last_played`, `completed`. |

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
| Auth | `POST /register`, `POST /login`, `POST /logout`, `POST /demo-sessions`, `GET /verify` | public / signed-in |
| Invitations | `POST /invitations` | admin |
| Admin users | `GET /admin/users`, `POST /admin/users/{id}/deactivate`, `POST /admin/users/{id}/activate`, `PUT /admin/users/{id}/role` (`user` or `template`), `PUT /admin/users/{id}/password` | admin; role and deactivate never on yourself or another admin; password on yourself but never another admin; never a sandbox |
| Collections | `POST /collections`, `GET /collections`, `GET /collections/{id}` | signed-in; list includes owned and granted |
| Sharing | `GET`, `POST` (by username), `DELETE` under `/collections/{id}/grants` | collection owner; never a sandbox (no UI yet) |
| Share links | `GET`, `POST` (optional `name`), `DELETE /{link_id}` under `/collections/{id}/links` | collection owner, sandboxes included |
| Shared collection | `GET /shared/{token}`: the collection's name, type, consoles, and games; nothing about the owner. 404 "This link is no longer active." | public (no sign-in) |
| Video games | `/collections/{id}/consoles` and `/games` (list, create, update, delete) | read: owner or shared; write: owner |
| Console labels | `GET /console-labels` (the signed-in user's labels) | signed-in |
| Stats | `GET /collections/video-game-stats` | signed-in; owned and granted collections |
| Items | `GET /items`: every console and game in the user's own collections, one type-neutral shape (`type`, `id`, `collection_id`, `collection_name`, `title`, searched `keywords`, shown-only `details`), sorted by title; one query per item type | signed-in; owned collections only |

Handlers are grouped by module: `app/auth/` (`routes.py`, `admin_routes.py`,
`utils.py`, `bootstrap_admin.py`) and `app/collections/` (`routes.py`,
`video_games_routes.py`, `item_routes.py` with `video_games_items.py`,
`permissions.py`, schemas). Routers are registered
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
  pages/                     Home, Login, Register, AdminUsers,
                             SharedCollection (the /s/:token link page)
  components/
    AppSidebar.tsx           collections, invite drawer, admin link, logout
    auth/                    login/register forms, invite drawer, auth hooks
    admin/                   user management table and hook
    collections/             navigation, workspace dispatch, stats, the Share
                             drawer, ListRow (the item row any type uses)
    video-games/             console and game managers, workspace, hooks
    ui/                      shadcn/ui primitives (button, drawer, form, ...)
  lib/api/                   fetch client and one module per resource
  lib/                       queryClient, permissions, utils
  schemas/, types/           zod schemas and shared TypeScript types
  test/                      test setup, MSW server, renderApp, axe helper
```

Tests (`*.test.tsx`) sit beside the feature they cover.

Forms open in right-side drawers; the sidebar lists collections with counts
and marks the selected one with a red bar. Its header is a fitted
`D.L.A.M.S.` wordmark (`components/Wordmark.tsx`, built on
`components/FitText.tsx`). Below the `md` breakpoint the sidebar becomes a top
bar with a menu button that opens the same contents in a left drawer
(`components/AppSidebar.tsx`). The login page draws a decorative "DON'T LOOK
AT MY STUFF" logo (`components/BrandLogo.tsx`): behind the card on wide screens
and above it on phones. Both fitted components share the
`components/useFitOnResize.ts` hook; the
app font is Fira Code and brand colors `teal` and `red` are theme tokens in
`index.css` (`red` marks the selected collection and the logo D; `teal` is
unused). The access badge on each sidebar row is a black pill with white text.
Styling is Tailwind with shadcn/ui; the owner's styling pass is complete, so
styling changes need approval (see the conventions file for the rule).

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
  Docker Compose. There is no staging environment. A nightly database backup runs
  on the host (see the deployment README).
- **Deploy.** A GitHub Actions runner is installed on the Pi itself
  (self-hosted, so the Pi polls GitHub for jobs and nothing connects in to
  it). A push to `main` triggers `.github/workflows/deploy.yml`, which runs
  on that runner: `git pull` in the checkout, `docker compose up -d --build
  api ui nginx`, recreate the `nginx` container (it mounts `nginx.conf` as
  a single file, which a reload would not re-read after `git pull`), and
  list containers. The `db` service is not
  rebuilt. Images are built on the Pi, so builds are slow and CI does not
  run tests or lint before deploying.
- **Nginx** routes `/` to the `ui` container and `/api/` to the `api`
  container (prefix stripped). Share links: `/api/shared/` (and `/shared/` on
  the API host) are rate-limited to 30 requests a minute per address (burst
  10, then 429); those routes and the `/s/` pages send
  `X-Robots-Tag: noindex` and `Referrer-Policy: no-referrer`. Responses over
  1 KB of HTML, JSON, JS, CSS, and SVG are gzip-compressed.

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
- **UI:** Vitest with jsdom, React Testing Library, `user-event`, and MSW
  (`npm test`). The config is the `test` block in `vite.config.ts`; shared
  setup is in `dlams-ui/src/test/` (`setup.ts`, `server.ts`, `renderApp.tsx`).
  Tests render the real app and fake only the network. `npm run lint` and
  `npm run build` (which type-checks) are the other checks. Playwright
  end-to-end checks are planned. See the reference in the conventions file
  ("Testing").

## Where to look first

| To change... | Start in |
| --- | --- |
| Who can do what to a collection | `app/collections/permissions.py` |
| A video-game endpoint | `app/collections/video_games_routes.py` |
| The schema | `app/models/` plus a new file in `alembic/versions/` |
| A server-data hook | `dlams-ui/src/components/<feature>/use*.ts` and `lib/api/` |
| What a collection type renders | `components/collections/collectionWorkspaceResolver.ts` |
| Dev or deploy wiring | `dlams-deployment/`, root `Makefile`, `.github/workflows/deploy.yml` |
