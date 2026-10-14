# DLAMS decisions

Dated record of decisions and their reasons. Newest first within each group.
An entry marked **Superseded** is kept for history only; the entry that
replaces it is named. Proposals and open questions live in
[`DLAMS-PLAN.md`](../DLAMS-PLAN.md), not here.

## Repository and delivery

### Portfolio-ready checkpoint before further features — 2026-10-14
- The next goal is a state the owner can link from a portfolio site and show
  to potential employers, reached as soon as possible. It is defined in
  `DLAMS-PLAN.md` ("Milestone: portfolio-ready") and reorders "Next up":
  deploy and demo provisioning, demo sign-in, a mobile-friendly styling pass,
  CI and light tests, and a README with screenshots come first.
- Grant management UI, browser-local demo editing, and further item types move
  after the milestone. They are real features, but a visitor signed in as the
  demo user cannot see the owner-only grants screen, and local editing and a
  second item type cost more than the milestone needs.
- Reason: the owner is actively applying for jobs. A live, working,
  well-presented demo plus visible engineering practice (CI, tests, docs)
  does more for that than additional features.
- The deferred API dependency upgrades and automated backups stay deferred.

### Old per-repo repositories stay, private — 2026-10-12
- The three pre-monorepo repositories are not being deleted. They were made
  private and their runners and local checkouts were removed; the remaining
  step, deleting them, is won't do.
- Reason: owner's choice. Their history still contains a committed `.env`
  whose `SECRET_KEY` has been rotated, so it no longer signs sessions.

### Defer API dependency upgrades — 2026-10-12
- `pip-audit` reports 27 advisories in 10 API packages; none appear reachable
  given how the app uses them (HS256-only JWTs, no forms, uploads, or static
  serving from the API). The UI audit is clean.
- Upgrading and replacing `python-jose` are deferred, not rejected. Closing
  the Starlette advisories needs a FastAPI upgrade, so it is its own change.
- Reason: no reachable exposure, and the larger upgrade should not land
  alongside feature work.

### Monorepo, one deploy workflow — 2026-10-09
- One `dlams` repository replaces `dlams-ui`, `dlams-fastapi`, and
  `dlams-deployment`. The three folder names are kept so Compose build
  contexts, README links, and the Compose project name (and its volumes) do
  not change.
- History was preserved by rewriting each repo into its subfolder. Local
  environment files, `.DS_Store` files, and per-repo `.github` folders were
  left out of the rewritten history; commits that only touched those became
  empty and were dropped (68 old commits became 50).
- One workflow pulls once on the host and rebuilds `api`, `ui`, and `nginx`
  on every push to `main`. Path-filtered partial rebuilds were not chosen for
  simplicity.
- Consequence: production Compose reads `SECRET_KEY` from an untracked
  `dlams-deployment/.env` and fails clearly if it is missing.

### Public repository, private operations notes — 2026-10-09
- The repository stays public. Tracked files must not contain secrets,
  infrastructure layout, or security follow-ups; those live in the git-ignored
  `.private/ops-notes.md`.
- Consequence: the plan and this file describe behavior and intent, not
  hosts, paths, or credentials. Content already pushed remains in git history.

### UI served through the UI container — 2026-10-09
- Nginx proxies `/` to the `ui` service (port 3000) instead of sharing a
  `ui_build` volume. A named volume is filled from the image only once, so
  rebuilt UI images never reached users. Verified in production: served assets
  now match the built image.

### Two isolated development modes, plus hybrid — 2026-10-03, 2026-10-06
- Development uses `dlams-deployment/docker-compose.dev.yml` under its own
  project name and database volume, separate from production.
- Vite proxies `/api` to the API and strips the prefix, so the browser stays
  same-origin and CORS is not enabled broadly. Modes: UI and API on the host,
  UI and API in Docker, or API in Docker with the UI on the host
  (`npm run dev:hybrid`).

## Accounts and access

### Admins can deactivate a user; delete is deferred — 2026-10-12
- Admin user management deactivates and reactivates accounts. A deactivated
  user cannot log in or use an existing session; their account, collections,
  and grants stay intact. Deleting a user is deferred, not rejected.
- Reason: deletion needs a policy for the user's data (see below) and
  production has no backups, so a hard delete would be irreversible.
- Deactivation needs a new `users` column, a forward migration, and an active
  check at login and in `get_current_user`.
- Facts that constrain a future delete: `collections.owner_id` and
  `collection_grants.user_id` cascade from users, but consoles and games
  reference console labels with `RESTRICT`, and
  `registration_invitations.created_by_id` is `RESTRICT`, so a naive delete of
  a user with data or issued invitations fails at the database. The API also
  has no collection delete endpoint yet.
- **Supersedes** "Admins can deactivate or delete a user" (same day), which
  superseded "deactivate, not delete" (same day).

### Superseded: Admins can deactivate or delete a user — 2026-10-12
- Replaced the same day by "deactivate; delete is deferred".

### Superseded: Removing a user's access means deactivating, not deleting — 2026-10-12
- **Superseded** the same day by "Admins can deactivate a user; delete is deferred".
- Admin user management deactivates an account instead of deleting it. A
  deactivated user cannot log in or use an existing session, but their
  account, collections, and grants stay intact and the action is reversible.
- Reason: deleting a user forces decisions about what happens to their
  collections and grants. Authentication already looks the user up on every
  request, so a deactivation flag takes effect immediately.
