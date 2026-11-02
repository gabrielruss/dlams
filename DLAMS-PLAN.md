# DLAMS plan

Last updated: 2026-10-31

The current state of the project. For why things are the way they are, see
[`docs/decisions.md`](./docs/decisions.md). For the full history up to
2026-10-09, see [`docs/archive/`](./docs/archive/).

## Where we left off (2026-10-31)

Start here in a new session. This block is rewritten at the end of a session,
never appended to. History lives in git and `docs/decisions.md`.

- **Status.** The portfolio-ready milestone is complete (2026-10-27).
  Sandbox demo sessions, read-only link sharing (item 8), and the
  consistency rules for new code are deployed: commit `54a4126` ("adding
  share funct"), owner-reported working on 2026-10-31 after a full manual
  check. Nothing is being built right now. The rest of the 2026-10-31
  session was planning: search is fully designed (item 8a) and the
  priority list changed (below). Those doc updates (`DLAMS-PLAN.md`,
  `docs/architecture.md`, `docs/decisions.md`) were uncommitted at the end
  of the session. Run `git status` and `git log` first: the owner commits
  and pushes everything, and a push to `main` deploys (docs included).
- **What is deployed, in short** (details in item 8 and the architecture
  doc):
  - Share links: up to 5 per collection from the Share drawer
    (`ShareCollectionDrawer.tsx`, `CreateLinkForm.tsx`, `ShareLinkRow.tsx`);
    the public page `/s/:token` (`pages/SharedCollection.tsx`) and
    `GET /shared/{token}`; Nginx rate limit and `noindex` / `no-referrer`.
  - Sandboxes live 7 days for their links; sign-out keeps them.
  - List rows open the edit drawer; `ListRow` is in
    `components/collections/` for any item type.
  - Consistency rules (decision "One way to write each thing"): installed
    shadcn components only, one form pattern, `Annotated` dependency
    aliases (`DbSession`, `CurrentUser`, `OwnedCollection`, ...),
    `select()` only, `extra="forbid"` on request schemas. Rules are in
    `.github/copilot-instructions.md`; older code is items 6a and 6d.
- **What is verified.** Run by Claude on 2026-10-31: 29 UI tests, lint, and
  build; 80 backend tests, `ruff check`, and `ruff format --check`.
  Owner-reported 2026-10-31: deployed, and a manual check of everything
  (share links in a private window, the deleted-link message, a sandbox's
  link after sign-out, the console and game click-through, CI's Ruff
  steps). Not run: Pylance after the `int | None` count fix in
  `create_link`. Earlier: backup restore test passed (2026-10-29).
- **Next, in order:**
  1. **Deploy picks up `nginx.conf` changes** (Known issues): workflow
     fixed in source 2026-11-01; confirm on the next deploy.
  2. **Search** (item 8a): designed, ready to build. Read 8a in full first.
     In short: always every owned collection (signed in); a new endpoint
     lists every owned item in one type-neutral shape with no query per
     row; one TypeScript matching function and search field serve both the
     signed-in search and the share link page (which filters its own
     lists); a "Search all collections" bar above the collection takes
     over the page on focus, with `?q=` in the URL; a result opens its
     collection with its editor open (`?collection=7&item=game-12`).
  3. **Edit and delete collections** (item 8b).
  4. Then: the manual accessibility audit (6), shadcn everywhere (6a),
     repeated styling (6b), styling cleanup (6c), backend consistency
     (6d), admins delete users (9a, replaces the wipe-sandboxes button),
     stats area (10c, moved up 2026-10-31), later sharing ideas (10a),
     color themes (10b), further item types (11), item images (12, added
     2026-10-31; do the dependency upgrades first), moving items between
     collections of the same type (13), and a duplicate item finder (14).
- **Waiting on the owner:** whether to take the `zod` fix
  (`npm audit fix`); in 6d, whether to drop the `response_model`s Ruff's
  FAST001 calls redundant; before 6a, running
  `npx shadcn@latest add select checkbox`.
- **Things to remember about the code.**
  - Tests sit beside the feature they cover. `renderApp(route)` in
    `dlams-ui/src/test/renderApp.tsx` renders the real app; register MSW
    handlers per test with `server.use(...)`; add an axe check with
    `expectNoViolations(container)`. An unhandled request fails the test, so
    any test that opens an owned collection needs a
    `GET /collections/1/links` handler (the Share button loads the links).
    Inside a Vaul drawer, use `element.focus()` and `user.keyboard(...)`
    instead of clicks: pointer events throw in jsdom. MSW mocks never return
    a 422, so they cannot catch a body a schema rejects.
  - Backend tests call route functions directly against SQLite, which does
    not enforce foreign keys; delete child rows explicitly (as
    `delete_sandbox` does) and test that. Routes take the collection from a
    dependency, so tests pass the collection in and test access rules on
    the dependency functions.
  - `_console_response` and `_game_response` run one label query per row;
    the search endpoint must not reuse them as they are (fix noted in 6d).
  - Share links are not an access level: `/shared/{token}` looks the token up
    and returns read-only data. `OwnedCollection` guards managing links, not
    reading them.
  - New code follows the conventions file even inside an unconverted file:
    shadcn components, the form pattern, `Annotated` aliases, `select()`,
    `extra="forbid"` on request schemas. The 6a grep (in that item) lists
    raw form elements; it found 30 on 2026-10-31, all older code.
  - Generated shadcn files need the owner's approval to edit (local edits to
    `components/ui/combobox.tsx` are listed in
    `.github/copilot-instructions.md`). The owner runs the shadcn CLI.
  - In our own components never use the `cn` helper, do not add code
    comments, and never use the owner's name in tests or fixtures (use
    `test-user`, `demo-user`).
  - Styling: ask before any styling change; the owner's direct request is the
    go-ahead (the search layout in 8a is approved). Destructive final
    actions are `<Button variant="outline" className="border-destructive
    text-destructive">`. `red` is the brand color (logo D,
    selected-collection bar). A console color theme was tried and reverted
    (item 10b holds the notes).
  - Backend: run `.venv/bin/ruff check .` and `.venv/bin/ruff format --check .`
    from `dlams-fastapi/` along with the tests; CI runs both.
