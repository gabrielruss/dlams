# DLAMS plan

Last updated: 2026-10-26

The current state of the project. For why things are the way they are, see
[`docs/decisions.md`](./docs/decisions.md). For the full history up to
2026-10-09, see [`docs/archive/`](./docs/archive/).

## Where we left off (2026-10-26)

Start here in a new session. This block is rewritten at the end of a session,
never appended to.

- **Start here (2026-10-26).** The mobile pass is done: the owner checked the
  mobile changes in a browser and pushed them (owner-reported, 2026-10-26: "looks
  good"). The styling pass status in `.github/copilot-instructions.md` is now
  **complete**, so ask before any styling change. Not recorded yet: the CI
  the live login page
  and favicon, and whether tapping the already-selected collection in the
  phone menu closes the menu. Next is item 5 (frontend tests), which needs
  package approval.
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
- **Done 2026-10-18.** Login branding: the faint "DON'T LOOK AT MY STUFF"
  text fills the login background (DON'T turned sideways on the left, in
  `red` at 15%; LOOK / AT MY / STUFF stacked beside it, centered as one
  group, in Półtawski Nowy), and the login card is 80%
  opaque. The sidebar header is now a `D.L.A.M.S.` wordmark (Półtawski Nowy,
  the first D and its period in `red`, the rest in the text color) fitted to
  the old header height. Fira Code is now the app font. `teal` and `red` are
  theme colors in `index.css`. The unused `children` in `ComboboxChipsInput` was removed so
  lint passes. The favicon is the red D. See `docs/decisions.md`.
- **Mobile pass, code done 2026-10-23.** Pushed 2026-10-18 and checked by the
  owner in a browser's device mode (owner-reported): below `md` the sidebar is
  a top bar with a menu button that opens a left drawer (creating a collection
  from inside it closes both drawers), and the login page puts the logo above
  a vertically centered card, shrunk to fit. Done 2026-10-23, local only
  (`tsc -b`, lint, and build pass; not yet looked at in a browser): page
  padding is 16px below `md`, headings are `text-2xl` below `md`, and the small
  bordered Edit, Delete, and Close buttons are taller below `md`. The admin
  users table was checked by reading the code and left as is (see Known
  issues). Remaining: the owner's own pass through the screens on a phone.
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
  button works locally, then pushed and reported everything working
  (2026-10-18). The selected collection in the sidebar had a teal accent bar
  on its right edge; since 2026-10-27 it is a `red` bar (see
  `docs/decisions.md`).
- **Next, in order:** finish the accessibility audit (item 6: contrast,
  keyboard, drawers, 200% zoom, phone menu); the shadcn-everywhere cleanup
  (item 6a, needs the owner's styling go-ahead and possibly `select` and
  `checkbox` installs); Playwright end-to-end checks if wanted (needs package
  approval); README and screenshots (item 7), whose final check includes
  switching `demo-user` to the `demo` role.
- **Test tooling (2026-10-26).** Vitest, jsdom, React Testing Library,
  `user-event`, `jest-dom`, and MSW are installed and wired (`npm test` in
  `dlams-ui`). Six tests exist: `src/pages/Login.test.tsx` (wrong password
  shows the API's message; "Try the demo" lands on the collection with no
  "New collection" button) and `src/components/video-games/VideoGamesWorkspace.test.tsx` (an owner sees the
  add, edit, and delete controls; a shared user sees the games and none of
  them), plus an axe check on the login page and on the collection view. `npm test`, lint, and build pass (run
  2026-10-26). `ci.yml` runs `npm test` between lint and build; the owner reported
  CI ran and passed (2026-10-26). Uncommitted. The planned frontend tests are
  in place; Playwright end-to-end checks are still to do.
- **Waiting on the owner:** whether to take the `zod` fix (`npm audit fix`).
- **Things to remember about the code.** Generated shadcn files are reviewed
  after each install, and edits to them need the owner's approval; the local
  edits to `combobox.tsx` (a `container` prop, the removed unused `children`,
  and an `aria-label` on the trigger) are listed in
  `.github/copilot-instructions.md` and must be re-applied after a reinstall; the CLI writes
  `import { cn } from "cn"` and that is accepted. A raw `<button>` cleanup
  (about 15 places) and the create-collection drawer's form buttons are left
  for the styling pass. In our own components never use the `cn` helper (it is
  for shadcn files only) and do not add code comments. Fonts come from
  `@fontsource-variable` packages (Fira Code for the app, Półtawski Nowy for
  the logo only); `teal` and `red` are theme colors in `index.css`.
- **How the owner likes to work:** one decision per message; confirm when a
  reply is ambiguous or has two parts. For commands on the Pi, give one
  command per code block and wait for the output (multi-line pastes have
  garbled in the owner's terminal). Do not offer to commit or push. Ask
  before any styling change, but the owner's direct request counts as the
  go-ahead for that change; when a design choice is open, give a
  recommendation and one question rather than several.

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
Items 1 to 7 under "Next up" are the path; the rest waits. See
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
- **Accessible.** An accessibility audit of the screens a visitor sees has
  been done and its findings fixed or recorded (Next up, item 6).
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

In order. Items 1 to 7 are the path to the portfolio milestone.

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
3. **Demo sign-in on the login page.** Done 2026-10-18 (owner-reported
   working on production after the push). A "Try the
   demo" button signs in as the demo user through the normal login, using
   build-time variables fed from the `DEMO_PASSWORD` GitHub secret. Demo
   credentials are public by design and carry no authority (see
   `docs/decisions.md`).
4. **Mobile-friendly styling pass** across the whole UI (sidebar and drawers
   in particular). This is the owner's styling pass, so it needs the owner's
   go-ahead and scope before any CSS or Tailwind change. For the milestone,
   scope it to the screens a visitor sees; the rest can follow. When done,
   mark the styling pass status in `.github/copilot-instructions.md`. Plan
   Code is done: below `md` the sidebar is a top bar with a menu button that
   opens the sidebar contents in a left drawer (picking a collection closes
   it); the login logo sits above a centered card; smaller padding and
   headings; taller small buttons. The admin users table scrolls sideways
   inside its box and was left as is. The idea of reusing the login backdrop
   behind the whole app was dropped on 2026-10-18 in favor of the sidebar
   wordmark. Done 2026-10-26: the owner checked it in a browser and
   pushed it, and the styling pass status is marked complete.
5. **Automated checks: CI plus light frontend testing.** The CI workflow
   (`.github/workflows/ci.yml`, GitHub-hosted runner, separate from the deploy
   workflow) is written 2026-10-17 and was pushed 2026-10-18; check the Actions tab for
   its status. It runs lint
   and build (the build includes the type check) for the UI, and the backend
   tests. Check its first run after the push. It does not gate the deploy.
   Still to do: add light frontend testing following Kent C. Dodds'
   "Write tests. Not too many. Mostly integration."
   (https://kentcdodds.com/blog/write-tests; rules in
   `.github/copilot-instructions.md`, "Testing"): a few tests
   that render real flows and assert on what a user sees. Vitest with React
   Testing Library and MSW for integration tests, plus a handful of
   Playwright end-to-end checks across owner, shared (read-only), and demo
   access. Skip per-component and per-hook unit tests. Needs the owner's
   approval to install packages. Backend tests stay on `unittest`.
6. **Accessibility audit.** Do it after the styling pass and before
   publishing, on the screens a visitor sees (login, sidebar, collection
   workspace, drawers). Run an automated check (axe or Lighthouse), then
   check by hand: keyboard-only use with visible focus, a screen reader pass,
   color contrast at both phone and desktop widths, and zoom to 200%. Finding
   from 2026-10-17: the default input border was about 1.2:1 against the card,
   below the 3:1 that WCAG 1.4.11 asks of form-field boundaries; fixed
   2026-10-27 (see below). The login backdrop
   is decorative and hidden from screen readers; its card text measured
   about 19:1 at 80% opacity (computed, not tested in a browser). Started
   2026-10-26: `vitest-axe` runs in the test suite (`expectNoViolations` in
   `dlams-ui/src/test/axe.ts`) on the login page and the owner's collection
   view, and both report no violations. Later the same day axe was added to the
   New collection, Add console, Add game, and phone-menu drawers and to the admin
   users page and invite drawer; those report no violations except one finding
   (below). jsdom has no layout, so the
   color-contrast rule is switched off there and contrast must be checked in a
   real browser; the drawers, the admin page, and the phone-menu drawer are not
   covered yet. Record the findings and fixes here.

   **Fixed finding (2026-10-26):** the dropdown-arrow button inside the console
   combobox (Add console and Add game drawers) had no accessible name (axe
   `button-name`). Fixed with an `aria-label` on `ComboboxTrigger` in the
   generated `components/ui/combobox.tsx`, with the owner's approval.

   **Firefox accessibility tree, desktop width (owner-pasted, 2026-10-26;
   structure only, so no contrast, focus, or drawers).** Good: the sidebar is a
   named `complementary` with a `navigation` and `main`; headings run h1 then
   h2; lists are real lists; the selected collection exposes pressed and
   current; the login backdrop logo is not in the tree; every input has a label
   name. Findings, all fixed 2026-10-26 (owner-approved; `npm test`, lint, and
   build pass; re-checked in Firefox by the owner the same day, see below):
   1. The login page had no `main` landmark and no heading ("Login" is a
      `div`); Register the same. Fixed: both pages use `<main>`, and the card
      title has `role="heading" aria-level={1}` (`CardTitle` is a generated
      `div`). Tests assert both, because axe on a container skips page-level
      rules.
   2. The Login inputs had no `autocomplete`. Fixed: `username` and
      `current-password`.
   3. Every console and game row had buttons named just "Edit" and "Delete".
      Fixed with `aria-label` ("Edit Halo 3"); the visible text is unchanged.
   4. Not accessibility: console rows said "1 games". Fixed.

   **Contrast, computed from the light-theme tokens in `index.css` (2026-10-27;
   a calculation, not a browser test, so confirm in Lighthouse or Firefox).**
   The pasted accessibility trees contain no color data and cannot show
   contrast.
   - Fails: the sidebar "owner" badge (`text-muted-foreground` on `bg-muted`,
     `text-xs`) is about 4.35:1 against the 4.5:1 AA needs. Default input
     border on white is about 1.23:1 against 3:1 (the known finding). The teal
     selected-collection bar on the sidebar was about 2.42:1 against 3:1, and
     the owner confirmed (2026-10-27) it is the only visible cue for the
     selected collection (the text colors are near-identical). Fixed the same
     day by making the bar `red` (5.23:1 on the sidebar).
   - Passes: muted text on the sidebar (about 4.55:1) and on white (about
     4.77:1), though both are close to the line; `red` on white (about 5.48:1).
   - Dark theme tokens exist but nothing in the app code turns dark mode on,
     so they were checked only for reference (all pass).
   Owner-reported 2026-10-27: Firefox's contrast check flags 3 text leaves,
   all the "owner" badge text (one per collection), which matches the badge
   result above. The owner also reported one badge appearing grey with no text
   in it; it went away on its own and was put down to a browser glitch (the
   badge renders `collection.access` in `CollectionNavigation.tsx`, so it
   cannot be empty unless the API sends an empty value).
   **Fixed 2026-10-27 (owner-approved; calculated ratios, not yet re-checked
   in a browser):** in `index.css` (light theme only) `--muted-foreground`
   went from L 0.554 to 0.52 and `--input` from L 0.929 to 0.65. The badge is
   now 5.02:1, other muted text 5.26:1 on the sidebar and 5.50:1 on white, and
   the input border 3.23:1. The sidebar access badge is now a black pill with
   white text (20.17:1; see `docs/decisions.md`), which replaces its grey-badge
   ratio. The selected-collection bar is now red. Side
   effect to look at: `--ring` is unchanged at 2.63:1, so an input's focused
   border (`border-ring`) is now lighter than its resting border; the 3px focus
   glow still shows. Darkening `--ring` would fix it and would also darken
   every focus ring, so it was left for the owner to decide after seeing it.
   Re-run Lighthouse or Firefox's contrast check to confirm.

   Firefox re-check (owner-pasted trees, 2026-10-27): confirmed items 1, 3, and
   4. The login page now has a `main` and a level 1 "Login" heading, and the row
   buttons read "Edit Playstation 2 — Original Grey", "Delete NHL 11", and so on,
   with "1 game" singular. Item 2 (`autocomplete`) cannot be seen in that tree;
   it is in the source only. Nothing new was found. The raw `<button>`s ("Add
   console", "Add game", and the row Edit and Delete) have no custom focus
   style, so check their focus outline in the keyboard pass.
   Still to check by hand: contrast, keyboard, drawers, 200% zoom, phone menu.
6a. **Use the shadcn components everywhere (before go-live).** Scanned
   2026-10-27, nothing changed yet. This is a styling change, so it needs the
   owner's go-ahead and scope first. Installed in `components/ui/`: `button`,
   `card`, `combobox`, `drawer`, `form`, `input-group`, `input`, `label`,
   `table`, `textarea`. Raw HTML found in app code (outside `components/ui/`):
   - **17 raw `<button>`s** where `Button` should be used: the session Retry
     (`App.tsx`); the invite drawer's Close (`RegistrationInviteManager.tsx`);
     in `ConsoleManager.tsx` and `GameManager.tsx` each, the Add button, the
     drawer Close, two form buttons (submit and cancel), and the row Edit and
     Delete (6 each); in `CollectionNavigation.tsx` the collection row button,
     the drawer Close, and the create submit. The collection row button is a
     list-style toggle and may want `Button variant="ghost"` or to stay custom.
   - **5 raw `<input>`s** (4 text, 1 checkbox) in `ConsoleManager`,
     `GameManager`, and `CollectionNavigation`, where `Input` is used elsewhere
     (login, register, invite link).
   - **2 raw `<select>`s** (the condition fields in `ConsoleManager` and
     `GameManager`). No shadcn `select` is installed; the owner would run
     `npx shadcn@latest add select`. The checkbox has no shadcn component
     installed either (`checkbox`).
   - **8 raw `<label>`s** across the three drawer forms, where `Label` or
     `FormLabel` should be used. `Form`/`FormField` are used on login and
     register but the drawer forms use `react-hook-form` `register` directly.
   - `textarea` is installed but unused. `input-group` and `label` are only
     used inside the generated `combobox` and `form` files.
   Doing this also gives these controls the shadcn focus ring, which the
   keyboard check in item 6 flags as missing on the raw buttons. Re-run the
   tests afterward; the axe checks and the `Edit`/`Delete` name tests cover
   these screens.
7. **README, screenshots, and a final check.** Rewrite the root `README.md`
   as the front door (see the milestone), take screenshots after the styling
   pass, run a secrets scan, switch `demo-user` to the `demo` role and confirm
   a write is refused, and click through the live demo on a phone and a
   desktop. Then share it.

   **Secrets scan, run 2026-10-27 (read-only; no dedicated scanner was
   installed, so this was `git grep` and `git log -p` regex passes, not
   gitleaks or trufflehog).** Covered the working tree and all 82 commits on
   every branch, including the four `origin/emdash/*` branches (all contained
   in `main`).
   - Clean: no private keys, cloud or GitHub tokens, JWTs, or long hex or
     base64 secrets in any added line, ever. No `.env` with real values was
     committed (an old `dlams-ui/.env` held only an API URL, later `/api`). No
     public or LAN IP address appears in any commit. `.private/` and the
     `.env` files are git-ignored and untracked.
   - The only credentials in the repo are public defaults or placeholders:
     `dlams_password` and `dlams_user` (compose defaults; the production
     database password was changed, per the private notes), `dlams_dev` (dev
     stack), `local-development-only-secret`, and `change-me-...`. Two bcrypt
     hashes of throwaway test passwords sit in early `auth/routes.py`
     commits (a fake user and `testpass123`); not in the current tree.
   - Known and accepted (private notes, item 6): early commits describe the
     Pi layout and the old leaked `.env` (no secret value is quoted), and
     history was not rewritten.
   - Fixed 2026-10-27: the `.env.example` missing newline (item 4 below), and
     `docs/decisions.md` now says the domain is public by design (item 3).
   - Not clean, owner to decide: (1) the owner's local OS username appears in
     a `DATABASE_URL` in `app/db.py` in two September 2025 commits (no
     password); (2) commit metadata carries two personal email addresses
     (76 and 6 commits); (3) `nginx.conf` names the production domain, though
     `docs/decisions.md` says the domain is not written in tracked files. The
     README will link the live demo anyway, so that decision likely needs
     updating rather than the file; (4) a real bug: in
     `dlams-deployment/.env.example`, `POSTGRES_DB=dlams_db` and
     `SECRET_KEY=...` are on one line (a missing newline), so copying the file
     gives no `SECRET_KEY`.
   - Not done: a second opinion from a real scanner (gitleaks or trufflehog;
     needs an install the owner approves), and the demo-account check (a write
     with its credentials gets a 403), which waits for the role switch.

After the milestone:

8. **Sharing UI.** A full-page "Shared with" screen where a collection owner
   adds a user by username and removes users. Sharing is read-only, so there
   is no access-mode control.
9. **Browser-local demo editing** with reset. It waits on the open questions
   below.
10. **Demo sharing walkthrough.** After signing in as `demo-user`, a visitor
   opens the sharing area and clicks "Share my collection"; a "View the app
   as the shared user" button then appears. It signs in as a second demo
   account, `demo-shared`, through the normal login (no session-swap
   endpoint and no special cases; its credentials are public like
   `demo-user`'s). `demo-shared` holds a real, fixed view-only grant on the
   demo collection, and the visitor's browser-local edits are applied to what
   it shows. All sharing is read-only, so no sharing form has an access-mode control. The share action is simulated in
   the browser, because all visitors share one server state. Depends on the
   sharing UI (8) and browser-local demo editing (9). Proposed
   2026-10-14.
11. **Further item types**, after the shared-fields question is settled.

## Known issues

- On a phone, the admin users table scrolls sideways inside its bordered box,
  and the Make demo and Deactivate buttons are in the last column, so an admin
  swipes right to reach them. Checked by reading the code on 2026-10-23, not
  in a browser. Left as is (admin-only, not on the visitor path). The cheap
  fixes are hiding the Created column below `md` or stacking each user as a
  card.
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
- Frontend test tooling was installed 2026-10-26 and has six tests, including `vitest-axe` accessibility checks (added 2026-10-26). `npm audit` reports 4
  vulnerabilities after the install: `vitest`/`@vitest/mocker` and `tinypool`
  (dev-only; the fix is a downgrade to Vitest 2.0.5) and `zod` (runtime; `npm
  audit fix` resolves it). Upgrades are deferred. Backend tests use `unittest`; Ruff and
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
