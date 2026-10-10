# DLAMS decisions

Dated record of decisions and their reasons. Newest first within each group.
An entry marked **Superseded** is kept for history only; the entry that
replaces it is named. Proposals and open questions live in
[`DLAMS-PLAN.md`](../DLAMS-PLAN.md), not here.

## Repository and delivery

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
  data in React state. Zustand only for genuinely shared client state.
- Keep authorization rules in shared helpers (for example
  `canWriteCollection`); the API remains authoritative.
- Avoid `void` on promises unless a lint rule or fire-and-forget boundary
  needs it.
- Ask before changing styling after the owner's styling pass, and before
  installing packages or running the shadcn CLI.
- Backend tests use `unittest`. Add tests only where they protect
  authentication, authorization, or persistent-data boundaries.
