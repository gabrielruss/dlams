# DLAMS plan

Last updated: 2026-10-14

The current state of the project. For why things are the way they are, see
[`docs/decisions.md`](./docs/decisions.md). For the full history up to
2026-10-09, see [`docs/archive/`](./docs/archive/).

## How to use this document

Before a substantive change: read this file, the relevant folder README, and
the code. Before finishing: update this file only when one of these changed.

- **Status or next steps:** keep "Current status" and "Next up" true.
- **A decision was made:** add it to `docs/decisions.md` with the date, the
  reason, and what it supersedes. Mark superseded entries; do not leave them
  presented as current.
- **The structure changed** (a component, endpoint family, data model, auth
  or access rule, deployment flow, or major dependency): update
  `docs/architecture.md`. It describes the present only; put the reason in
  `docs/decisions.md` and link to it.
- **A problem was found or fixed:** update "Known issues" (open items only).
  Say what was actually run and what was not; never claim a test passed
  unless it was run.
- **New user-visible behavior:** tell the owner how to try it manually and
  what result to expect.

Do not log routine refactors; git history covers them. End planning replies
with one concrete next step.

**This repository is public.** Never put secrets, credentials, hostnames of
real infrastructure, or server layout in tracked files. Operational and
security notes belong in `.private/ops-notes.md`, which is git-ignored and may
be absent on a fresh clone.

## Overview

DLAMS is a private, extensible collection tracker for one owner, with a
shared demo experience. Video games are the first collection type.

One monorepo, three folders:

| Folder | What it is |
| --- | --- |
| `dlams-ui` | React, TypeScript, Vite, Tailwind, shadcn/ui, TanStack Query v5 |
| `dlams-fastapi` | FastAPI, SQLAlchemy 2, Alembic, PostgreSQL |
| `dlams-deployment` | Docker Compose, Nginx |

Startup instructions live in
[`dlams-deployment/README.md`](./dlams-deployment/README.md). Coding
conventions live in
[`.github/copilot-instructions.md`](./.github/copilot-instructions.md).

Pushing to `main` deploys to the production host through one GitHub Actions
workflow on a self-hosted runner (`.github/workflows/deploy.yml`).

## Current status

**Implemented and deployed**

- **Accounts:** invite-only registration (admin-issued, single-use, 7-day
  invitations), login/logout with an HTTP-only cookie, global roles `user` and
  `admin`, and a CLI to bootstrap the first admin
  (`python -m app.auth.bootstrap_admin`).
- **Collections and access:** users own multiple typed collections (type
  `video_game` only). Owners grant `edit`, `view-only`, or `demo` access.
  Persistent writes are owner or `edit` grantee only; global admin has no
  implicit collection access.
- **Video games:** collection-scoped console labels, physical console
  records, and game records, with full CRUD in the API and UI.
- **UI:** left sidebar with collection rows and counts, right-side drawers
  for forms, URL-backed collection selection, TanStack Query for all server
  state.

**Not implemented**

- Collection grant management UI.
- Browser-local editing for `demo` access (demo collections are read-only in
  the UI today).
- Documented provisioning of the demo account.
- Demo login prefill on the login page.
- Item types other than video games.

**Verification baseline**