- **How the owner likes to work:** one decision per message; give a
  recommendation and one question rather than several; the owner often edits
  UI wording directly, so read the current file before changing text and
  keep their wording; they like to see a change before committing to it and
  will revert freely, so keep changes small and easy to undo; prefer fewer
  features over messy code, and one consistent pattern over several. They
  like UX ideas weighed honestly and will push back with their own. They
  are newer to Python and SQLAlchemy than to JS, so JS comparisons help.
  For commands on the Pi, give one command per code block and wait for the
  output. Do not offer to commit or push. Docs stay trim, facts only.

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

**Committed 2026-10-30**

- **Ruff** lints and formats the backend in CI (`3a33b67`).

**Deployed 2026-10-31** (`54a4126`, owner-reported working)

- **Read-only link sharing:** up to 5 named links per collection from a
  Share drawer, a public read-only page at `/s/<token>`, and demo sandboxes
  kept 7 days so their links work. Item 8.
- **List rows open the editor;** Delete is in the edit drawer.
- **Consistency rules** for new code (shadcn components, one form pattern,
  backend dependency aliases and `select()`), with the branch's own code
  converted. Items 6a and 6d hold the rest.

**Not implemented**

- Sharing with a user by username has an API but no screen (item 10a).
- Search (designed 2026-10-31, item 8a; nothing built).
- Renaming or deleting a collection (item 8b).
- Deleting a user (admins can only deactivate; item 9a).
- Item types other than video games.
- Item images (item 12).
- Moving items between collections (item 13) and finding duplicates (item 14).

**Verification baseline**

- UI (2026-10-31, run by Claude): `npm test` passes (29 tests: login, the demo
  session button, the owner and shared access views, the share-link drawer,
  the admin page, and axe
  checks on the login, register, collection,
  admin, and drawer screens), and `npm run lint` and `npm run build` pass. CI (lint, `npm test`, build, backend tests) passed on
  push (owner-reported, 2026-10-26).

- API (2026-10-31, run by Claude in `dlams-fastapi/.venv`): 80 unit tests
  pass, including 15 for sandbox demo sessions (the copy, the 10-sandbox cap,
  expiry cleanup, the collection and item limits, blocked sharing, the
  template staying untouched, the 7-day lifetime, which sandbox a full demo
  replaces, and sign-out keeping the sandbox), 5 for the admin
  password reset, 9 for share links (including that every link and grant
  route declares `get_owned_collection`), and 3 for the shared-collection
  route. Ruff check and format pass.

- Backup restore (2026-10-29, owner-run, output pasted): the 2026-10-29 03:15
  dump restored into a scratch database with 3 users, 3 collections, 6
  consoles, and 6 games at migration `b8e1d6a42c07`, the same counts as
  production. The scratch database was dropped.

