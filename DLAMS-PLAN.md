# DLAMS plan

Last updated: 2026-10-17

The current state of the project. For why things are the way they are, see
[`docs/decisions.md`](./docs/decisions.md). For the full history up to
2026-10-09, see [`docs/archive/`](./docs/archive/).

## Where we left off (2026-10-17)

Start here in a new session. This block is rewritten at the end of a session,
never appended to.

- **State.** The demo role, read-only sharing, owner-scoped console labels
  with comboboxes, and the collection-name page heading were pushed and
  deployed on 2026-10-17. On the Pi, `alembic current` reports
  `b8e1d6a42c07 (head)` (owner-reported), and the owner confirmed on a
  test account that "Make demo" works and a demo account's write is
  refused with 403. Checked locally the same day: 52 backend unit tests pass,
  and the UI `tsc -b`, lint, and build pass. The owner commits and
  pushes everything themselves, so run `git status` before assuming what is
  committed. The dev database was reset on 2026-10-16 and the admin
  re-bootstrapped.
- **Done 2026-10-17.** Removed the dead `grant` unpacking and the double access
  lookup in the collection routes (new `get_collection_with_access`
  dependency); simplified the video-game stats query to one query; validate a
  game's name before creating its label; a case-only change to a console label
  now renames the label (with a test); a console's game count now covers its
  label across all the owner's collections (with a test); the combobox popup renders inside its
  drawer through a `container` ref (after trying a handler, a wrapper, and an
  inline list, see `docs/decisions.md`).
- **Manual check done on production (owner-reported, 2026-10-17).** The owner
  confirmed the deployed functionality there, in place of a dev-stack pass.
- **Demo account (owner-reported, 2026-10-17).** `demo-user` exists in
  production as a regular user with initial data entered. The owner will
  switch it to the `demo` role right before go live. Do not share the demo
  link before that switch.
- **Demo sign-in (2026-10-17).** The login page shows a "Try the demo" button
  when `VITE_DEMO_USERNAME` and `VITE_DEMO_PASSWORD` are set at build time.
  The deploy workflow sets them from the `DEMO_PASSWORD` GitHub secret (added
  by the owner) and a fixed `demo-user` username. The owner confirmed the
  button works locally. It has not been tried on production yet, since it
  needs a push. The selected collection in the sidebar now has a teal accent
  bar on its right edge (`teal` is a theme color in `index.css`).
- **Next, in order:** push and try the demo button on production, then code
  work: the mobile styling pass (item 4, needs
  the owner's go-ahead and scope), CI plus light frontend tests (item 5, needs
  approval to install packages), README and screenshots (item 6).
- **Waiting on the owner:** styling scope, and package approval for the test
  tooling.
- **Things to remember about the code.** Generated shadcn files are reviewed
  after each install and not edited by hand, except that `combobox.tsx` has a
  local `container` prop on `ComboboxContent` so a combobox popup renders
  inside its drawer (see `.github/copilot-instructions.md`); the CLI writes
  `import { cn } from "cn"` and that is accepted. A raw `<button>` cleanup
  (about 15 places) and the create-collection drawer's form buttons are left
  for the styling pass.
- **How the owner likes to work:** one decision per message; confirm when a
  reply is ambiguous or has two parts. For commands on the Pi, give one
  command per code block and wait for the output (multi-line pastes have
  garbled in the owner's terminal). Do not offer to commit or push.

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
with one concrete next step. At the end of a session, rewrite "Where we left
off".

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
  invitations, created from a sidebar drawer), login/logout with an HTTP-only
  cookie, global roles `user` and `admin`, admin user management
  (`/admin/users`: deactivate and reactivate), and a CLI to bootstrap the
  first admin (`python -m app.auth.bootstrap_admin`).
- **Operations:** nightly database backup on the host with a tested restore
  (see Known issues for its limits).
- **Collections and access:** users own multiple typed collections (type
  `video_game` only). Owners share a collection read-only with other users
  (deployed 2026-10-17: previously there were also `edit` and
  `demo` grant modes). Only the owner writes; global admin has no implicit
  collection access.
- **Video games:** console labels, physical console records, and game
  records, with full CRUD in the API and UI.
- **UI:** left sidebar with collection rows and counts, right-side drawers
  for forms, URL-backed collection selection, TanStack Query for all server
  state.

**Deployed 2026-10-17**

- **Demo role:** a `demo` global role, "Make demo" and "Make regular" in
  "Manage users", and a check in `get_current_user` that rejects every
  non-`GET`/`HEAD`/`OPTIONS` request from a demo account. The UI hides write
  controls from demo accounts. Migration `c91e5f7a2b64` widens the role
  constraint.