- API (2026-10-12): 31 unit tests pass (run on Python 3.13 in a scratch venv,
  not the project's 3.12); PostgreSQL SQL generates for the `is_active`
  migration. The migration has not been applied to a database yet.
- UI (2026-10-12): `npm run build` and full `npm run lint` pass.
- Production routing and the automated deploy pipeline were exercised
  end to end by the owner (2026-10-09).
- Manual browser pass (2026-10-12, owner-reported): collection and
  console/game flows across owner, `edit`, `view-only`, and `demo` access
  worked as expected. Phone-width observations were not reported.

## Milestone: portfolio-ready

The next goal, set 2026-10-14: a state good enough to link from the owner's
portfolio site and show to potential employers, reached as soon as possible.
Items 1 to 5 under "Next up" are the path; the rest waits. See `docs/decisions.md` for why.

Done when all of these are true:

- **Live and deployed.** The current `main` is deployed and verified, and a
  visitor can open the live URL and sign in as the demo user in one step (no
  credentials to hunt for), then browse a curated video-game collection.
- **Works on a phone.** The sidebar, drawers, and tables are usable at phone
  width, because recruiters will often open the link on one.
- **Looks intentional.** The owner has done the styling pass for the screens a
  visitor sees (login, collection workspace, stats).
- **Shows engineering practice.** A CI workflow runs lint, type check, build,
  and the backend tests on every push, with a passing status visible, plus a
  few meaningful frontend integration tests.
- **Has a front door.** The root `README.md` says what DLAMS is and why, links
  the live demo, shows screenshots, summarizes the stack and architecture
  (linking `docs/architecture.md`), and explains how to run it.
- **Safe to publish.** A secrets scan of the repository and its history is
  clean, and the demo account carries no authority beyond reading the demo
  collection.

Explicitly not required for this milestone: grant management UI,
browser-local demo editing, further item types, user deletion, automated
backups, and the deferred API dependency upgrades.

## Next up

In order. Items 1 to 5 are the path to the portfolio milestone.

1. **Deploy, and provision the demo account.** Admin user management is built
   and owner-confirmed in the dev stack (2026-10-12) but not deployed: the
   sidebar "Invite someone" drawer, and `/admin/users` to deactivate and
   reactivate users (backed by `users.is_active` and migration
   `b7d4a1c93e52`, not yet applied to production). Production has no backup,
   so take a dump before the deploy. Then document and run the demo-account
   provisioning: create an invite, register `demo-user`, create the demo
   collection with real-looking content, grant `demo` access. Deleting a user
   is deferred (see `docs/decisions.md`).
2. **Demo sign-in on the login page.** A "Try the demo" control that signs in
   as the demo user without typing credentials. Demo credentials are public
   by design and carry no authority (see `docs/decisions.md`).
3. **Mobile-friendly styling pass** across the whole UI (sidebar and drawers
   in particular). This is the owner's styling pass, so it needs the owner's
   go-ahead and scope before any CSS or Tailwind change. For the milestone,
   scope it to the screens a visitor sees; the rest can follow. When done,
   mark the styling pass status in `.github/copilot-instructions.md`.
4. **Automated checks: CI plus light frontend testing.** Add a CI workflow on
   a GitHub-hosted runner (separate from the deploy workflow) that runs lint,
   type check, build, and the backend tests. Add light frontend testing in
   the spirit of "write tests, not too many, mostly integration": a few tests
   that render real flows and assert on what a user sees. Vitest with React
   Testing Library and MSW for integration tests, plus a handful of
   Playwright end-to-end checks across owner, `edit`, `view-only`, and `demo`
   access. Skip per-component and per-hook unit tests. Needs the owner's
   approval to install packages. Backend tests stay on `unittest`.
5. **README, screenshots, and a final check.** Rewrite the root `README.md`
   as the front door (see the milestone), take screenshots after the styling
   pass, run a secrets scan, and click through the live demo on a phone and a
   desktop. Then share it.

After the milestone:

6. **Grant management UI.** A full-page, table-based screen where a collection
   owner views and edits the access they have granted.
7. **Browser-local demo editing** with reset. It waits on the open questions
   below.
8. **Further item types**, after the shared-fields question is settled.

## Known issues

- Dependency audit (2026-10-12): `npm audit` on `dlams-ui` reports 0
  vulnerabilities. `pip-audit` on `dlams-fastapi/requirements.txt` reports 27
  advisories in 10 packages (starlette, cryptography, pyasn1, ecdsa, anyio,
  and others); it gives no severity. Reading the advisories against the code,
  none appear reachable from the network given how the app uses these
  packages (HS256-only JWTs, no form or file uploads, no static-file serving
  from the API). Several have no fixed version (`ecdsa`, `python-jose`).
  Upgrading is deferred (decided 2026-10-12) and is a separate, explicitly
  requested change because FastAPI 0.115.12 requires `starlette<0.47`.
- There is no frontend test framework. Backend tests use `unittest`; Ruff and
  pytest are not configured.
- Backend debt: `video_games_routes.py` combines console and game routes and
  uses `Session.query()`; `app/db.py` uses `declarative_base()`; older auth
  handlers lack complete type and response declarations.
- Migration `951a8354c293` uses a PostgreSQL-only `ALTER COLUMN`, so the full
  migration chain cannot be replayed on SQLite.
- `dlams-fastapi/.env.example` was only used by the deleted legacy
  `docker-compose.local.yml` and is now orphaned; decide whether to remove it.
- Direct cross-origin browser calls to the API fail without CORS. The
  supported development workflows avoid this with a same-origin Vite proxy.

## Open questions

- How should a visitor's browser-local demo overlay behave if the owner
  changes the source demo collection or revokes the demo grant?
- What fields are shared by every item type, and how should type-specific
  metadata be modeled? Compare schema options before choosing an inheritance
  strategy, and choose stable names for categories and item types.
- Which URL do visitors get? The portfolio link is the first impression, so
  decide whether the demo lives at the main domain or a dedicated subdomain.
- Deferred: what should deleting a user do to the collections, consoles, and
  games they own, and to invitations they issued? Decide before building
  delete; production has no backups yet, so a hard delete cannot be undone.
- Should collection owners, not only admins, be able to invite someone with a
  grant on their own collection attached?
- Is browser local storage enough for the first demo version? If the overlay
  needs a client store, `zustand` with its `persist` middleware is a candidate
  (it was removed on 2026-10-14 because nothing used it); a small
  `useSyncExternalStore` hook is the dependency-free alternative. Decide with
  the overlay design, not before.
- What features beyond the first game-list workflow are in scope for the
  private app and for the demo?