- API (2026-10-17): 52 unit tests pass (run on Python 3.13, the project's
  version, in a scratch venv outside the repo), including a check that every
  write route requires a signed-in user. Migrations `c91e5f7a2b64` and
  `b8e1d6a42c07` were applied to production on 2026-10-17 (`alembic current`
  showed `b8e1d6a42c07 (head)`, owner-reported). The downgrades have not been
  run against a real database.
- UI (2026-10-17): owner-reported on production: "Make demo" on a test
  account, a write from that account refused with 403, the collection list
  unchanged, and no write controls in its UI. (`react-refresh/only-export-components`
  is off under `src/components/ui/` because that folder is generated.)
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

**Status: complete, 2026-10-27 (owner's call).** The phone and desktop
click-through was not separately reported. The restore test was redone
2026-10-29 and passed.

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
  the live demo, summarizes the stack and architecture
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
   data. Switched to the `demo` role by 2026-10-27 (owner-reported; switch it
   back to `user` to edit its content later, steps in
   `dlams-deployment/README.md`, "Demo account"). The backup restore
   test was redone with the content on 2026-10-29 and passed. Deleting a user
   is deferred.
3. **Demo sign-in on the login page.** Done 2026-10-18 (owner-reported
   working on production after the push). A "Try the
   demo" button signs in as the demo user through the normal login, using
   build-time variables fed from the `DEMO_PASSWORD` GitHub secret. Demo
   credentials are public by design and carry no authority (see
   `docs/decisions.md`). **Replaced 2026-10-29** by sandbox demo sessions
   (item 9): the button calls `POST /demo-sessions` and no credentials are in
   the bundle.
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
   workflow) runs lint, `npm test`, and build (which type-checks) for the UI,
   and the backend tests; it passed (owner-reported, 2026-10-26). It does not
   gate the deploy. Frontend testing follows Kent C. Dodds' "Write tests. Not
   too many. Mostly integration." (https://kentcdodds.com/blog/write-tests;
   rules in `.github/copilot-instructions.md`, "Testing"): Vitest, React
   Testing Library, and MSW, with tests beside the features they cover. Done
   2026-10-26: 14 tests across login, owner and shared access, the admin page,
   and axe checks. Still optional: a handful of Playwright end-to-end checks
   across owner, shared (read-only), and demo access (needs the owner's
   approval to install packages). Backend tests stay on `unittest`.
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
   users page and invite drawer, and the Register page; all report no
   violations after the fixes below. jsdom has no layout, so the
   color-contrast rule is switched off there and contrast is calculated from the
   theme tokens or checked in a real browser. Still open: the hands-on keyboard
   pass, 200% zoom, and the phone menu. Record the findings and fixes here.

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
   2026-10-27; rescanned 2026-10-31. New code must already use them (owner,
   2026-10-31; rule in `.github/copilot-instructions.md`, "Frontend"), and the
   `add-share` branch's new elements were converted (Share drawer, the drawer
   Delete buttons, `ListRow` as `Button variant="ghost"`). Converting the older
   ones is a styling change, so it needs the owner's go-ahead and scope first.
   Installed in `components/ui/`: `button`, `card`, `combobox`, `drawer`,
   `form`, `input-group`, `input`, `label`, `table`, `textarea`.
   **Consistency check** (run it for this item and before each push that
   touches the UI; it should print nothing once 6a is done), from
   `dlams-ui/`:
   `grep -rnE '<(button|input|label|select|textarea)([ >]|$)' src --include='*.tsx' | grep -v 'src/components/ui/' | grep -v '\.test\.tsx'`.
   Raw HTML it found on 2026-10-31 (outside `components/ui/`):
   - **13 raw `<button>`s** where `Button` should be used: the session Retry
     (`App.tsx`); the invite drawer's Close (`RegistrationInviteManager.tsx`);
     in `ConsoleManager.tsx` and `GameManager.tsx` each, the Add button, the
     drawer Close, and the form's submit and cancel (4 each); in
     `CollectionNavigation.tsx` the collection row button, the drawer Close,
     and the create submit. The collection row button is a list-style toggle;
     `Button variant="ghost"` as in `ListRow` likely fits.
   - **5 raw `<input>`s** (4 text, 1 checkbox) in `ConsoleManager`,
     `GameManager`, and `CollectionNavigation`, where `Input` is used elsewhere
     (login, register, invite link, share drawer).
   - **2 raw `<select>`s** (the condition fields in `ConsoleManager` and
     `GameManager`). No shadcn `select` is installed; the owner would run
     `npx shadcn@latest add select`. The checkbox has no shadcn component
     installed either (`checkbox`).
   - **10 raw `<label>`s** across the three drawer forms and the invite
     drawer, where `Label` or `FormLabel` should be used. `Form`/`FormField`
     are used on login and register but the drawer forms use
     `react-hook-form` `register` directly. Convert them to the form pattern
     in `.github/copilot-instructions.md` ("Frontend", decided 2026-10-31):
     a zod schema plus `Form`/`FormField`.
   - `textarea` is installed but unused. `input-group` is only used inside
     the generated `combobox`.
   Doing this also gives these controls the shadcn focus ring, which the
   keyboard check in item 6 flags as missing on the raw buttons. Re-run the
   tests afterward; the axe checks and the `Edit`/`Delete` name tests cover
   these screens.
