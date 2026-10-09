# DLAMS Project Plan and Working Record

Last updated: 2026-10-09

## Purpose

This is the durable, workspace-wide record of the DLAMS project. It exists to
preserve project context across contributors, chat sessions, and restarts. Keep
it concise enough to scan, but complete enough that work can continue without
relying on chat history.

## Instructions for every session

Before making a substantive change or recommendation:

1. Read this document and the relevant project documentation and code.
2. Check whether the current task changes the recorded status, architecture,
   assumptions, priorities, or known issues.
3. Make the requested code or configuration change; do not treat this document
   as a substitute for doing the work.

Before finishing substantive work, update this document in the same change:

- **Code or configuration contributions:** record what changed, where, and the
  verification performed and its result. Include incomplete work and blockers.
- **Architectural or product decisions:** record the decision, date, rationale,
  and important alternatives or consequences. Distinguish accepted decisions
  from proposals and open questions.
- **Troubleshooting:** record the observed problem, relevant diagnosis, what
  worked, what did not work, and the resulting status or follow-up.
- **Project status:** update the roadmap and known issues when their state
  changes. Do not leave completed, superseded, or blocked work presented as
  current.
- **Manual learning checks:** When a contribution adds user-visible or
  operator-testable behavior, tell the owner how to try it manually and what
  result to expect. Keep steps safe for local development and clearly note
  when a feature is not yet ready to test.
- **Keep planning moving:** End planning/explanation replies with the next
  concrete step or decision, even when the owner does not explicitly ask for
  it. Keep it brief and focused on one item.

Keep entries factual and concise. Do not infer decisions from implementation
details, claim tests passed unless they were run, or erase useful history when
updating status. Add new dated entries to the appropriate section. Never put
credentials, tokens, personal data, or other secrets in this file.

## Project overview

DLAMS is a single monorepo (`dlams`, consolidated 2026-10-09 from the former
`dlams-ui`, `dlams-fastapi`, and `dlams-deployment` repositories) containing:

- `dlams-ui` — React, TypeScript, and Vite frontend.
- `dlams-fastapi` — FastAPI backend and authentication logic.
- `dlams-deployment` — Docker Compose and deployment/infrastructure config.

The workspace [README.md](./README.md) is a navigation page. Dependency
versions are maintained in each project's manifests and should be verified
there when relevant.

## Current status

- **Phase:** First video-games API, collection/video-games UI, TanStack Query
  adoption, and invite-only account registration are implemented in source.
  Production rollout and live auth verification remain pending.
- **Current product baseline:** The signed-in UI has a left sidebar with
  collection selection/creation as selectable rows with game/console counts,
  console CRUD, and game CRUD. Collection grant management and browser-local
  demo editing are not implemented. Forms use right-side drawers.
- **Product direction:** Users own multiple collections. The main account is
  the app-wide admin and will own a private collection plus a separate demo
  collection. Collection links use `edit`, `view-only`, or `demo` modes.
  Video games are the first item type.
- **Current implementation:** FastAPI has console inventory and game CRUD
  routes, collection-scoped console labels, permission checks, and a
  video-game migration. Account registration now requires an admin-issued
  single-use invitation; first-admin bootstrap is an operator-run command.
  The owner confirmed earlier migrations and API walkthrough against the
  local development database; production migration status is unverified.
  The UI uses TanStack Query for authentication, collections,
  consoles, games, and video-game collection stats; the selected collection ID
  is URL-backed. Owners and `edit` grantees can persist console/game changes.
  Demo access remains read-only in the UI; browser-local editing is not
  implemented.
- **Inspection scope:** Source and configuration in `dlams-ui`,
  `dlams-fastapi`, and `dlams-deployment` were inspected on 2026-10-02. This
  was not a runtime deployment check.

## Start here

### Setup baseline: source/config review and isolated runtime smoke test

The following documentation review began on 2026-10-02. Setup guidance has
since been compared with source/configuration and the local workflows
runtime-tested where possible. Keep production limitations explicit and do
not describe production behavior as verified without a deployment test:

1. **Workspace README — updated:** Replaced the dated dependency/status
   assessment with a workspace landing page that directs developers to the
   deployment README for startup and to this plan for project context.
2. **UI README — updated:** Removed the unsupported React Query claim and
   made the deployment README the canonical source for development startup.
3. **FastAPI README — updated:** Centralized application startup in the
   deployment README while retaining API virtualenv and migration guidance.
   The older `docker-compose.local.yml` still references a missing Nginx
   config and is documented as a legacy, non-recommended workflow.
4. **Deployment README — updated:** Separates working local development from
   production deployment, removes the inaccurate localhost access claim, and
   documents the named HTTPS hosts/certificate prerequisites and known
   production route mismatch. Production startup remains unverified here.
5. **Copilot instructions:** Still needs its template descriptions and
   unchecked setup items checked against the current workspace structure.
6. **READMEs simplified:** Rewrote the workspace, UI, API, and deployment
   READMEs in short, junior-friendly wording. The deployment README is the
   single place for local startup commands.

**Baseline checks completed 2026-10-03:** Frontend `npm run build` passes.
Frontend `npm run lint` fails on two `react-refresh/only-export-components`
errors in `src/components/ui/button.tsx` and `src/components/ui/form.tsx`.
The main and local Compose files pass `docker compose config --quiet`
(the main file warns that its `version` attribute is obsolete). These config
checks do not establish that the services start or work together. The API's
virtual environment was initially unusable because its uvicorn launcher
referenced a missing Python interpreter; it was recreated later in this task.

**Initial Docker inspection on 2026-10-03:** Docker became responsive, but the
documented local endpoints on ports 5173, 8000, and 8080 did not respond. The
containers visible then were from sibling checkouts at
`/Users/gabrielruss/Code/dlams-ui` and `/Users/gabrielruss/Code/dlams-fastapi`,
not this workspace's source folders. Those old UI/API containers are
restarting; the old API logs contain Alembic `No 'script_location' key found`
errors. Their PostgreSQL container is up and occupies host port 5432. They
were not recreated or stopped, and their behavior is not evidence of the
current workspace checkout. The production TLS files are also absent, so the
production Compose stack was not launched.

**Isolated current-checkout smoke test completed 2026-10-03:** Started this
workspace's API and UI using unique Compose project names and a fresh,
isolated PostgreSQL volume. The API's migrations ran and registration, login,
cookie verification, and the protected endpoint all returned HTTP 200. API
docs and OpenAPI returned HTTP 200; unauthenticated `/verify` returned 401 as
expected. The UI served its login page successfully.

The UI container's `npm install` also reported 26 dependency audit findings
(1 critical, 21 high, 3 moderate, 1 low). This was install output, not a
review of exploitability or a completed remediation assessment.

The initial browser login from the UI failed when it called the API directly
across origins; the browser blocked it for missing CORS headers. The API
returned 404 for `/api/verify` while its registered `/verify` route returned
401 without a cookie and 200 with the test login cookie. The production
Nginx/TLS path itself was not runtime-tested. These observations led to the
local Vite proxy workflow documented below; the production routing mismatch
remains unresolved.

The API process logged an initial database connection refusal while
PostgreSQL was starting, then recovered, applied both migrations, and served
requests.

All smoke-test containers and the isolated database volume were removed. The
other sibling-checkout containers and their database were left untouched.
No production Compose or Nginx files were changed.

**Development workflows added and verified 2026-10-03:** Established two
development-only modes, separate from the production Compose project:

1. **UI and API on macOS:** Start only the `db` service from
   `dlams-deployment/docker-compose.dev.yml` under project `dlams-dev`. It uses
   a separate PostgreSQL volume and localhost port 5433. Run FastAPI on the
   Mac at port 8000 and Vite with `npm run dev:local` at port 5173.
2. **UI and API in Docker:** Run
   `docker compose -p dlams-dev -f docker-compose.dev.yml up --build`. This
   starts the UI dev server, API, and same isolated database at localhost
   ports 5174, 8001, and 5433. No Nginx or production certificates are used.

Both Vite modes proxy `/api/...` to the API and strip `/api` before forwarding,
so browser requests are same-origin and match existing FastAPI routes. The
Mac-hosted API/UI workflow was exercised end-to-end with a throwaway account
and temporary database; browser login reached the signed-in page. The full
Docker UI/API/database workflow was also exercised end-to-end and reached the
signed-in page. Both temporary databases were removed afterward.

The API's broken ignored `.venv` was recreated using Python 3.12.7 and pinned
requirements installed. `npm run build`, Compose config validation, and
dependency installation passed. Lint still reports the two earlier
Fast-Refresh export errors. `npm ci` reported 25 dependency audit findings
(1 critical, 21 high, 2 moderate, 1 low); they have not been assessed.

