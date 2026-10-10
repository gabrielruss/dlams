# DLAMS plan

Last updated: 2026-10-10

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
- Admin-only user management; documented provisioning of the demo account.
- Demo login prefill on the login page.
- Item types other than video games.

**Verification baseline (2026-10-09)**

- API: 23 unit tests pass; PostgreSQL migration SQL generates.
- UI: `npm run build` passes; focused ESLint passes.
- Production routing and the automated deploy pipeline were exercised
  end to end by the owner.
- Manual browser testing of the drawer forms and TanStack Query flows has not
  been done.

## Next up

In order:

1. **Retire the old per-repo checkouts and repositories.** Details are in the
   private notes. (The in-repo housekeeping, deleting the legacy
   `docker-compose.local.yml` files and the Compose `version` key, is done.)
2. **Harden production database credentials.** Details are in the private
   notes.
3. **Assess the dependency audit findings** (about 25, 1 critical). The app is
   deployed and public, so know what is exposed before adding features.
4. **Manual browser pass** over collection and console/game CRUD for owner,
   `edit`, `view-only`, and `demo` access. Also note anything that breaks at
   phone width, as a baseline for step 8; do not fix layout here.
5. **Fix the two lint errors** in `button.tsx` and `form.tsx`, so the lint
   baseline is clean before the styling work touches shared UI components.
6. **Admin user management** and demo-account provisioning.
7. **Grant management UI.** Steps 6 and 7 add the last large new screens;
   build them before the responsive pass so they are not restyled twice.
8. **Mobile-friendly styling pass** across the whole UI (sidebar and drawers
   in particular). This is part of the owner's styling pass, so it needs the
   owner's go-ahead and scope before any CSS or Tailwind change. Sequence it
   after the new screens exist and before the demo is shared widely, since
   visitors are likely to arrive on phones. When done, mark the styling pass
   status in `.github/copilot-instructions.md` accordingly.
9. **Browser-local demo editing** with reset. It waits on the open questions
   below and is mostly logic; the reset control is small and lands on the
   already-responsive layout.
10. **Further item types**, after the shared-fields question is settled.

## Known issues

- `npm run lint` fails on two `react-refresh/only-export-components` errors
  in `dlams-ui/src/components/ui/button.tsx` and `form.tsx`.
- `npm ci` reports about 25 dependency audit findings (1 critical). They have
  not been assessed.
- The UI build emits a Vite large-chunk warning (over 500 kB).
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
- Is browser local storage enough for the first demo version?
- What features beyond the first game-list workflow are in scope for the
  private app and for the demo?