6b. **Identify repeated component styling** (owner, 2026-10-31; after 6a).
   Read-only first: list the Tailwind class strings repeated across
   components, where each appears, and whether the behavior and meaning are
   also shared (the extraction rule in `.github/copilot-instructions.md`,
   "Frontend"). Propose which to extract into a component and which to leave;
   the owner picks. Seen so far, not yet counted: the red-outline destructive
   `Button` (Share drawer, Delete console, Delete game), the drawer header
   with its Close button, and the bordered list section
   (`flex flex-col gap-4 rounded-lg border p-4`).
6c. **Styling cleanup** (owner, 2026-10-31; after 6a and 6b). A styling
   change, so the owner sets the scope first. Candidates: classes made
   redundant by the shadcn components (overrides that repeat a variant's own
   classes), one-off spacing, sizes, and text styles that differ between
   screens for no reason, and unused tokens (`teal` in `index.css`). Re-run
   the tests and the 6a consistency check afterward, and check the changed
   screens in a browser.
6d. **Backend consistency pass** (owner, 2026-10-31). The patterns are in
   `.github/copilot-instructions.md`, "Backend": `Annotated` dependency
   aliases, collection access through `permissions.py` dependencies, and
   `select()` only. Done 2026-10-31 on `add-share`: the aliases and
   `get_owned_collection` exist, and `collections/routes.py` (collections,
   grants, links), `shared_routes.py`, and `permissions.py` follow them.
   Still to do:
   - `video_games_routes.py`: 15 `db.query()` calls, `Depends(...)` defaults,
     and split it into console and game modules. The list helpers and
     routes (`collection_consoles`, `collection_games`, `list_consoles`,
     `list_games`) were converted 2026-10-31. Fix the extra query per row:
     `_console_response` and `_game_response` each query the row's label,
     so listing 30 games costs 31 queries; select the label with the row
     (`select(Console, ConsoleLabel).join(...)`) instead.
   - `app/auth/` (`routes.py`, `admin_routes.py`, the rest of `utils.py`):
     `Depends(...)` defaults to aliases, missing types.
   - `app/db.py`: `declarative_base()` to `DeclarativeBase`.
   - Turn on Ruff's `FAST` rules in `pyproject.toml`. Dry run 2026-10-31
     (`ruff check . --select FAST`): 67 findings. FAST002 (non-`Annotated`
     dependency) is the rule to keep. FAST003 is a false positive when a
     dependency reads the path parameter (`OwnedCollection`); ignore it.
     FAST001 flags `response_model` that repeats the return type; decide
     whether to drop those or ignore the rule (the conventions currently
     ask for `response_model`). Its fixes are unsafe and can reorder
     parameters the tests pass by position, so review and re-run the tests.
   - `extra="forbid"` on every request schema (decided 2026-10-31; only
     `LinkCreate` has it). The other ten: `LoginRequest`,
     `RegisterRequest`, `AdminUserRoleUpdate`, `AdminPasswordReset`
     (`auth/schemas.py`), `CollectionCreate`, `GrantCreate`
     (`collections/schemas.py`), `ConsoleCreate`, `ConsoleUpdate`,
     `GameCreate`, `GameUpdate` (`video_games_schemas.py`). For each, first
     compare the body the
     matching `dlams-ui/src/lib/api/` module sends: the UI tests mock the API
     with MSW and will not catch a 422, so an extra field would only fail in
     the real app. Then run both test suites and try each form in a browser.