The earlier local CORS failure is resolved for these supported Vite workflows
by proxying requests, not by enabling broad API CORS. Production remains
unverified and still has a checked-in `/api` path mismatch. The existing
`dlams-fastapi/docker-compose.local.yml` and production
`dlams-deployment/docker-compose.yml` were not changed. Existing sibling
containers/database were restored/left running; only isolated test resources
were removed.

**Next:** Review the reported UI dependency audit findings and verify the
remaining workspace and production-deployment documentation. Test production
UI/API proxy routing later in a certificate-equipped environment, without
using the production stack for local development.

**Local API Compose Nginx mount issue (2026-10-03):** Running the documented
FastAPI local Compose command started the `db` and `app` services, but the
`nginx` service could not start because its bind mount expects
`./nginx.local.conf` to be a file and that path is absent. Docker created an
empty directory at the host path, resulting in a directory-to-file mount
error. The API remained up at host port 8000 and PostgreSQL at 5432; the Nginx
container remained in Created state. To run/test the API without the optional
proxy, start only `db` and `app`. To use the Nginx service, replace the
generated empty directory with a valid Nginx configuration file. The UI local
Compose file has the same missing-config pattern for its Nginx service.

## Raspberry Pi cutover (monorepo migration)

### Pi state observed 2026-10-09 (owner-pasted `ls`/`docker` output)

- Three sibling clones in `~/dlams/`: `dlams-deployment`, `dlams-fastapi`,
  `dlams-ui`, each tracking its old repo.
- Three self-hosted runners, one per old repo: `~/actions-runner-api`,
  `~/actions-runner-deployment`, `~/actions-runner-ui`.
- Production containers (fixed names): `dlams-db` (postgres:15, up 3 months),
  `dlams-api`, `dlams-ui`, `dlams-nginx`. Production volumes:
  `dlams-deployment_postgres_data`, `_ui_build`, `_api_static`.
- Unrelated or legacy: `homeassistant` (not DLAMS; do not touch),
  `dlams-ui-ui-1` (legacy `dlams-ui/docker-compose.local.yml` container),
  volume `dlams-fastapi_postgres_data` (legacy local compose; contents
  unchecked), and a stopped `hello-world`.
- **`~/dlams/dlams-deployment/.env` does not exist.** Production therefore
  uses the Compose defaults (`dlams_user` / `dlams_password` / `dlams_db`),
  which are public in the repo. The DB is not published on a host port.
  The leaked `dlams-fastapi/.env` DB values belong to the legacy local
  database, not production; its leaked `SECRET_KEY` is what production signs
  JWTs with (read from the `.env` baked into the API image).
- **Confirmed 2026-10-09:** the Pi's `dlams-deployment` checkout is at
  `85c48b8` ("nginx trouble", Oct 2025) and is 5 commits behind origin. The old
  `api`/`ui` workflows pull only their own repo, so production Nginx and
  Compose are running pre-fix configuration, including no `/api/` prefix
  stripping. The API and UI containers were rebuilt recently (about 28 minutes
  before the inspection) from their own, newer checkouts. Whether production
  login currently works was not tested.

### Runbook (not yet executed)

Do not put `POSTGRES_*` values in a new `.env` without first changing the
role password inside Postgres: the existing volume keeps its original
password, so a mismatched `.env` leaves the API unable to connect.

1. Push the monorepo to a new empty `gabrielruss/dlams` repo.
2. On the Pi, stop and unregister the three old runners (their repos will be
   archived); keep one runner directory to re-register.
3. `mv ~/dlams ~/dlams-old`, then `git clone` the new repo to `~/dlams`.
   Keep `dlams-deployment` as the folder name so the Compose project name,
   containers, and volumes are unchanged.
4. Create `~/dlams/dlams-deployment/.env` containing only a fresh
   `SECRET_KEY` (`openssl rand -hex 32`). Leave `POSTGRES_*` unset for now so
   the defaults keep matching the existing database. Expect all sessions to be
   invalidated.
5. From `~/dlams/dlams-deployment`, run
   `docker compose up -d --build api ui nginx` manually and verify login
   through the real hostname before relying on the workflow.
6. Register the kept runner to `gabrielruss/dlams` with the `deploy-pi`
   label and install it as a service; then a push to `main` should deploy.
7. Separately: change the DB role password with `ALTER USER`, then set
   `POSTGRES_PASSWORD` in `.env`. Review the legacy container/volume before
   deleting anything. Make private or delete the old public repos.

## Product direction captured during planning

The following product behaviors were clarified on 2026-10-02:

- The primary purpose is a private collection of varied items for one
  manually provisioned admin. The admin's identity and private collection are
  not exposed to demo visitors.
- The app will also provide a shared demo experience for showcasing the app.
  The login page should have a "Login as demo user" control that pre-fills
  public demo credentials; the visitor then submits the normal login form.
- Demo visitors see an admin-curated, shared demo game catalog. As admin, the
  owner can persistently manage that catalog separately from their private
  collection.
- Demo visitors can add, edit, and remove games in their own browser-local
  demo copy. Those changes should survive refresh in that browser and have a
  reset action that discards local changes and restores the current shared
  demo catalog.
- Demo credentials are public by design and must never confer write
  privileges. Only the server-verified admin identity may make persistent
  database changes. Public visitors must not be able to register accounts
  that write to the database.
- The first example domain feature is a game list. Initial candidate fields:
  game name, console, purchase date, played (yes/no), and completed (yes/no).
  Detailed validation and field behavior remain open.