- **Read-only sharing:** a grant means "this user can read this
  collection"; the `edit` and `demo` grant modes and the update-grant
  endpoint are gone. Only owners write.
- **Owner-scoped console labels:** labels belong to the collection's owner and
  are shared across their collections; consoles and games each have a
  `collection_id`. The console and game forms use a searchable combobox
  ("Console label" / "Console") with an `Add "name"` row when nothing matches
  exactly. `GET /console-labels` lists the user's labels. Migration
  `b8e1d6a42c07` recreated the affected tables, deleting their rows (the
  owner had nothing to keep). Decision in `docs/decisions.md`.

**Not implemented**

- Sharing UI (add and remove who a collection is shared with).
- Browser-local editing for demo accounts (a demo account sees a read-only UI
  today).
- The `demo` role on `demo-user` in production (the account and its data
  exist as a regular user; the switch is the go-live step, see
  `dlams-deployment/README.md`, "Demo account").
- Item types other than video games.

**Verification baseline**

- API (2026-10-17): 52 unit tests pass (run on Python 3.13, the project's
  version, in a scratch venv outside the repo), including a check that every
  write route requires a signed-in user. Migrations `c91e5f7a2b64` and
  `b8e1d6a42c07` were applied to production on 2026-10-17 (`alembic current`
  showed `b8e1d6a42c07 (head)`, owner-reported). The downgrades have not been
  run against a real database.
- UI (2026-10-17): `npm run build`, `tsc -b`, and `npm run lint` pass
  (`react-refresh/only-export-components` is off under `src/components/ui/`
  because that folder is generated; the unused `children` in
  `ComboboxChipsInput` in `combobox.tsx` was removed by hand with the
  owner's one-off permission, so a reinstall of the combobox brings the lint
  error back). Owner-reported on production, 2026-10-17: "Make demo" on a test
  account, a write from that account refused with 403, the collection list
  unchanged, and no write controls in its UI.
- Production routing and the automated deploy pipeline were exercised
  end to end by the owner (2026-10-09).
- Manual browser pass (2026-10-12, owner-reported): collection and
  console/game flows across owner, `edit`, `view-only`, and `demo` access
  worked as expected (before the sharing and label changes of 2026-10-16). Phone-width observations were not reported.

## Milestone: portfolio-ready

The next goal, set 2026-10-14: a state good enough to link from the owner's
portfolio site and show to potential employers, reached as soon as possible.
Items 1 to 6 under "Next up" are the path; the rest waits. See
`docs/decisions.md` for why.

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
  clean, and the demo account can make only `GET` requests (a write attempt
  with its credentials is rejected, checked by hand).

Explicitly not required for this milestone: the sharing UI,
browser-local demo editing, the demo sharing walkthrough, further item types,
user deletion, off-device backups, and the deferred API dependency upgrades.

## Next up

In order. Items 1 to 6 are the path to the portfolio milestone.

1. **Deploy the demo role, read-only sharing, and owner-scoped labels.**
   Done 2026-10-17: migrations `c91e5f7a2b64` and `b8e1d6a42c07` are applied
   on production and a demo account's write was refused. See
   `docs/decisions.md`.
2. **Provision the demo account and its content.** Mostly done 2026-10-17
   (owner-reported): `demo-user` is registered in production with initial
   data. Remaining: switch it to `demo` in "Manage users" right before go
   live (switch it back to `user` to edit later; steps in
   `dlams-deployment/README.md`, "Demo account"), and redo the backup restore
   test now that content exists. Deleting a user is deferred.
3. **Demo sign-in on the login page.** Built 2026-10-17 and working locally
   (owner-confirmed); it needs a push and a check on production. A "Try the
   demo" button signs in as the demo user through the normal login, using
   build-time variables fed from the `DEMO_PASSWORD` GitHub secret. Demo
   credentials are public by design and carry no authority (see
   `docs/decisions.md`).
4. **Mobile-friendly styling pass** across the whole UI (sidebar and drawers
   in particular). This is the owner's styling pass, so it needs the owner's
   go-ahead and scope before any CSS or Tailwind change. For the milestone,
   scope it to the screens a visitor sees; the rest can follow. When done,
   mark the styling pass status in `.github/copilot-instructions.md`.