7. **README and a final check.** Done 2026-10-27 (owner's call). The root
   `README.md` was rewritten as the front door (no screenshots: the live demo
   shows the app and there is nothing to keep current; see
   `docs/decisions.md`). `demo-user` is on the `demo` role and a write from it
   was refused with a 403 on the live site (owner-reported). The secrets scan
   is done (below). The backup restore test was redone 2026-10-29 and passed.
   Not separately reported: the phone and desktop
   click-through.

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
     needs an install the owner approves). The demo-account check (a write
     gets a 403) passed on the live site (owner-reported, 2026-10-27).

After the milestone. Items 9, 8, and 8a are the first follow-ups (owner
priority, 2026-10-27 to 2026-10-29), in that order: browser-local demo editing
is next, then the sharing UI, then search.

8. **Read-only link sharing. Done** (built 2026-10-30, deployed
   2026-10-31 in `54a4126`; owner-reported working). Design in
   `docs/decisions.md`, "Sharing by link, and seven-day demo sandboxes". Each
   step ships on its own:
   1. **Share links.** Deployed 2026-10-31. Backend:
      `CollectionLink` model and migration `a3d9f61c2b84` (`collection_links`,
      cascades from the collection; applied to production on the
      2026-10-31 deploy); `GET`, `POST`, `DELETE` under
      `/collections/{id}/links`, owner only, sandboxes included, at most 5;
      `delete_sandbox` deletes links first; 9 tests in
      `test_collection_links.py`. UI: a Share button on the selected
      collection's heading (owners, sandboxes included) opens
      `ShareCollectionDrawer` (with `CreateLinkForm` and `ShareLinkRow`):
      "Create read-only link" with an optional inline name (a zod schema,
      `schemas/collectionLinks.ts`, at most 50 characters), then each link with stacked "Copy link" and "Delete link" buttons;
      deleting asks first, and the confirm button reads "Don't Look At My
      Stuff"; links are `/s/<token>`, which step 2
      serves. "Copied" shows for 2 seconds and a screen-reader status says
      "Link copied"; the URL is shown only if copying fails. At 5 links the button
      gives way to a note. Under the Share button, small text reads "2 active
      links" (hidden at 0; it is the button's description for screen
      readers), from the same cached query the drawer uses; 9 tests. Until step 2 ships, a
      copied link opens nothing, so ship steps 1 and 2 together.
   2. **The link page.** Deployed 2026-10-31. `GET /shared/{token}`
      (`shared_routes.py`, public) returns the collection's name, type,
      consoles, and games through the same helpers as the signed-in lists
      (`collection_consoles`, `collection_games`); 3 tests. `/s/:token`
      (`pages/SharedCollection.tsx`) is routed before the session check: a
      sidebar with the wordmark, name, type, and counts; the read-only
      message; `ConsoleList` and `GameList`, which were split out of the
      managers so this page carries no edit code; 3 tests. Nginx rate limit
      and headers added; the config passed `nginx -t` with the certificate
      lines removed, not run on the Pi. Console rows no longer show a game
      count (removed from the API and UI 2026-10-30; see item 10c).
   3. **Seven-day sandboxes.** Deployed 2026-10-31.
      `SANDBOX_LIFETIME` is 7 days and `SANDBOX_SESSION` 30 minutes; a full
      demo deletes the oldest sandbox past its session, one without links
      first (`_sandbox_to_replace`), else answers "busy"; `logout` is back to
      only clearing the cookie. The demo notice now says the visitor can't
      get back after signing out or 30 minutes, and links keep working for
      7 days. 15 sandbox tests.