- The long-term domain must support multiple kinds of collection items, not
  just video games. Examples include board games, books, and shoes. Item types
  should share appropriate common item/collection data while supporting their
  own metadata and lifecycle fields (for example, a book's read state or a
  shoe's last-worn date).
- An extensible backend model is a product requirement. A shared base item
  with specialized types is one candidate, but the database/ORM inheritance
  strategy and the best domain name (for example, `Collectible` or
  `CollectionItem`) have not been decided.

These product behaviors do not yet settle the implementation of roles,
collection ownership, demo-data delivery, admin provisioning, local storage,
the extensible item-type model, or the roadmap order.

## Roadmap: current baseline and discovery

Use this section to orient planning. Keep current capabilities separate from
future commitments. Promote a discovery note to the roadmap only after the
intended product behavior, priority, and acceptance criteria are agreed.

### Implemented or enabled in source/configuration

- **UI routes:** `/login`, `/register`, and `/` are declared. The root and
  authentication pages are gated/redirected based on the current user.
  (`dlams-ui/src/App.tsx`)
- **Login and identity check:** The login page validates username/password
  client-side and calls the API. The HTTP-only session cookie remains managed
  by the browser/API; current-user data is held in TanStack Query and is not
  persisted in local storage.
  (`dlams-ui/src/pages/Login.tsx`,
  `dlams-ui/src/components/auth/useAuthQueries.ts`,
  `dlams-ui/src/lib/api/auth.ts`)
- **Signed-in collection workspace:** The home page composes the sidebar and
  collection workspace; the selected collection is identified in the URL and
  resource data is shared through the TanStack Query cache.
  (`dlams-ui/src/pages/Home.tsx`,
  `dlams-ui/src/components/collections/useCollections.ts`)
- **Authentication API:** The API provides `POST /register`, `POST /login`,
  `GET /verify`, and `GET /protected`. Registration checks for a duplicate
  username and stores a hashed password. Login verifies credentials and sets
  a 30-minute JWT in an HTTP-only cookie. Verification and the protected test
  endpoint use that cookie to resolve the user.
  (`dlams-fastapi/app/auth/routes.py`,
  `dlams-fastapi/app/auth/utils.py`)
- **User and collection access model:** Users have a global role constrained
  to `user` or `admin`; new registrations get `user`. Users can own multiple
  named collections of type `video_game` (the only current type), and
  collection owners can grant another user `edit`, `view-only`, or `demo`
  access. Read access is owner or any grant. Persistent collection writes are
  owner or `edit` grant only; global admin has no implicit access to another
  user's collection. `view-only` and `demo` are read-only to the API.
  (`dlams-fastapi/app/models/`,
  `dlams-fastapi/app/collections/`,
  `dlams-fastapi/alembic/versions/`)
- **Video-game catalog UI:** Signed-in users can select or create a typed
  collection and manage console and game records in the UI. The sidebar shows
  per-collection game and console counts from a video-game-specific aggregate
  endpoint. API writes enforce collection ownership or `edit` access;
  browser-local demo editing is not implemented yet.
- **Deployment wiring:** The main Compose configuration defines PostgreSQL,
  API, UI, and Nginx services, with a persistent database volume. The API
  container applies Alembic migrations before starting FastAPI. Nginx serves
  the built UI, is configured to proxy API traffic, and is configured for
  HTTP-to-HTTPS redirects and TLS certificate mounts.
  (`dlams-deployment/docker-compose.yml`,
  `dlams-deployment/nginx.conf`,
  `dlams-fastapi/Dockerfile`,
  `dlams-ui/Dockerfile`)

### Discovery notes — not yet prioritized or committed

- **Invite-only registration implemented in source:** `/register` now requires
  a valid, unused invitation; admins can issue seven-day invitations from the
  signed-in UI. The first admin is created explicitly by running
  `python -m app.auth.bootstrap_admin` inside the API environment. Production
  deployment and live end-to-end verification remain pending.
- Logout is available from the signed-in app sidebar; the API clears the
  HTTP-only authentication cookie, and the UI clears non-auth query data and
  sets the cached current user to unauthenticated.
- Email exists as an optional database/user-response field, but the current
  registration request and form do not collect it.
- Browser-local editing for `demo`-access collections remains unimplemented;
  the UI currently presents those collections as read-only.
- **Production auth proxy mismatch corrected in source, rollout pending:** The
  UI production build uses `/api` as its API base, while FastAPI registers
  routes at `/login`, `/register`, and `/verify` with no `/api` prefix. Nginx
  now strips `/api/` before forwarding. The previous isolated runtime test
  confirmed `/api/verify` returned 404 while `/verify` matched. Production
  proxy behavior still needs live verification after deployment.
  (`dlams-ui/Dockerfile`, `dlams-ui/src/lib/api.ts`,
  `dlams-deployment/nginx.conf`, `dlams-fastapi/app/main.py`)
- **Confirmed local UI/API CORS failure:** In the isolated browser test, the
  UI at `localhost:15173` called the API at `localhost:18000`; the browser
  blocked the login request because the API response had no
  `Access-Control-Allow-Origin` header. The local Compose configuration uses
  separate UI/API ports, and the current FastAPI app does not configure CORS.
  This failure mode is avoided by the supported local workflows added on
  2026-10-03, which route `/api` through Vite's same-origin proxy. Direct
  cross-origin browser calls still require a CORS configuration.
  (`dlams-ui/vite.config.ts`, `dlams-ui/src/lib/api.ts`,
  `dlams-fastapi/app/main.py`)
- **Startup readiness observation:** The API attempted to connect to
  PostgreSQL before it was ready, logging one connection refusal. The
  container recovered and completed migrations. The legacy API Compose setup
  has `depends_on` without a database health check/readiness condition. The
  new development Compose setup waits for PostgreSQL health before starting
  the API. (`dlams-fastapi/docker-compose.local.yml`,
  `dlams-deployment/docker-compose.dev.yml`)
- No test files matching common `test` filename patterns were found in the
  inspected UI/API repositories. This is a filename-based observation, not a
  claim that every form of automated validation is absent.

These source observations are separate from the product direction captured
above. The discovery items below are not additional requirements unless
explicitly promoted into the roadmap.

## Roadmap and open questions

### Roadmap sequence and current progress

The earlier owner-only-write sequence is superseded. Current direction: each
account owns collections; the main account can own a private collection and a
separate demo collection; collection links control access. Global `admin` is
for app-wide user management and grants no implicit collection access. Owners
and `edit` grantees may persist changes; `view-only` and `demo` grantees cannot
write through the API. The demo client will eventually allow browser-local
editing.

1. **Video-games API foundation — implemented and locally confirmed:**
   defined collection-scoped console labels, physical console records, and
   video-game records; added migrations and owner/`edit`-only persistent
   create, update, and delete APIs using shared authorization dependencies.
   Focused tests cover label reuse, game counts, and last-console deletion
   protection. The owner confirmed the API walkthrough against the local
   development database.
2. **Collection/video-games UI — implemented:** supports collection
   creation/selection and console/game CRUD for writable collections. Forms
   open in right-side drawers. TanStack Query v5 is implemented for auth,
   collections, console/game data, and video-game stats; mutations invalidate
   affected resources. Focused ESLint and `npm run build` pass. Full
   `npm run lint` still reports the two existing Fast Refresh export-rule
   errors in shared button/form components. Manual browser interaction testing
   remains pending. Grant management, browser-local demo editing, and
   owner-directed visual iteration remain.
3. **TanStack Query v5 adoption — implemented:** configured one QueryClient,
   typed per-resource key/`queryOptions` definitions, focused query and
   mutation hooks, awaited invalidations, and URL-backed collection selection.
   Removed duplicate auth profile persistence in Zustand/local storage.
   Package manifests and lockfiles were not modified for this task. UI build
   passes with a Vite large-chunk warning; the full lint result is described
   above. No frontend test framework is configured.
4. **Invite-only registration — implemented in source, production rollout
   pending:** Added a persisted, hashed, seven-day single-use invite token,
   admin-only issuance, invite-link registration UI, and a bootstrap command
   for the first admin. Registration rejects absent, invalid, expired, or
   redeemed invites. Production Nginx now strips the `/api` prefix and the
   auth cookie is Secure in production configuration. Focused API tests,
   frontend build, and focused lint pass; deploy and verify on the Pi before
   considering production behavior confirmed.
5. **Complete account workflows:** add admin-only user management; document
   safe provisioning of the demo account/link. Logout is implemented.
6. **Verify deployment integration:** verify owner, invite registration,
   edit-grant, view-only, and demo journeys end to end on the deployed stack.

### Open questions to resolve before implementation

- How should a visitor's browser-local demo overlay behave if the owner
  changes the source demo collection or revokes the demo grant?
- What shared fields belong on every item, and how should category-specific
  metadata and relationships be modeled? Compare schema options before
  selecting an inheritance strategy; choose stable names for categories and
  item types.
- Is browser local storage sufficient for the first demo version, or is a
  larger local dataset expected?
- What application features beyond the first game-list workflow are in scope
  for the private admin app and for the demo?

## Architecture and decisions

### Monorepo consolidation decided 2026-10-09

- Replace the three repositories with one `dlams` repository. Keep the three
  folder names (`dlams-ui`, `dlams-fastapi`, `dlams-deployment`) so Compose
  build contexts, README links, and the Compose project name (and therefore
  the Pi's existing Docker volumes) are unchanged.
- Preserve history by rewriting each repo into its subfolder and merging.
  `dlams-fastapi/.env` (committed since the first commit), all `.DS_Store`
  files, and the per-repo `.github` folders were removed from history. Commit
  hashes therefore differ from the old repos, and commits that only touched
  removed files were dropped (66 old commits became about 50).
- One root deploy workflow replaces the three per-repo workflows. It pulls once
  on the Pi and rebuilds `api`, `ui`, and `nginx` on every push to `main`;
  path-filtered partial rebuilds were not chosen for simplicity.
- Old repositories will be archived by the owner after the new one works.
  No archive notice or redirect documentation is needed (single-owner project).
- `SECRET_KEY` previously reached production only through the committed
  `.env` baked into the API image. Production Compose now requires
  `SECRET_KEY` from `dlams-deployment/.env` (untracked, on the Pi).

### Coding and UI structure preferences recorded 2026-10-06

- The workspace-level [.github/copilot-instructions.md](./.github/copilot-instructions.md)
  is the active coding guidance. Prefer feature/domain-focused files, separate
  API modules by resource, and keep `Home` structural rather than placing
  collection fetching, selection, and CRUD workflows there.
- Backend guidance now separately covers Python/FastAPI/Pydantic,
  SQLAlchemy 2.0, authorization, transactions, migrations, and tests. Ruff
  and pytest are standards for adoption but are not currently configured in
  the API project.
- Verified UI and backend test/build commands and the local development
  Compose command are recorded in the instructions. Grant semantics now match
  the implemented owner, `edit`, `view-only`, and `demo` model.
- The owner plans to customize the initial UI styles. After that styling pass,
  ask before modifying CSS or other styling choices, including utility
  classes, component styling, and design tokens.
- The owner prefers collection and item create/edit forms to open in a
  right-side drawer so the underlying list stays visually tidy and in context.
- Each collection has a type. The initial supported type is `video_game`;
  current and newly created collections use that type. Collection-specific UI
  should dispatch based on type so future content workflows do not render as
  video-game data by default.
- The owner prefers nontrivial component workflows, such as data loading and
  state management, to live in focused custom hooks so components remain easy
  to read.
- At most one modal drawer should be open across the site at a time. Keep
  visibility state local to each feature for now; a shared Zustand store is not
  needed solely to enforce this UX rule. Revisit centralized coordination if
  future requirements need it.
- Use React Hook Form for submitted data-entry forms, including simple
  collection and item forms; standalone controls need not use it.
- Keep shared authorization/permission rules in reusable helpers rather than
  duplicating access checks across feature components.
- Avoid `void` when it only suppresses a promise without a concrete benefit,
  such as a configured lint requirement or a meaningful fire-and-forget
  boundary.

Record decisions here after they are made. Include the date, decision, context
or rationale, and any consequences. Keep proposals and unresolved questions
under the roadmap section until accepted.

### Account registration and roles decided 2026-10-04

- Keep public account registration available for simplicity; users may create
  accounts through the API.
- Use global account roles `user` and `admin`; registration defaults to
  `user` and rejects client-supplied roles. The owner can assign `admin`
  directly in the database.
- `demo` is a per-collection access mode, not a global account role. It
  provides read access while the client later offers browser-only edits.
- Persistent writes to another user's collection require an explicit `edit`
  grant. Global admin does not bypass collection ownership or grants.

### Collection ownership and access model decided 2026-10-04

- Global roles are `user` and `admin`. The owner's main account is the sole
  global admin for app-wide user management. That role grants no implicit
  access to collections it does not own.
- Any user may own multiple collections and persistently edit their own
  collections.
- The main account will own both a private collection and a separate curated
  demo collection. `demo-user` gets a `demo` grant to the demo collection
  only; no separate `admin-demo` account is needed.
- A user may be granted access to multiple collections; each collection/user
  pair has one mode: `edit`, `view-only`, or `demo`.
- The collection owner manages grants. `edit` allows persistent content
  changes; `view-only` allows reads only; `demo` allows reads and eventually
  browser-local edits, while server-side writes remain denied.
- The first UI may remain simple. A permission dropdown and browser sandbox
  UI are later work; the collection/link model supports the modes now.
- The owner prefers this durable model before collection-item features rather
  than temporary authorization behavior.

### Collectible category and item-type direction clarified 2026-10-05

- A user-owned **collection** is a container (for example, the owner's private
  collection or demo collection); it is separate from the catalog/category
  taxonomy.
- Organize collected records under broad categories such as Video Games,
  Books, Shoes, and Music. Each category can have more specific item types,
  such as video games and video-game consoles under Video Games, and CDs and
  vinyl records under Music.
- Console inventory records represent specific owned devices, with a shared
  console label (for example, `Xbox 360`), an edition/details value (for
  example, `Original white` or `Star Wars edition`), and a condition.
  Multiple devices can share a label but have different editions.
- Game records store/select one console label rather than reference a specific
  owned device. The game dropdown shows each distinct label once, even if
  multiple editions exist, so games can be filtered by label.
- Add a console inventory record before adding a game for that label. The
  console form lets the owner choose an existing label or create a new one.
  The same game title may be entered as separate records for different labels.
- Console labels are scoped to a collection, not shared app-wide. The
  selectable game labels are the distinct labels derived from console records
  in that collection. Deleting one edition does not affect games while
  another console record with that label remains.
- A console may display a derived count of game records using its label; do
  not store or maintain the count independently.
- The initial game fields are `name`, `condition`, one console label,
  optional `last_played` date, and `completed` boolean. New games default to
  `completed = false`. Photos are deferred.
- `completed` defaults to `false` for a new game record.
- `last_played` is optional and can remain blank until the game has been
  played.
- The first collection-item workflow supports adding, editing, and deleting
  both console and game records, subject to collection access permissions.
- Delete a console edition without affecting games if another edition with
  the same label remains. Block deleting the last edition with a label while
  any games still use that label; move or delete those games first.
- Editing an edition updates that inventory record. Games remain associated
  with its label.
- Allow duplicate game and console names within a collection, so separate
  copies or editions can be recorded independently.
- Ask for explicit confirmation before deleting a game record.
- A console inventory record has a console label, edition/details value, and
  condition. Its selectable label is unique within its collection; multiple
  physical console records in that collection may reuse it with different
  editions.
- Game and console condition use a fixed dropdown in the first version with
  four values: `Loose`, `CIB`, `New`, and `Item & Box`. Custom condition
  choices are out of initial scope.
- The hierarchy and game-console relationship are product direction. The
  shared database schema, exact field requirements, and relationship
  cardinality remain open.

### Collection type added 2026-10-08

- Added the `video_game` type to collection records, API request/response
  schemas, and UI types. It is the only supported type for now and is sent
  explicitly when creating a collection; the UI does not offer a meaningless
  one-option selector.
- A database check constraint restricts values to supported types. The
  migration backfills existing collections as `video_game`; UI rendering is
  guarded by type so an unsupported future type is not shown with game
  controls. UI workspace selection uses a typed resolver keyed by collection
  type; adding a supported type requires registering its workspace.

### Validation approach clarified 2026-10-04

- Prefer not to add tests routinely, keeping the project lightweight for its
  single owner.
- Retain focused automated checks when they materially protect important
  behavior, especially authentication, authorization, or persistent data
  boundaries. The role-registration tests are retained because they cover
  privilege escalation and invalid database roles.

### Product behavior clarified 2026-10-02

- The app should support varied collectible items; video games are the first
  type. Collections belong to users; global user administration is distinct
  from collection ownership and sharing.
- Demo visitors may eventually change their browser-local copy, with changes
  surviving refresh and a reset restoring the source collection. Those edits
  must never become database writes in `demo` mode. Owners can assign
  per-collection `edit`, `view-only`, or `demo` grants through the API; a
  management UI and browser sandbox are future work.
- Public demo credentials may be prefilled on the login page. They are not a
  secret or proof of authority; server-side authorization must protect
  persistent writes.
- Public self-service registration may remain enabled for simplicity.
  Account creation does not grant persistent collection-write access.
- Different item types need shared collection-item data plus type-specific
  metadata/lifecycle fields (for example, read state for books and last-worn
  date for shoes). This is a domain requirement, not yet a decision to use
  SQLAlchemy inheritance or a particular relational schema.

The technical design and detailed game rules are still open. See the
workspace [README.md](./README.md) for the existing architecture snapshot.

## Known issues and troubleshooting

For each issue, record the symptom, investigation, attempted approaches and
their outcomes, current resolution or blocker, and follow-up if any. Link to
code or relevant logs using workspace-relative paths when useful; do not copy
secrets or sensitive data into this document.

- **DBeaver development database password (2026-10-04):** Verified the
  container on localhost port 5433 belongs to this workspace's `dlams-dev`
  Compose project. Its environment matches the documented development
  username/database/password, and PostgreSQL accepts those credentials.
  DBeaver should use username `dlams_dev`, database `dlams_dev`, and password
  `dlams_dev`; this is separate from any DLAMS application account password.
  No database values or user records were changed.
- The production API path-prefix mismatch was confirmed by isolated runtime
  tests and is now corrected in the checked-in Nginx config; production
  rollout/live verification remain outstanding. Direct cross-origin local
  calls still require CORS configuration, but supported development workflows
  use the verified same-origin Vite proxy.
- **Initial localhost login network failure (2026-10-03, resolved for the
  documented development workflows):** The UI responded at
  `http://localhost:5173`, but its configured API endpoint
  `http://localhost:8000` does not accept connections. The only visible
  FastAPI container is restarting, publishes no host port, and belongs to the
  sibling checkout at `/Users/gabrielruss/Code/dlams-fastapi`, not this
  workspace's API. This explained the initial browser network failure before
  credential validation. The user later confirmed the account worked against
  the API in Postman. The supported Mac development workflow now starts its
  own API and the browser login succeeds through the Vite proxy; its recent
  logs in the old sibling container showed
  `No 'script_location' key found in configuration`.
- **Local API Compose Nginx mount failure (2026-10-03):** The FastAPI Compose
  `app` and `db` services started successfully, but Nginx's bind mount failed
  because `nginx.local.conf` was absent and now exists as an empty directory,
  not the required config file. API and database remained available; Nginx did
  not start. Run the API without Nginx by targeting only `db` and `app`, or
  provide a valid Nginx config file before starting the proxy.
- **Standalone production-style UI image does not proxy API requests
  (2026-10-03):** The `dlams-ui` production Dockerfile serves the built SPA
  through Nginx on port 3000, but that Nginx only serves static files.
  Browser `POST /api/login` therefore receives 405 and the UI displays its
  generic non-JSON error. The supported Docker development workflow instead
  runs Vite in a container with its API proxy configured to the Compose API
  service; browser login passed in that workflow.
  (`dlams-ui/Dockerfile`, `dlams-ui/Dockerfile.local`,
  `dlams-ui/vite.config.ts`)

- **Leaked secrets in the old public repositories (found 2026-10-09):**
  `dlams-fastapi/.env` (JWT `SECRET_KEY`, database URL and password) was
  committed in the public `dlams-fastapi` repo since its first commit. The
  monorepo history excludes it, but the old repos remain public until
  archived/deleted and the values must be treated as compromised. Follow-up:
  rotate `SECRET_KEY` (invalidates sessions) and, if the Pi database reused
  the leaked password, the database password; then make the old repos private
  or delete them rather than only archiving.

- **Production UI served from a stale volume (found and fixed in source
  2026-10-09, rollout pending):** Production Nginx served the UI from the
  named volume `ui_build`, which Docker fills from the image only when empty,
  so rebuilt UI images never reached users. Confirmed on the Pi: the site
  served `index-DqhyNlt7.js` while the freshly built image contained
  `index-C8_WIgyk.js`. Fix: Nginx now proxies `/` to the UI container's own
  server on port 3000, and the `ui_build` volume was removed from Compose.
  The orphaned Pi volume `dlams-deployment_ui_build` can be deleted after the
  new config is live. **Verified live 2026-10-09:** after the Pi pulled and
  rebuilt, the served asset names matched the image's
  (`index-C8_WIgyk.js`, `index-DkSKe2GN.css`).

## Work log

Append a short dated entry for each substantive contribution. State the
affected area, the outcome, and the verification performed (or why it was not
performed). Link to relevant files where useful.

- **2026-10-02 — Planning record created:** Added this cross-session plan and
  its update protocol. Initial architecture context is linked from the
  workspace README; no new project decisions or roadmap commitments were made.
- **2026-10-02 — Current-state inventory recorded:** Inspected UI pages/routes,
  API routes/models/migrations, and deployment configuration. Documented the
  authentication-focused baseline, a possible API path-prefix mismatch, and
  discovery notes above. This was a source/configuration review only; services
  and automated tests were not run.
- **2026-10-02 — First product direction recorded:** Captured the private
  admin game collection, separately managed shared demo catalog, prefilled
  demo login, and browser-local demo edits with reset. Added an uncommitted
  candidate roadmap sequence and open design questions. No code, runtime
  behavior, or tests were changed or validated in this planning discussion.
- **2026-10-02 — Multi-type collection requirement recorded:** Updated the
  product direction and candidate data-model milestone to cover multiple
  collectible types, with video games first and books/board games/shoes as
  examples. The shared item concept name and inheritance/persistence strategy
  remain open; no implementation decision or code change was made.
- **2026-10-02 — Documentation verification queued:** Added a “Start here”
  task to verify the workspace, UI, API, deployment, and Copilot documentation
  findings against current project sources before editing those documents.
- **2026-10-03 — Setup baseline checked:** Confirmed the UI build passes and
  lint reports two existing Fast Refresh export-rule errors. Compose
  configuration validates, but runtime startup is blocked by the stopped
  Docker daemon; the API virtual environment also points to a missing Python
  executable. The UI's React Query claim was not found in source or manifests,
  while the suspected FastAPI container-name mismatch was not substantiated.
  No application or README changes were made.
- **2026-10-03 — Docker startup inspection continued:** Docker became
  available, but the only running/restarting DLAMS containers belong to old
  sibling checkouts outside this workspace; their local database holds host
  port 5432. Current-checkout local endpoints did not respond, and the
  production TLS certificate files are absent. Left existing containers and
  data untouched; current checkout still needs an isolated runtime setup.
- **2026-10-03 — Isolated runtime smoke test completed:** Launched only this
  workspace's API, temporary PostgreSQL, and UI under isolated Compose project
  names and non-conflicting loopback ports. API migrations and direct
  registration/login/verify/protected requests passed; the UI served its
  login page. Browser login was blocked by missing CORS headers, and
  `/api/verify` returned 404 while `/verify` matched, confirming local CORS
  and API-prefix integration failures. Production Nginx/TLS remained
  untested. UI image dependency installation reported 26 audit findings,
  not yet assessed. Removed the isolated containers and database volume;
  left the sibling-checkout stack untouched.
- **2026-10-03 — Local login network error diagnosed:** Confirmed the user's
  UI is responding on port 5173 while its API target on port 8000 is
  unreachable. The visible API container is restarting from a different
  sibling checkout and publishes no host port. Recorded that the network
  failure precedes password verification; no password was inspected and no
  containers or database were changed.
- **2026-10-03 — Local API Compose mount failure diagnosed:** Verified the
  reported Docker failure affects only the Nginx service: API and PostgreSQL
  are up on ports 8000 and 5432. Compose expects `nginx.local.conf` to be a
  file, but Docker created an empty directory because the file was missing.
  Recorded the API-only startup workaround; no running containers or database
  contents were changed.
- **2026-10-03 — UI Docker login error diagnosed:** The active `dlams-ui`
  container log shows browser `POST /api/login` requests receive 405 from the
  UI's static Nginx server. The UI container has no API proxy; its generic
  fallback handles the non-JSON response. Confirmed API docs remain available
  separately on port 8000. The user subsequently confirmed successful login
  against the API in Postman, ruling out invalid credentials for that API.
  No containers, credentials, or database contents were changed.
- **2026-10-06 — Collection and item forms moved into drawers:** Added a shared
  drawer for collection, console, and game create/edit forms,
  keeping the underlying lists visible. Kept deletion errors visible outside
  the closed drawer and separated list errors from form errors. Updated the
  deployment walkthrough. `npm run build` passes; `npm run lint` still reports
  only the two known Fast Refresh export-rule errors in shared button/form
  components. Interactive browser behavior has not yet been manually tested.
- **2026-10-06 — Frontend stack instructions corrected:** Recorded the
  owner's Vite/Tailwind/shadcn/React Router/React Query/Zustand stack in
  `.github/copilot-instructions.md`. Confirmed existing local shadcn-style UI
  components; React Query remains a selected but not-yet-installed server
  state tool. No package manifests or lockfiles changed.
- **2026-10-06 — Forms migrated to the shadcn Drawer:** After the owner pointed
  out shadcn provides a Drawer component, replaced the initial native-dialog
  implementation using `npx shadcn@latest add drawer`, and migrated all three
  create/edit surfaces to its right-side primitives. The generated component
  requires Vaul. At that time the owner asked that packages be removed while
  retaining code. That dependency status was later superseded: see the
  2026-10-07 verification below. Updated Copilot instructions to ask before
  package installs or running the shadcn CLI for components.
- **2026-10-07 — Video-game collection loading extracted to a hook:** Moved
  collection console/game loading, loading state, and error state from
  `VideoGamesWorkspace` into the feature-scoped `useVideoGamesCollection`
  hook. The component now composes the hook with the collection managers.
  Targeted ESLint and `npm run build` pass.
- **2026-10-07 — Collection workflows extracted to a hook:** Moved collection
  loading, creation, selection, and request state into a feature-scoped
  `useCollections` hook. `CollectionWorkspace` retains only drawer visibility
  and form input state plus composition/rendering.
- **2026-10-07 — Submitted data-entry forms standardized on React Hook Form:**
  Converted collection, console, and game create/edit forms to `useForm` and
  `handleSubmit`, retaining their API error display and validation behavior.
  React Hook Form now manages values and submission state; standalone
  collection selection remains a regular controlled input. Targeted ESLint
  and `npm run build` pass.
- **2026-10-07 — Console manager workflow extracted to a custom hook:** Moved
  React Hook Form setup, create/edit/delete requests, drawer lifecycle, and
  operation errors from `ConsoleManager` into the feature-scoped
  `useConsoleManager` hook. The component keeps the form and list markup.
- **2026-10-07 — Game manager workflow extracted to a custom hook:** Moved
  React Hook Form setup, console-label derivation, create/edit/delete
  requests, drawer lifecycle, and operation errors from `GameManager` into
  the feature-scoped `useGameManager` hook. The component keeps the form and
  game-list markup.
- **2026-10-07 — Collection write permission centralized:** Added a shared
  `canWriteCollection` helper under `src/lib/permissions.ts` and a reusable
  `CollectionAccess` type, then replaced the inline owner/edit access check in
  `VideoGamesWorkspace`. Collection managers continue receiving the derived
  boolean as a prop. This keeps the client permission rule reusable; API
  authorization remains authoritative.
- **2026-10-07 — Unnecessary promise-discard `void` convention recorded:**
  The `loadItems()` effect invocation has no `void` prefix, so no code change
  was needed. Recorded the preference to use `void` only when it provides a
  concrete linting or documentation benefit.
- **2026-10-07 — Video-game condition options centralized:** Moved the
  canonical condition values into `src/types/videoGames.ts` and derive
  `VideoGameCondition` from that readonly list. The UI validation helper now
  imports the shared list instead of duplicating it.
- **2026-10-07 — shadcn Drawer source and consumers verified:** Confirmed
  `src/components/ui/drawer.tsx` is the current shadcn Vaul-based drawer source
  and left it intact. Aligned all three drawer consumers with its Vaul API
  (`direction` and `DrawerClose asChild`). Vaul is present in the UI manifest,
  and targeted ESLint plus `npm run build` pass. Browser interaction testing
  remains pending.
- **2026-10-08 — Collection type added:** Added the `video_game` type to the
  collection database model, API schemas and responses, and UI model. New
  collections explicitly send this type; a migration backfills existing
  rows and the database enforces the supported value. Added API tests and
  updated the local API walkthrough. All 15 API unit tests pass; the new
  migration's upgrade/backfill/constraint/downgrade behavior passes an
  isolated SQLite check; the complete Alembic chain compiles offline for
  PostgreSQL; focused UI ESLint and the production build pass. A full SQLite
  history upgrade is blocked earlier by the existing
  `951a8354c293` migration's PostgreSQL-only `ALTER COLUMN` operation.
- **2026-10-08 — Collection workspace dispatch centralized:** Replaced the
  inline `video_game` condition with a typed resolver from collection type to
  workspace component. The resolver rejects unknown runtime values with the
  existing unsupported-type state, and its exhaustive map requires a workspace
  when another supported type is added. Focused ESLint and the UI production
  build pass.
- **2026-10-08 — Signed-in app sidebar and logout added:** Added a responsive
  left sidebar with a DLAMS text/initial placeholder at the top and the current
  username plus logout action at the bottom. Logout calls a new API endpoint
  that expires the HTTP-only cookie, then clears client auth state; request
  failures stay visible without falsely logging out. Added a focused API
  cookie-clearing test. Validation results recorded after implementation.
- **2026-10-08 — Collection controls moved into sidebar navigation:** Moved
  collection selection and create-collection drawer out of the main workspace
  and into the left sidebar. Hoisted collection loading, selection, and
  creation state to `Home`, keeping the selected collection workspace in the
  main content area. Focused ESLint and the production UI build pass.
- **2026-10-08 — Collection sidebar rows and typed stats added:** Replaced the
  collection selector with separated, selectable collection rows and pinned
  the create action above a scrollable list. Added the authenticated
  `GET /collections/video-game-stats` endpoint, which returns aggregate counts
  only for collections the user owns or has been granted access to. Kept these
  domain-specific counts out of the generic collection schema; the UI refreshes
  stats after collection creation and item changes. Updated the deployment
  walkthrough. All 17 API unit tests, focused UI ESLint, and the UI production
  build pass.
- **2026-10-08 — Collection navigation stats made type-extensible:** Removed
  video-game-specific count fields and loading text from the generic
  `CollectionNavigation` component. It now receives a `renderStats` slot; a
  typed collection-type registry routes video-game collections to their own
  stats summary component. Adding a supported collection type requires
  registering its stats renderer. Focused ESLint and the UI production build
  pass.
- **2026-10-03 — Two isolated local development modes added:** Added Vite
  `/api` proxy configuration with prefix rewriting, `dev:local` and
  `dev:docker` scripts, a separate Docker development Compose stack with
  health-checked PostgreSQL, API, and UI, and setup instructions in the UI,
  API, and deployment READMEs. No production Compose, production Nginx, or
  production Dockerfile was changed.
- **2026-10-03 — Both development modes verified end-to-end:** Recreated the
  ignored API virtual environment using Python 3.12.7 and installed pinned
  requirements. In Mac mode, ran the API on the Mac against a temporary
  isolated database and the UI via Vite; registration and browser login
  reached the signed-in page. In Docker mode, the UI/API/database stack
  started from the new dev Compose file and browser login also reached the
  signed-in page. Removed only temporary validation containers/databases and
  restored the previously running workspace API container. UI production
  build passed; lint continues to report two pre-existing errors. npm install
  in the Docker build reported 25 audit findings not yet assessed.
- **2026-10-03 — README guidance consolidated:** Replaced the stale workspace
  dependency assessment with a navigation landing page; made UI/API READMEs
  point to the deployment README as the single startup guide; and separated
  the local dev commands from production deployment prerequisites. Verified
  production access guidance against checked-in Compose/Nginx configuration
  only; production was not run because the required certificates are absent.
- **2026-10-03 — READMEs simplified:** Rewrote the workspace, UI, API, and
  deployment READMEs with short, plain-language summaries. Kept local run
  commands and the production warning in the deployment README. Verified
  documentation diffs for whitespace; no application code changed.
- **2026-10-04 — DBeaver database login checked:** Confirmed the port-5433
  PostgreSQL service is the workspace development database and accepts its
  configured development credentials. Recorded the distinction between DB
  login and app login; did not change database contents.
- **2026-10-04 — Docker local dev runs detached:** Updated the deployment
  README to start the Docker development stack with `up --build -d`, explain
  that it runs in the background, and document how to follow logs and stop the
  stack without deleting its database volume.
- **2026-10-04 — Docker development database connection documented:** Added
  the DBeaver host, port, database, and local-only credentials to the
  deployment README.
- **2026-10-04 — Shared local database clarified:** Documented that the
  Mac-only and Docker UI/API workflows use the same development PostgreSQL
  service and volume; stopping the Docker UI/API stack preserves the database
  for the Mac-only workflow.
- **2026-10-04 — Account creation control clarified:** The owner confirmed
  that public account registration may remain enabled for simplicity, even
  though visitors could create accounts through the API. This does not grant
  those accounts database-write permissions; persistent-write authorization
  remains a separate design and implementation task.
- **2026-10-04 — Admin authorization gap verified in source:** Confirmed the
  current user model has no admin role and the API has no collection write
  routes yet. Recorded that future persistent writes must require a
  server-enforced admin check; no code or runtime behavior changed.
- **2026-10-04 — Named roles selected:** The owner chose named roles over a
  single admin flag. Public registration remains available, new users default
  to `user`, and only the owner assigns `admin`; future persistent writes must
  be protected by API-side role checks. Recorded the decision only; no code
  changes or tests were performed.
- **2026-10-04 — Admin role assignment method selected:** The owner will assign
  their own account's `admin` role directly in the database using DBeaver,
  rather than adding an HTTP promotion endpoint or private CLI command.
  Implementation remains pending; no database or code changes were made.
- **2026-10-04 — Demo role selected (superseded):** Initially selected a
  distinct global `demo` role; later brainstorming replaced it with a
  per-collection grant mode.
- **2026-10-04 — User roles added:** Added the role column and migration,
  constrained values to `user`, `demo`, and `admin`, and made registration
  reject any supplied role while assigning `user` server-side. Included roles
  in API user responses and the UI user type. Documented how to promote a local
  account in DBeaver. Three API unit tests passed, PostgreSQL migration SQL
  rendered successfully without connecting to a database, and the UI build
  passed. This initial role design was later superseded: the follow-up
  migration removes `demo` from global roles and adds collection grants.
- **2026-10-04 — Collection ownership and access foundation added:** Changed
  global roles to `user`/`admin` and migrated any old `demo` role to `user`.
  Added owned collections, per-collection `edit`/`view-only`/`demo` grants,
  owner-managed grant endpoints, and shared API dependencies that allow reads
  for owners/grantees and persistent writes only for owners/`edit` grantees.
  Global admin has no implicit collection access. Added focused permission
  tests and documented a manual API workflow. Unit tests and UI build passed;
  PostgreSQL migration SQL rendered offline. No live database was changed.
  Collection item endpoints and browser-local demo editing remain future
  work.
- **2026-10-04 — Collection permission foundation validated:** All eight API
  unit tests passed, including owner/edit write access, read-only demo/view
  access, no implicit global-admin collection access, and owner-only grant
  management. Pylance reported no diagnostics in the new collection modules;
  unrelated existing diagnostics remain in auth/Alembic code. UI production
  build passed. PostgreSQL migration SQL generation passed without connecting
  to or changing a live database.
- **2026-10-05 — Collection creation manually verified:** The owner started
  the local Docker setup and confirmed that creating a collection through
  `POST /collections` succeeds.
- **2026-10-05 — Demo collection grant manually verified:** The owner
  confirmed the grant walkthrough worked as expected, including assigning
  `demo` access and viewing the collection as the demo user. Browser-local
  demo editing and collection items are not implemented yet.
- **2026-10-05 — Collectible categories and game-console relationship
  clarified:** The owner described broad collection categories (games, books,
  shoes, music) with category-specific item types (game, console, CD, vinyl).
  The console/game relationship and initial game/console fields were later
  refined on 2026-10-05; see the current category/item decisions below. No
  code or schema was changed.
- **2026-10-05 — Initial game condition choices selected:** Use a fixed
  condition dropdown with `Loose`, `CIB`, `New`, and `Item & Box`. Custom
  condition values are out of scope for the first version. No code or schema
  was changed.
- **2026-10-05 — Additional game and console fields decided:** Game records
  include an optional `last_played` date and a `completed` boolean defaulting
  to false. Console inventory records have a reusable console label,
  edition/details, and condition. Game and console condition use the same
  fixed choices. This refines earlier field notes; no code or schema was
  changed.
- **2026-10-05 — Console game count proposed:** A console may show the count of
  game records associated with it. Treat the count as derived from linked game
  records rather than manually maintained data. No code or schema was changed.
- **2026-10-05 — Game completion default selected:** A new game record defaults
  to `completed = false`; the owner can mark it complete when appropriate. No
  code or schema was changed.
- **2026-10-05 — Console-before-game workflow selected:** A console must be
  added before creating games for it. The game form selects an existing
  console label in the collection; it does not create console inventory inline.
  When adding a console edition, the owner can reuse an existing label or add
  a new label. No code or schema was changed.
- **2026-10-05 — Console record represents physical device:** The owner chose
  to represent each specific physical console they own as its own record, not
  one generic record per platform/model. Duplicate models can have separate
  conditions and linked games. No code or schema was changed.
- **2026-10-05 — Initial item operations selected:** The first console/game
  workflow includes add, edit, and delete operations. Operations remain
  subject to the collection owner/grant permission model. No code or schema
  was changed.
- **2026-10-05 — Console deletion behavior revised:** A console edition can
  be deleted while another edition with the same label remains because games
  refer to the label, not an individual device. The owner decided to block
  deletion of the last matching edition while any games still use that label;
  move or delete those games first. This supersedes the earlier proposal to
  block deletion whenever games reference a physical console record.
- **2026-10-05 — Game deletion confirmation selected:** Ask for explicit
  confirmation before deleting a game record. No code or schema was changed.
- **2026-10-05 — Console edit behavior selected:** Editing a console changes
  the existing inventory record; games are associated with its shared console
  label, not a specific edition. No code or schema was changed.
- **2026-10-05 — Console label and edition model clarified:** Console entries
  represent owned devices with a reusable platform label (`Xbox 360`) and a
  separate edition/details field (`Original white`, `Star Wars edition`).
  Game records select the unique label, shown once in the dropdown rather than
  one option per owned edition. Deleting one edition preserves the game
  association if another record with that label remains. This supersedes the
  earlier decision to link games to a physical console record. No code or
  schema was changed; last-edition deletion behavior was decided separately.
- **2026-10-05 — Console labels scoped per collection:** The owner chose to
  keep available console labels separate by collection, rather than shared
  app-wide. Each collection's game dropdown derives distinct labels from that
  collection's console inventory records. No code or schema was changed.
- **2026-10-05 — Last-console deletion behavior selected:** Deleting a
  physical console record is blocked if it is the last record with that label
  and game records still use the label. The games must first be moved to
  another label or explicitly deleted. No code or schema was changed.
- **2026-10-05 — Next-step guidance requested:** The owner wants each reply to
  include the next concrete step or decision so planning keeps moving.
- **2026-10-05 — Duplicate collection-item names allowed:** Game and console
  names do not need to be unique within a collection, allowing duplicate
  copies or editions. No code or schema was changed.
- **2026-10-04 — Lightweight test preference recorded:** The owner prefers not
  to add tests routinely to keep work lightweight. Retained the three focused
  registration/role tests because they guard against privilege escalation and
  invalid role values at an important access-control boundary.
- **2026-10-04 — Manual feature testing requested:** The owner wants to follow
  along and learn as functionality is added. For behavior that can be manually
  exercised, include safe steps and expected results; clarify when a feature
  is not yet ready for manual testing.
- **2026-10-04 — Account/collection model reopened for brainstorming:** The
  owner is considering an admin account focused on future user management,
  regular users who can edit their own persistent data, and a linked
  controller/controlled-account model for demo data. First demo behavior should
  stay simple: browser-local changes only. A future controller account such as
  `admin-demo` may manage data for a linked `demo-user` and configure
  view-only versus browser-editable mode. The earlier single-writer roadmap
  assumption is not settled. These are planning notes only; no code or schema
  change was made.
- **2026-10-04 — Linked-account permissions clarified:** The long-term
  controller/controlled-account concept is specifically a permission dropdown
  managed by an account such as `admin-demo` for a linked account such as
  `demo-user`. `edit` means persistent edits to the controller's collection
  without user-management powers; `view-only` prevents edits; `demo` permits
  browser-local edits only. This remains long-term brainstorming, not first
  demo release scope. No code or schema change was made.
- **2026-10-04 — Durable access model preferred:** The owner prefers to define
  and implement the intended role, collection-ownership, and linked-account
  permission model before building collection features, rather than add
  temporary role-only behavior and replace it later. Specific role/link
  semantics are still being clarified; no code or schema change was made.
- **2026-10-04 — Global admin separated from demo controller:** The owner's
  main account is the global admin for user management. `admin-demo` should be
  a regular collection-owning/controller account with no global admin powers;
  `demo-user` access is controlled through a link permission. The permission
  values are `edit` (persistent changes to the linked collection),
  `view-only` (no changes), and `demo` (browser-only edits). Accordingly,
  `demo` belongs on the relationship, not as a global user role; revise the
  currently implemented role schema before adding collection features. This
  is a planning decision; no code or database changes were made.
- **2026-10-04 — Multiple controller links selected:** A controlled account
  may be linked to multiple controller accounts or collections, with a
  separate permission per link. The data model should support this even if
  the first UI presents only a simple workflow. No code or database changes
  were made.
- **2026-10-04 — Alternative access-model proposal captured:** Reviewed an
  outside proposal to use global `admin`/`user` roles, owned collections,
  collection-specific `edit`/`view` grants, and a demo-only client sandbox.
  Recorded its useful separation and two design caveats: global admin should
  not automatically bypass collection ownership, and a user-wide demo flag
  does not represent the desired per-link demo mode. No design choice or code
  change was made.
- **2026-10-04 — Refined collection-grant model reviewed:** A follow-up
  proposal replaces the user-wide demo flag with per-collection link modes
  `edit`, `view-only`, and `demo`. Persistent writes are permitted only to an
  owned collection or through an `edit` link; global admin has no implicit
  collection-write override. The API denies writes for `view-only` and `demo`,
  while the demo UI adds browser-local editing. The proposal was not yet
  accepted when recorded; no code or schema change was made.
- **2026-10-04 — Main account owns private and demo collections:** The owner
  decided their main account will own multiple collections, including their
  private collection and a separate curated demo collection. `demo-user` will
  receive demo access to the demo collection only; no separate `admin-demo`
  account is needed. This decides collection ownership, not the detailed
  grants schema or authorization implementation.
- **2026-10-05 — Video-game API added:** Added collection-scoped
  console labels, physical console inventory, and game records with the agreed
  fields and condition choices; wired CRUD routes to collection read/write
  permissions and added a forward Alembic migration. Fixed game counts to
  count unique games when labels have multiple physical editions, and covered
  label reuse/deletion safety in focused tests. All 11 API unit tests passed;
  offline PostgreSQL migration SQL generated successfully. No database was
  changed. UI and local manual API walkthrough remain next.
- **2026-10-05 — Video-games module naming selected:** The owner chose
  `video_games` for the current game and console implementation instead of
  `catalog`, because the current domain is the Video Games item category and
  “catalog” could imply a global/shared reference catalog. Renamed the API,
  schema, model, test, and migration modules and updated imports. This is an
  internal naming change only; API routes, database tables, and behavior stay
  unchanged. The separately used product phrase “catalog/category taxonomy”
  still refers to the future category structure.
- **2026-10-06 — Video-game condition enum named explicitly:** Renamed the
  generic `ItemCondition` enum to `VideoGameCondition` because these condition
  values currently belong to the video-games domain, not every future item
  category. The enum remains used for games and physical console inventory
  within that domain. No schema, stored values, or API payloads changed.
- **2026-10-06 — Local video-game API walkthrough confirmed:** The owner
  completed the deployment README walkthrough and confirmed the console/game
  API works as expected against the local development stack. This confirms
  local behavior, not production deployment or UI functionality.
- **2026-10-06 — Copilot coding instructions created:** Replaced the starter
  multi-root template with DLAMS-specific guidance covering React/TypeScript,
  domain-oriented file boundaries, separate resource API modules, server
  state, accessible UX, validation, and the owner's styling-approval
  preference. The guide notes TanStack Query is preferred when adopted but is
  not currently a dependency.
- **2026-10-06 — Initial collection and video-games UI implemented:** Added
  collection selection/creation and console/game add, edit, and delete flows.
  Kept `Home` as a structural shell and split collection and video-game
  behavior into focused components; API request transport and auth,
  collections, consoles, and games endpoints are separated into modules.
  Owner/edit access can write; view-only/demo access is displayed read-only.
  `npm run build` passed. `npm run lint` still reports the two existing
  Fast Refresh export errors in shared button/form components. Owner review
  and local manual UI testing remain pending.
- **2026-10-06 — Initial UI organization confirmed:** The owner emphasized
  keeping route pages structural and API resources in separate logical files.
  The implementation follows this boundary; preserve it as additional
  features are added.
- **2026-10-06 — Right-side drawers selected for forms:** The owner requested
  that collection and item forms open in a right-side drawer, keeping the
  current list/page visible and uncluttered. Apply to create and edit forms;
  keep destructive confirmations as confirmations rather than turning them
  into edit drawers.
- **2026-10-06 — UI stack clarified:** The owner confirmed the intended UI
  stack as Vite, Tailwind, shadcn components, React Router, React Query
  (TanStack Query), and Zustand. Updated the Copilot instructions accordingly.
  Source inspection confirms local shadcn-style components, React Router, and
  Zustand are present; TanStack Query is not yet installed or used, so the
  instructions distinguish selected direction from current dependency
  status. No dependency was added.
- **2026-10-06 — shadcn drawer component adopted:** Replaced the handwritten
  native-dialog wrapper with the shadcn Drawer generated by
  `npx shadcn@latest add drawer`, and updated collection, console, and game
  forms to use its right-side composition. Kept the project's `cn` utility
  instead of adding the unrelated `cn` package. The generated drawer uses
  Vaul as its primitive dependency.
- **2026-10-06 — Python conventions refined:** Added the owner's Python
  standards to the workspace Copilot instructions: PEP 8 and Ruff, modern
  type hints, FastAPI/Pydantic practices, SQLAlchemy 2.0 APIs,
  forward-only/reviewed Alembic migrations, and pytest conventions. Review
  confirms several existing cleanup candidates: `video_games_routes.py`
  combines console and game routes and uses `Session.query()`; the shared
  `app/db.py` base still uses `declarative_base()`; older auth route handlers
  lack complete type/response declarations; and current tests use `unittest`.
  Ruff and pytest are not currently configured. These are existing debt, not
  refactored as part of the standards update.
- **2026-10-06 — Copilot instructions aligned with current tooling and access
  model:** Replaced command placeholders with verified UI build/lint, backend
  unittest, and local Compose commands. Corrected grant semantics, clarified
  that global admin has no implicit collection access, scoped SQLAlchemy 2.0
  migration guidance to new/refactored code, and made authorization test
  coverage representative rather than duplicative. Added a default to leave
  changes uncommitted unless requested.
- **2026-10-06 — Hybrid local development documented:** Added a deployment
  README workflow to run PostgreSQL and the API in Docker while running the UI
  on the host with Vite. Added `npm run dev:hybrid` to set `API_PROXY_TARGET`
  to the Compose-published API port (`127.0.0.1:8001`) and reuse the existing
  local Vite script. The README distinguishes the host UI's `5173` URL from
  the container UI's `5174` URL and documents stopping services while
  preserving the shared database volume. Verified against
  `docker-compose.dev.yml`, `vite.config.ts`, and `package.json`; no
  containers or database were started or modified.
- **2026-10-08 — TanStack Query v5 adopted in the UI:** Added one
  `QueryClientProvider`, resource query-key factories and `queryOptions` for
  auth, collections, consoles, games, and video-game stats, plus feature
  hooks/mutations with affected-query invalidation. Replaced the auth Zustand
  store/local-storage profile with cookie-backed current-user query state.
  Selected collection ID is stored in the `collection` URL search parameter.
  Also avoided redundant URL updates when there is no collection to select.
  Updated Copilot guidance for server/client state. The owner had already
  installed TanStack Query; package manifests and lockfiles were left
  unchanged. Focused ESLint and `npm run build` pass; the build emits a
  large-chunk warning. Full `npm run lint` still fails only on the existing
  Fast Refresh export errors in `src/components/ui/button.tsx` and
  `src/components/ui/form.tsx`. No frontend test framework is configured,
  and browser interaction testing remains pending.
- **2026-10-09 — Query-result destructuring convention added:** Updated the
  TanStack Query guidance to destructure the result fields a component uses
  when that improves readability, and to use a focused feature hook or
  `select` for reusable derived views. Query data remains in the query cache;
  do not mirror it in React state. Applied the convention to
  `VideoGameCollectionStats`.
- **2026-10-09 — Video-game collection stats derived in feature hook:** The
  `useVideoGameCollectionStats` hook now accepts a collection ID and uses
  TanStack Query's `select` to return only that collection's stats. The
  presentation component no longer searches the aggregate result itself; the
  underlying shared query cache remains the source of truth.
- **2026-10-09 — Registration changed to explicit invitation-only access:**
  Following the owner’s request to prevent unapproved account creation, added
  single-use registration invitations issued by admins and a first-admin
  bootstrap CLI that works inside the API container without public signup.
  Invitation tokens are random, stored as SHA-256 hashes, expire after seven
  days, and are consumed in the same database transaction as account creation.
  The registration UI accepts the invitation via a fragment link or code;
  newly registered accounts always receive the regular `user` role. Fixed the
  production Nginx `/api/` proxy prefix and configured HTTPS auth cookies as
  Secure. No production stack or data was changed. All 23 API unit tests pass;
  PostgreSQL migration SQL generation, UI production build, focused ESLint,
  and both Compose config checks pass. The UI build still emits the existing
  >500 kB chunk warning. Full UI lint still reports the two known Fast Refresh
  errors in shared button/form components. Pi deployment and live
  end-to-end verification remain required.
- **2026-10-09 — Monorepo built locally (not pushed):** Investigated the three
  independent public repos (`gabrielruss/dlams-ui`, `-fastapi`, `-deployment`)
  and merged them with `git filter-repo` into one `dlams` repository, one
  history per subfolder. Added root `.gitignore`, a single
  `.github/workflows/deploy.yml`, `dlams-fastapi/.env.example`, a fixed
  `dlams.code-workspace`, and moved this plan, the README, and Copilot
  instructions to the root. Production Compose now requires `SECRET_KEY`;
  `SECRET_KEY` was added to `dlams-deployment/.env.example`. Verified:
  commit history merged, no `.env` or `.DS_Store` in history (except
  `dlams-ui/.env`, which only holds `VITE_API_URL`), `docker compose config`
  passes for dev, and prod fails clearly without `SECRET_KEY`. Not verified:
  GitHub push, the new workflow, and a Pi deployment. The Pi cutover runbook is in the
  "Raspberry Pi cutover" section.
- **2026-10-09 — Fixed untracked `dlams-ui/Dockerfile.local`:** The UI
  `.gitignore` pattern `*.local` had silently excluded it, though
  `docker-compose.dev.yml` builds from it, so a fresh clone could not start
  the Docker dev stack. Added a `!Dockerfile.local` exception and committed it.
- **2026-10-09 — Monorepo build verified from a fresh clone:** Cloned the
  local monorepo and built the `api` and `ui` images from
  `dlams-deployment/docker-compose.dev.yml` under an isolated project name;
  both built successfully and the test images were removed. The stack was not
  started, and the Pi workflow was not exercised.
- **2026-10-09 — Pi inspected (owner-supplied output; assistant SSH refused):**
  Recorded the Pi layout, containers, volumes, runners, and the missing
  `dlams-deployment/.env` under "Raspberry Pi cutover", with a runbook.
  Nothing on the Pi was changed. The assistant's SSH attempt failed because
  the key is not accepted without a passphrase/agent.
- **2026-10-09 — Pi `dlams-deployment` checkout confirmed stale:** Owner ran
  `git log -1` and `git fetch`/`status` on the Pi: HEAD `85c48b8`, behind
  origin by 5 commits. Recorded under "Raspberry Pi cutover"; no change made.
- **2026-10-09 — Stale UI volume fixed in source:** Replaced the shared
  `ui_build` volume with an Nginx `proxy_pass` to the `ui` service
  (`dlams-deployment/nginx.conf`, `docker-compose.yml`). Verified: `docker
  compose config` passes; `nginx -t` passes using throwaway certificates and
  stub upstream hosts. Not verified: live behavior on the Pi. Also confirmed
  on the Pi that `https://dontlookatmystuff.com/api/verify` returns 401
  (prefix strip working) after the manual cutover deploy.
- **2026-10-09 — Pi cutover steps 2-5 completed by owner:** Old runners
  stopped, `~/dlams` replaced by a clone of the monorepo, `SECRET_KEY` created
  in `dlams-deployment/.env`, and services rebuilt manually. Verified on the
  Pi: `/api/verify` returns 401, and the served UI assets now match the built
  image after the Nginx proxy fix. Owner then ran `python -m app.auth.bootstrap_admin` in
  `dlams-api` successfully and confirmed the app loads in the browser (an
  apparent old UI was a browser cache). Runner re-registration (step 6)
  remains.
- **2026-10-09 — Pi runner re-registered to the monorepo:** Old per-repo
  runner directories (`actions-runner-api`, `-ui`) and `~/dlams-old` were
  removed from the Pi. `~/actions-runner-deployment` was reconfigured for
  `gabrielruss/dlams` with label `deploy-pi` and installed as the systemd
  service `actions.runner.gabrielruss-dlams.raspberrypi`. Reconfiguration
  required deleting the `*_migrated` config marker files (for example
  `.runner_migrated`), which `config.sh` treats as "already configured".
  Verified from the owner's output: service active, `Connected to GitHub`,
  `Listening for Jobs`. **First automated deploy verified:** the
  `Deploy to Raspberry Pi` run for the docs-only push succeeded (all build
  layers cached, containers left running, Nginx reloaded, four services up).
  Earlier queued jobs had delayed it while the runner worked through them.
  Cleanup of the old public repositories remains.