- Consequence: needs a new column on `users` and a forward migration, plus an
  active check in `get_current_user` and at login. Not built yet.

### Invites, grants, and user management are separate features — 2026-10-12
- An invitation only creates an account (always role `user`). It never
  carries a collection grant. Invites stay admin-only.
- Reason: invites are an admin action, while grants are an owner action and
  admin has no implicit access to collections it does not own. Combining them
  would let an admin hand out access to collections it does not own.
- UI: the invite form opens in a drawer from a link beneath the username in
  the left sidebar. Collection grants get their own full-page, table-based
  screen, scoped to the owner (not admin-only). Admins get a separate
  user-management screen so a user's access can be removed from the UI rather
  than the database.

### Invite-only registration — 2026-10-09
- **Supersedes** "keep public registration" (2026-10-04).
- Registration requires an admin-issued, single-use invitation. Tokens are
  random, stored as SHA-256 hashes, expire after seven days, and are consumed
  in the same transaction that creates the account. New accounts always get
  the `user` role.
- The first admin is created by an operator-run command inside the API
  environment. Production cookies are `Secure`.
- Reason: public self-service signup was unnecessary for a single-owner app.

### Collection ownership and grants — 2026-10-04
- Global roles are `user` and `admin`. `admin` is for app-wide user
  management and grants no implicit access to other users' collections.
- Any user may own multiple collections. Per collection and user there is
  one grant mode: `edit`, `view-only`, or `demo`.
- `edit` allows persistent writes; `view-only` allows reads; `demo` allows
  reads and, later, browser-local edits only. The API denies writes for
  `view-only` and `demo`.
- The owner's main account owns both a private collection and a separate
  curated demo collection; a `demo-user` account receives a `demo` grant to
  the demo collection only.
- **Supersedes** a global `demo` role (2026-10-04) and the earlier
  owner-only-write roadmap. `demo` is a property of a grant, not of an
  account.

### Demo behavior — 2026-10-02
- Demo credentials are public and carry no authority; server-side
  authorization alone protects persistent writes.
- Demo visitors may eventually edit a browser-local copy that survives
  refresh and can be reset to the source collection. Those edits must never
  become database writes.

## Domain model

### Categories, collections, and item types — 2026-10-05
- A **collection** is a user-owned container, separate from the category
  taxonomy. Broad categories (Video Games, Books, Shoes, Music) contain item
  types (video games and consoles; CDs and vinyl).
- Each collection has a type. `video_game` is the only supported type, enforced
  by a database check constraint, and UI rendering dispatches on it through
  typed registries so a new type must register its workspace and stats
  renderer (2026-10-08).
- **Open:** database and ORM inheritance strategy and the shared item name
  (see the plan's open questions).

### Video-game rules — 2026-10-05
- **Console records** represent physical devices: a console label (for
  example `Xbox 360`), an edition/details value, and a condition. Labels are
  scoped per collection, and several records may share one label.
- **Game records** store one console label (not a device), a `name`, a
  `condition`, an optional `last_played` date, and a `completed` boolean
  defaulting to false. Photos are deferred.
- Console must exist before a game for its label. The game dropdown shows
  each distinct label once.
- Condition is a fixed list: `Loose`, `CIB`, `New`, `Item & Box`.
- Deleting a console edition is allowed while another edition of the same
  label remains; deleting the last edition is blocked while games use the
  label. Game deletion asks for confirmation.
- Duplicate game and console names are allowed within a collection. A console
  game count is derived, never stored.
- The module is named `video_games` (not `catalog`) to avoid implying a
  shared reference catalog.

## Code and UI conventions

### Leave the shadcn CLI's `cn` import alone — 2026-10-14
- The shadcn CLI generates `import { cn } from "cn"` and adds the `cn` npm
  package (a drop-in for clsx plus tailwind-merge). Removing the package the
  same day broke the production UI build: the pushed commit dropped the
  package while `drawer.tsx` still imported it, because the fix to
  `drawer.tsx` was not in that commit.
- Decision: keep the `cn` package and do not rewrite generated imports. Older
  components keep using `@/lib/utils`; the two helpers do the same job.
- Reason: the CLI re-adds it on every component install, so fighting it costs
  more than the small duplication.

- Prefer feature/domain-focused files; keep route pages structural.
  Separate API modules by resource.
- Nontrivial component workflows (loading, state, mutations) live in focused
  custom hooks.
- Create/edit forms open in a right-side drawer, one drawer at a time, with
  visibility state local to the feature. Destructive actions stay
  confirmations.
- Use React Hook Form for submitted data-entry forms.
- Server state lives in TanStack Query; destructure the fields a component
  uses and derive views with `select` or a feature hook. Do not mirror query
  data in React state. Zustand only for genuinely shared client state
  (superseded 2026-10-14: Zustand was unused and removed; see the plan's
  open questions for the demo overlay).
- Keep authorization rules in shared helpers (for example
  `canWriteCollection`); the API remains authoritative.
- Avoid `void` on promises unless a lint rule or fire-and-forget boundary
  needs it.
- Ask before changing styling after the owner's styling pass, and before
  installing packages or running the shadcn CLI.
- Backend tests use `unittest`. Add tests only where they protect
  authentication, authorization, or persistent-data boundaries.
- Frontend testing, when added (2026-10-12), stays light: few tests, mostly
  integration, asserting on user-visible behavior rather than implementation
  details. Static checks (TypeScript, ESLint) carry the rest.