8a. **Search** (owner wants it "pretty quickly", 2026-10-28; designed
   2026-10-31, ready to build). Decisions are the owner's, 2026-10-31
   (`docs/decisions.md`, "Search covers your own collections, and share
   links"). Nothing exists yet: no search in the UI or API.
   - **Scope.** Signed in: always every collection the user owns, with no
     option to limit it to the selected one, and not collections shared
     with them (an "include shared collections" checkbox is left for later,
     with item 10a). A share link page searches its one collection.
   - **Where it runs: in the browser, for both.** A new signed-in endpoint
     lists every item in the user's owned collections in one type-neutral
     shape (type, id, collection id and name, title, a detail line; later a
     thumbnail URL), built without a query per row (`_console_response`
     and `_game_response` query each row's label; do not reuse them as they
     are). One TypeScript matching function and one search field component
     serve both pages; the share link page filters the lists it already
     loads (no new public endpoint, no rate-limit pressure). Sized for the
     owner's real numbers (about 400 games and 100 books, roughly 100 KB of
     JSON uncompressed; gzip, item 8c, cuts that to about 20 KB). Revisit
     with a server query around 10,000 items or if the request feels slow
     on a phone. Images stay out of the list except as small thumbnail
     URLs, loaded lazily (item 12).
   - **Fields.** Games match on name and console label, consoles on label
     and edition. Condition, completed, last played, and the collection
     name show on each result's detail line but are not searched
     (condition and completed suit filters later). Books, when they come,
     match on title and author.
   - **Matching.** Each item's search text is built once when the data
     loads, lowercased and with accents removed ("pokemon" finds
     "Pokémon"). Every word of the query must appear, in any order ("halo
     360" finds "Halo 3 · Xbox 360"). Title matches rank before
     detail-only matches, titles starting with the query first, then
     alphabetical. No fuzzy matching or new library. No debounce
     (`useDeferredValue` if drawing lags). At most 50 results drawn, with a
     count of the rest. One TanStack query for the item list, invalidated
     when an item or collection changes.
   - **Layout (signed in): a search bar that takes over the page.** This is
     the owner's styling go-ahead for this feature. A full-width bar,
     "Search all collections", sits at the top of the main area above the
     collection heading and Share button, separated by a border (on
     phones, under the top bar). Focusing it opens search mode: a panel
     slides down from the bar (about 200 ms, `tw-animate-css`; instant with
     reduced motion) and covers the collection area, headed "Results in all
     collections" with the result count. The sidebar's red selection bar is
     hidden while searching. Before typing, the panel lists the first 50
     items alphabetically across all owned collections ("Showing 50 of N,
     type to narrow"); typing narrows it. Each result shows its title and a
     detail line ending in the collection name.
   - **Opening and closing.** `?q=` in the URL, even empty, means search
     mode is open (replace history entries while typing), so refresh keeps
     it and back leaves it. It closes on Escape, a visible Close button,
     the back button, or picking a collection in the sidebar; never on blur
     (clicking a result moves focus). Tabbing into the field opens it too.
     Not a modal: no focus trap, and the sidebar stays usable.
   - **Clicking a result** opens that item's collection with its edit
     drawer open, through the URL (for example
     `?collection=7&item=game-12`), so back returns to the results with
     `?q=` intact; closing the drawer leaves the user in that collection.
     New work: the console and game managers open the drawer from the URL
     once their lists have loaded.
   - **Share link page:** no takeover. A field labeled "Search this
     collection" narrows the page's own lists; rows stay unclickable.
   - **Accessibility.** A labeled `type="search"` input in a search
     landmark; Escape clears it; the result count is announced in a polite
     live region; an empty state says nothing matched.
   - **Tests** (approach in `.github/copilot-instructions.md`): integration
     tests that type a query and assert on what is listed, on both pages,
     plus axe checks; backend tests for the endpoint (owned collections
     only, no other user's items, the type-neutral shape).
8b. **Edit and delete collections** (owner, 2026-10-31). Today a
   collection can only be created: the API has no update or delete route
   and the UI has no control for either. Owner only (`WritableCollection`),
   sandboxes included for their own. Edit is a rename (the type stays
   fixed), using the form pattern. Delete confirms first with the
   red-outline destructive button, and says how many consoles, games, and
   share links go with it. In the database, consoles, games, grants, and
   share links cascade from the collection, but console labels belong to
   the owner and stay: delete the ones no longer used, as
   `_delete_label_if_unused` does for single items. SQLite in the tests does
   not enforce foreign keys, so delete child rows explicitly (as
   `delete_sandbox` does) and test it. After a delete, the sidebar selects
   the first remaining collection (the existing URL effect does this) and
   the collection list and stats queries are invalidated. Where the
   controls sit (the collection heading beside Share, or the sidebar row)
   is a styling question for the owner.
8c. **Gzip in Nginx. Done** (deployed 2026-11-01, `e4366a2`). `gzip on` in
   the `http` block of `nginx.conf` for JSON, JS, CSS, and SVG (HTML is
   always included), over 1 KB, level 5, with `Vary: Accept-Encoding` and
   proxied responses included. `nginx -t` passed locally. The deploy did
   not apply it (see Known issues); after the owner recreated the Nginx
   container on the Pi, `curl` from the Pi showed the JS bundle served with
   `Content-Encoding: gzip` and `Vary: Accept-Encoding` (owner-pasted). The
   same recreate put the 2026-10-31 share-link rate limit and headers live.
9. **Sandbox demo sessions. Done** (owner, 2026-10-29). Built
   2026-10-29, deployed 2026-10-30 (see `docs/decisions.md`, "Demo sessions"). "Try
   the demo" copies the `demo-user` template into a temporary `sandbox`
   account: at most 10 at once, 3 collections and 30 consoles and games each,
   no sharing with users, a 30-minute session, and (since 2026-10-30,
   item 8 step 3) kept 7 days for its share links. Replaces the
   browser-local editing plan.
9a. **Admins delete users in the UI** (owner, 2026-10-31; replaces the
   2026-10-29 idea of a button that wipes all sandbox accounts). Admin only,
   from "Manage users". Settle first: what deleting does to the user's
   collections, consoles, games, labels, grants, share links, and the
   invitations they issued (the open question under "Open questions");
   whether it covers sandboxes, and whether a bulk delete for them is still
   wanted; and who can be deleted (likely the deactivate rules: never
   yourself or another admin). Constraints: console labels and
   `registration_invitations.created_by_id` are `RESTRICT`, so a plain delete
   of a user with data or issued invitations fails (decision "Admins can
   deactivate a user; delete is deferred"); `delete_sandbox` already deletes
   one user's data in a working order and is a starting point. Backups stay
   on the Pi and a hard delete cannot be undone, so the UI confirms first
   with the red-outline destructive button.
10c. **Stats area** (owner, 2026-10-30; later). A dedicated place on the
   page for collection statistics, instead of numbers inside the lists.
   Console game counts were removed from the rows and the API for now. If a
   stat counts across collections, show the cross-collection part only to
   the owner: a share link must not hint at collections that were not
   shared. Design it before building (what to show, where it sits).
10. **Demo sharing walkthrough. Replaced 2026-10-30** by share links that
   sandboxes can use (item 8).
10b. **Console color themes** (owner, 2026-10-30; later). Tried and reverted
   the same day: an NES theme (controller light grey `#c5c5c5`, dark grey
   `#3d3d3d`, black `#1a1a1a`, red `#c3232b`, approximations) setting only the
   logo D, button, and text colors, with white backgrounds kept, built as a
   `--nes-*` palette mapped onto the tokens so SNES and other themes can
   follow. Lessons: secondary buttons are white with a border today, so a
   secondary color needs `bg-secondary` on them; a grey sidebar makes its two
   secondary buttons disappear.
10a. **Later sharing ideas** (owner, 2026-10-30): a People section in the
   share drawer (share by username on the existing grants API; built and
   removed 2026-10-30; settle first whether "User not found" should also
   cover deactivated accounts, and add a rate limit), owners inviting people,
   contributor (edit) access for shared users, a "keep this account" resume
   link for sandboxes, and "last opened" on share links.
11. **Further item types**, after the shared-fields question is settled. As
    the first step, split the sandbox template copy (`_copy_template` in
    `dlams-fastapi/app/auth/sandbox.py`) into one copier per collection type,
    registered by type like `collectionWorkspaceResolver.ts` in the UI. Move
    the video-game copying (labels, consoles, games) beside the video-game
    code. Settle the copier's interface with the new type; labels are copied
    per owner, not per collection (owner, 2026-10-29).
12. **Item images** (owner, 2026-10-31; important, lower priority for now).
    Photos on consoles and games; the owner considers the app limited
    without them. Not designed. Questions to settle first:
    - Storage: files on the Pi's disk or in the database, and backups (the
      nightly `pg_dump` covers only the database, and backups are not
      copied off the Pi).
    - Limits: size and count per item, accepted types (no SVG), and
      resizing (likely a new dependency such as Pillow; needs approval).
    - Demo sandboxes are public: whether they can upload at all, and a cap
      if so.
    - Share links: how a link page shows images without exposing other
      files.
    - Security: uploads make the deferred dependency upgrades urgent. The
      2026-10-12 audit judged the Starlette advisories unreachable partly
      because there are no form or file uploads (Known issues); do those
      upgrades before building this.
13. **Move items between collections of the same type** (owner,
    2026-10-31; later). An owner moves a console or game to another of
    their own collections of the same type. Not designed. Notes: the API
    must check that the target collection is owned by the same user and is
    the same type (the conventions forbid trusting a client-supplied
    cross-collection id), and apply the target's sandbox item limit.
    Console labels belong to the owner, so they move with no change. An
    item moved out of a shared collection leaves its share links. Open:
    one item at a time from its edit drawer (a collection picker; needs the
    shadcn `select`) or several at once.
14. **Duplicate item finder** (owner, 2026-10-31; later). Lists items that
    look like duplicates across the owner's collections, for example the
    same game name and console label. Not designed. Notes: reuse search's
    pieces (the endpoint that lists every owned item, and the
    accent-insensitive normalization), so it can run in the browser. Some
    duplicates are deliberate (two copies in different condition), so it
    only points them out, with links to open, move (item 13), or delete
    each one. Open: what counts as a duplicate per type, and where it
    lives.

## Known issues

- On a phone, the admin users table scrolls sideways inside its bordered box,
  and the Make template and Deactivate buttons are in the last column, so an admin
  swipes right to reach them. Checked by reading the code on 2026-10-23, not
  in a browser. Left as is (admin-only, not on the visitor path). The cheap
  fixes are hiding the Created column below `md` or stacking each user as a
  card.
- The deploy did not apply `nginx.conf` changes (found 2026-11-01). Compose
  mounts the single file into the Nginx container; `git pull` replaces the
  file, so the container kept reading the old one, and `nginx -s reload`
  reloaded that. Fixed in source 2026-11-01, not yet deployed: `deploy.yml`
  now runs `docker compose up -d --force-recreate nginx` instead of the
  reload, so every deploy restarts Nginx (about a second) on the current
  file. Remove this entry once a deploy has run with it.
- A push to `main` deploys even if CI fails, because the deploy workflow does
  not wait for CI. Decide whether to gate the deploy on it later.
- The UI build emits a Vite large-chunk warning (about 647 kB on 2026-10-17,
  over the 500 kB limit) since the Combobox added `@base-ui/react` (2026-10-16).
  It was clear after the earlier dependency cleanup. Code-splitting would fix
  it; not urgent.
- Backups stay on the Pi (decided 2026-10-15): a nightly dump runs at 03:15
  and keeps 14 days in `~/dlams-backups` on the host, but there is no
  off-device copy, so losing the Pi's storage loses the backups with the
  database. Accepted for now. The restore test passed on 2026-10-15 (2 users, no
  collections or games) and again on 2026-10-29 with the demo content (3 users,
  3 collections, 6 consoles, 6 games, matching production).
- Dependency audit (2026-10-12): `npm audit` on `dlams-ui` reports 0
  vulnerabilities. `pip-audit` on `dlams-fastapi/requirements.txt` reports 27
  advisories in 10 packages (starlette, cryptography, pyasn1, ecdsa, anyio,
  and others); it gives no severity. Reading the advisories against the code,
  none appear reachable from the network given how the app uses these
  packages (HS256-only JWTs, no form or file uploads, no static-file serving
  from the API). Several have no fixed version (`ecdsa`, `python-jose`).
  Upgrading is deferred (decided 2026-10-12) and is a separate, explicitly
  requested change because FastAPI 0.115.12 requires `starlette<0.47`.
- Frontend test tooling was installed 2026-10-26 and has 29 tests, including `vitest-axe` accessibility checks. `npm audit` reports 4
  vulnerabilities after the install: `vitest`/`@vitest/mocker` and `tinypool`
  (dev-only; the fix is a downgrade to Vitest 2.0.5) and `zod` (runtime; `npm
  audit fix` resolves it). Upgrades are deferred. Backend tests use `unittest`; Ruff and
  pytest are not configured.
- Migration `951a8354c293` uses a PostgreSQL-only `ALTER COLUMN`, so the full
  migration chain cannot be replayed on SQLite.
- `dlams-fastapi/.env.example` was only used by the deleted legacy
  `docker-compose.local.yml` and is now orphaned; decide whether to remove it.
- Direct cross-origin browser calls to the API fail without CORS. The
  supported development workflows avoid this with a same-origin Vite proxy.

## Open questions

- What fields are shared by every item type, and how should type-specific
  metadata be modeled? Compare schema options before choosing an inheritance
  strategy, and choose stable names for categories and item types.
- What should deleting a user do to the collections, consoles, and games
  they own, and to invitations they issued? Decide before building item 9a
  (admins delete users, planned 2026-10-31); backups exist only on the Pi,
  so a hard delete is hard to undo.
- Should collection owners, not only admins, be able to invite someone with a
  grant on their own collection attached?
- What features beyond the first game-list workflow are in scope for the
  private app and for the demo?