5. **Automated checks: CI plus light frontend testing.** The CI workflow
   (`.github/workflows/ci.yml`, GitHub-hosted runner, separate from the deploy
   workflow) is written 2026-10-17 and has not run on GitHub yet. It runs lint
   and build (the build includes the type check) for the UI, and the backend
   tests. Check its first run after the push. It does not gate the deploy.
   Still to do: add light frontend testing in
   the spirit of "write tests, not too many, mostly integration": a few tests
   that render real flows and assert on what a user sees. Vitest with React
   Testing Library and MSW for integration tests, plus a handful of
   Playwright end-to-end checks across owner, shared (read-only), and demo
   access. Skip per-component and per-hook unit tests. Needs the owner's
   approval to install packages. Backend tests stay on `unittest`.
6. **README, screenshots, and a final check.** Rewrite the root `README.md`
   as the front door (see the milestone), take screenshots after the styling
   pass, run a secrets scan, switch `demo-user` to the `demo` role and confirm
   a write is refused, and click through the live demo on a phone and a
   desktop. Then share it.

After the milestone:

7. **Sharing UI.** A full-page "Shared with" screen where a collection owner
   adds a user by username and removes users. Sharing is read-only, so there
   is no access-mode control.
8. **Browser-local demo editing** with reset. It waits on the open questions
   below.
9. **Demo sharing walkthrough.** After signing in as `demo-user`, a visitor
   opens the sharing area and clicks "Share my collection"; a "View the app
   as the shared user" button then appears. It signs in as a second demo
   account, `demo-shared`, through the normal login (no session-swap
   endpoint and no special cases; its credentials are public like
   `demo-user`'s). `demo-shared` holds a real, fixed view-only grant on the
   demo collection, and the visitor's browser-local edits are applied to what
   it shows. All sharing is read-only, so no sharing form has an access-mode control. The share action is simulated in
   the browser, because all visitors share one server state. Depends on the
   sharing UI (7) and browser-local demo editing (8). Proposed
   2026-10-14.
10. **Further item types**, after the shared-fields question is settled.

## Known issues

- A push to `main` deploys even if CI fails, because the deploy workflow does
  not wait for CI. Decide whether to gate the deploy on it later.
- The UI build emits a Vite large-chunk warning (about 647 kB on 2026-10-17,
  over the 500 kB limit) since the Combobox added `@base-ui/react` (2026-10-16).
  It was clear after the earlier dependency cleanup. Code-splitting would fix
  it; not urgent.
- Backups stay on the Pi (decided 2026-10-15): a nightly dump runs at 03:15
  and keeps 14 days in `~/dlams-backups` on the host, but there is no
  off-device copy, so losing the Pi's storage loses the backups with the
  database. Accepted for now. The restore test passed on 2026-10-15 against a
  database with 2 users and no collections or games; redo it once the demo
  content exists.
- Dependency audit (2026-10-12): `npm audit` on `dlams-ui` reports 0
  vulnerabilities. `pip-audit` on `dlams-fastapi/requirements.txt` reports 27
  advisories in 10 packages (starlette, cryptography, pyasn1, ecdsa, anyio,
  and others); it gives no severity. Reading the advisories against the code,
  none appear reachable from the network given how the app uses these
  packages (HS256-only JWTs, no form or file uploads, no static-file serving
  from the API). Several have no fixed version (`ecdsa`, `python-jose`).
  Upgrading is deferred (decided 2026-10-12) and is a separate, explicitly
  requested change because FastAPI 0.115.12 requires `starlette<0.47`.
- `make test` needs `dlams-fastapi/.venv`, which does not exist on the
  owner's machine. Backend tests have been run in a scratch virtual
  environment outside the repo: `python3 -m venv <dir>`, then
  `<dir>/bin/pip install -r dlams-fastapi/requirements.txt`, then from
  `dlams-fastapi/`: `SECRET_KEY=test <dir>/bin/python -m unittest discover -s
  tests`. Creating the venv installs packages, so ask first.
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
  changes the source demo collection or stops sharing it?
- What fields are shared by every item type, and how should type-specific
  metadata be modeled? Compare schema options before choosing an inheritance
  strategy, and choose stable names for categories and item types.
- Deferred: what should deleting a user do to the collections, consoles, and
  games they own, and to invitations they issued? Decide before building
  delete; backups exist only on the Pi, so a hard delete is hard to undo.
- Should collection owners, not only admins, be able to invite someone with a
  grant on their own collection attached?
- Is browser local storage enough for the first demo version? If the overlay
  needs a client store, `zustand` with its `persist` middleware is a candidate
  (it was removed on 2026-10-14 because nothing used it); a small
  `useSyncExternalStore` hook is the dependency-free alternative. Decide with
  the overlay design, not before.
- What features beyond the first game-list workflow are in scope for the
  private app and for the demo?
