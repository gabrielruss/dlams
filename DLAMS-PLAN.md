# DLAMS plan

Last updated: 2026-11-06

The current state of the project. For why things are the way they are, see
[`docs/decisions.md`](./docs/decisions.md). For the full history up to
2026-10-09, see [`docs/archive/`](./docs/archive/).

## Where we left off (2026-11-07)

Start here in a new session. This block is rewritten at the end of a session,
never appended to. History lives in git and `docs/decisions.md`.

- **Status.** On `main`: PR #19 (accessibility audit) and PR #20 (calendar
  dropdown focus ring). Branch `hook-consistency` holds checkpoint step 3:
  the hook shapes (`f8bc31b`, pushed) and the hooks folder move (in the
  working tree). Run `git status` and `git log` first: the owner commits
  and pushes everything, and a push to `main` deploys (docs included).
- **What was done (2026-11-06 to 11-07):**
  - New "Checkpoint: interview 1" (due Tuesday 2026-11-10, 4 PM): no new
    features, frontend cleanup only; backend (6d) waits.
  - New favicon (`public/favicon.svg`, `favicon-32.png`).
  - Accessibility: axe checks for the 6a controls; a Playwright pass in
    WebKit and Firefox (scripts kept out of the repo); fixed focus return
    for Add game and New collection (Base UI `initialFocus` with refs),
    the calendar (logged `ref={ref}` edit in `components/ui/calendar.tsx`;
    it opens on today and arrow keys work), label-in-name (`HomeLink`,
    `ListRow`), `aria-expanded` on Open menu, and search opening on typing
    instead of on focus. Findings and owner decisions are under item 6.
- **What is verified.** Run by Claude on `interview-1-cleanup`: 87 UI
  tests, typecheck, lint, format check, build. Owner-checked in a browser:
  keyboard use, the calendar. Not checked: VoiceOver and the Simulator
  (owner's pass), and an empty Save still focusing the name field after
  the ref change.
- **Local test data:** the local account `delete-me` has two collections,
  one console, and one game added by the Playwright pass. Demo sandboxes
  are capped at 10 locally; reuse one session when scripting.
- **Next:** the "Checkpoint: interview 1" list below; no new features
  until it is done.
- **Waiting on the owner:** in 6d, whether to drop the `response_model`s
  Ruff's FAST001 calls redundant; the `npm audit` items (Known issues).
- **The `shadcn` skill** (`dlams-ui/.claude/skills/shadcn`, a link into
  `.agents/skills/`) loads once a session opens a file under `dlams-ui/`,
  not at startup. Its `rules/forms.md` and `rules/base-vs-radix.md` were
  used this session.
- **Testing on an iPhone without deploying:** Xcode's Simulator (`open -a
  Simulator`) reaches the Mac's `localhost`. Turn off I/O → Keyboard →
  Connect Hardware Keyboard to get the on-screen keyboard. Mac Safari's
  Develop menu inspects the Simulator's page (console for measurements).
  If a drawer field still zooms the page, hold Option and drag to pinch
  back out.
- **Things to remember about the code.**
  - Tests sit beside the feature they cover. `renderApp(route)` in
    `dlams-ui/src/test/renderApp.tsx` renders the real app; register MSW
    handlers per test with `server.use(...)`; add an axe check with
    `expectNoViolations(container)`. A request with no handler fails with a
    network error and prints `[MSW] Error: intercepted a request without a
    matching request handler`; the test fails only if what it checks
    depends on that request, so read the output for MSW errors. Any test
    that opens an owned collection needs `GET /collections/1/links` (the
    Share button) and `GET /console-labels` handlers. Inside a drawer,
    the tests use `element.focus()` and `user.keyboard(...)` instead of
    clicks (pointer events threw in jsdom under Vaul; not rechecked since
    the move to Base UI); while a drawer is open the
    page behind it is hidden from the accessibility tree, so query it with
    `hidden: true`. MemoryRouter cannot test back and forward. MSW mocks
    never return a 422.
  - Backend tests call route functions directly against SQLite, which does
    not enforce foreign keys; delete child rows explicitly (as
    `delete_sandbox` and `delete_collection` do) and test that. Routes take
    the collection from a dependency, so tests pass the collection in and
    test access rules on the dependency functions.
  - URL state: `?collection=`, `?q=` (search open, even empty), and
    `?item=<type>-<id>` (an item's drawer); names and the item format are
    in `lib/urlParams.ts`. Picking a sidebar collection drops `q` and
    `item`.
  - `_console_response` and `_game_response` still run one label query per
    row (fix in 6d); `/items` does not use them.
  - Share links are not an access level: `/shared/{token}` looks the token up
    and returns read-only data. `OwnedCollection` guards managing links, not
    reading them.
  - New code follows the conventions file even inside an unconverted file:
    shadcn components, the form pattern, query hooks returning a named
    object, at most two `?` in a ternary chain, `Annotated` aliases,
    `select()`, `extra="forbid"` on request schemas. The 6a grep lists raw
    form elements left in older code.
  - Generated shadcn files need the owner's approval to edit (local edits to
    `components/ui/drawer.tsx` and `combobox.tsx` are listed in
    `.github/copilot-instructions.md`). The owner runs the shadcn CLI.
  - In our own components never use the `cn` helper, do not add code
    comments (but never remove or reword the owner's own comments; some
    are in `searchEntries.ts`), and never use the
    owner's name in tests or fixtures (use `test-user`, `demo-user`).
  - Styling: ask before any styling change; the owner's direct request is the
    go-ahead. Destructive final actions are `<Button variant="outline"
    className="border-destructive text-destructive">`; deleting from a
    drawer starts with the trash-can icon. `red` is the brand color.
  - Formatting: Prettier formats the UI (a hook runs it on each edited
    file); Ruff formats the backend. Run `npm run format:check` and
    `.venv/bin/ruff check .` / `.venv/bin/ruff format --check .` along with
    the tests. macOS `sed` has no `\b`; use exact-match edits for renames.
- **How the owner likes to work:** one decision per message; give a
  recommendation and one question rather than several; the owner often edits
  UI wording directly, so read the current file before changing text and
  keep their wording; they like to see a change before committing to it and
  will revert freely, so keep changes small and easy to undo; build features
  in layers (endpoint, then data layer, then visible UI), one step per
  review; prefer fewer features over messy code, and one consistent pattern
  over several. They want descriptive names that say where a value comes
  from, and simple helpers over already-loaded data rather than clever
  generic code; they review closely and will question loops, vague names,
  and hooks whose names do not match what they return. They apply AHA
  (avoid hasty abstractions): share what is truly the same now, leave the
  rest until a third case. They like UX ideas weighed honestly and will
  push back with their own. They are newer to Python and SQLAlchemy than to
  JS, so JS comparisons help. For commands on the Pi, give one command per
  code block and wait for the output. Do not offer to commit or push. Docs
  stay trim, facts only.

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

**Deployed 2026-11-01 and 2026-11-02**

- **Gzip in Nginx** (item 8c; applied after a manual container recreate).
- **Search** (item 8a, PR #12): `GET /items`, the "Search all collections"
  takeover with `?q=`, `?item=` opening every item's edit drawer
  (then `useItemEditor`, replaced by item 8d), the share page's "Search this collection" field, the
  pinned Save / Cancel footer and trash-can Delete in item drawers, and
  Prettier for the UI.

**Deployed 2026-11-03** (PR #13)

- **Edit and delete collections** (item 8b): `PUT` and `DELETE
  /collections/{id}`, an "Edit" button beside Share, and the Edit
  collection drawer with a counted delete confirm. Owner-checked in the
  browser before merging.

**Merged 2026-11-05** (PR #16; deploy not yet reported)

- **Base UI** (item 5a): shadcn style `base-nova`; every `components/ui`
  wrapper on Base UI or plain HTML; Radix and Vaul removed.

**Not implemented**

- Sharing with a user by username has an API but no screen (item 10a).
- Deleting a user (admins can only deactivate; item 9a).
- Item types other than video games.
- Item images (item 12).
- Moving items between collections (item 13) and finding duplicates (item 14).

**Verification baseline**

- Latest (2026-11-05, run by Claude on `move-to-base-ui`): UI `npm test`
  71 passed (11 files), typecheck, lint, build (the large-chunk warning),
  and format check clean; backend not run. Before that (2026-11-03, on
  `view-before-edit`): UI `npm test`
  68 passed (11 files), lint, build, and format check clean. On `edit-delete-collection` the same day: UI
  `npm test` 58 passed (10 files), `npm run lint` clean, `npm run build`
  passes (the known large-chunk warning), `npm run format:check` clean;
  API 94 unit tests pass, `ruff check` and `ruff format --check` clean.
  The entries below are older baselines.

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

## Checkpoint: interview 1

Set 2026-11-06 (owner). Due Tuesday 2026-11-10, 4 PM. No new features
until this is done: the codebase should be clean enough to walk a hiring
manager through. The role is frontend only, so the backend waits. Items in
this order; everything else under "Next up" waits.

1. Accessibility audit (6): the automated checks on the 6a controls, then
   the owner's keyboard, VoiceOver, 200% zoom, and phone-menu pass, and the
   `--ring` decision.
2. Repeated styling (6b), then styling cleanup (6c).
3. **Done 2026-11-08 on `hook-consistency`.** Frontend hook consistency
   (6e): every query hook returns the standard shape (first commit,
   `f8bc31b`); then each feature's hooks moved into its `hooks/` folder and
   `useFitOnResize` to `src/hooks/` (second commit, moves and imports only).
   Left as is (owner): `useCollections` does three jobs; `useItemDrawer`
   keeps its UI name because it is accurate.
4. Route paths in one place (owner, 2026-11-08; own branch): the five app
   paths are typed as strings 19 times (`App.tsx`, pages, `AppSidebar`,
   `HomeLink`), and the share and invite links build URLs by hand. Add
   `lib/routes.ts` with an `as const` object (`routes.login`, ...) and
   `sharedCollectionPath(token)`, like `lib/urlParams.ts`. Not an `enum`:
   `erasableSyntaxOnly` forbids them.
5. Known issues that show in a walkthrough: the "[object Object]" 422
   message, the large-chunk build warning, deploy not gated on CI, the
   orphaned `dlams-fastapi/.env.example`.

Paused until after the checkpoint: backend consistency (6d), the calendar
cut off at 200% zoom (item 6, finding 4), 9a, 10a, 10b, 10c, 11 to 15, and
new bug-fix batches unless a bug shows in the demo.

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
5a. **Move to Base UI. Done 2026-11-05**, merged in PR #16, with shadcn's `migrate-radix-to-base` skill, one commit per
   component, and a report per component in `dlams-ui/.migration/`.
   - **Style** switched to `base-nova` (`docs/decisions.md`), so `shadcn
     add` delivers Base versions; our theme and font were kept.
   - **Migrated:** `button`, `label`, `input` (classes kept); `separator`,
     `field`, and `drawer` reinstalled from `base-nova`; `form` replaced by
     `field` per shadcn's React Hook Form guide. Radix and Vaul are
     uninstalled. Base UI's root setup (`isolation: isolate` on `#root`,
     `position: relative` on `body`) is in `index.css`.
   - **Drawers** take the `base-nova` look (lighter blurred backdrop,
     rounded open side). Side drawers are `100svh` tall so iOS 26 Safari's
     toolbar does not hide the footer (a logged local edit; revisit with
     item 15). The combobox `container` workaround was removed.
   - **Left:** decide whether to keep the `shadcn` skill (installed in
     `dlams-ui/.agents/skills/`; check that a fresh session loads it); check
     the keyboard on a real phone (Known issues). The migration skill was
     removed 2026-11-05 with `npx skills remove migrate-radix-to-base`.
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

   **Automated pass on the 6a controls (2026-11-06, `interview-1-cleanup`).**
   New axe checks: the open calendar, the open Condition and Console lists,
   the empty state, and the create drawer opened from it (82 tests pass).
   - Fixed: the calendar popup was a dialog with no name (axe
     `aria-dialog-name`); `LastPlayedPicker` now labels it with the "Last
     played" label.
   - Skipped on purpose: both open lists fail `region` ("content should be
     in landmarks") because Base UI portals them to `body`, outside the
     drawer. It is a best-practice rule, not WCAG, and the lists are reached
     through their field. Those two checks pass `["region"]` to
     `expectNoViolations`.
   - Contrast, calculated from the light tokens: selected day 17.05:1, today
     16.28:1, "Pick a date" and outside days 5.50:1. Disabled future days are
     2.08:1, which WCAG 1.4.3 allows for disabled controls.

   **Browser pass with Playwright (2026-11-06, WebKit and Firefox, local
   app; scripts kept out of the repo).** Keyboard, axe with contrast on,
   200% zoom (640x400), and phone width (375). Not covered: VoiceOver and
   the Simulator.
   - Passes: Tab order; focus stays inside every drawer; Esc closes only the
     open list or calendar; Edit, Share, Add console, and row drawers return
     focus on close; an empty Save shows the error and focuses the field; no
     sideways scroll at 200% or 375px; Save stays reachable at 200%; the
     phone menu takes focus, returns it on Esc, and closes on a pick.
   - Findings, not fixed yet:
     1. **Fixed 2026-11-07** (owner's choice). Tabbing into search opened it
        and hid Edit, Share, Add console, and Add game. Search now opens on
        typing only (`onFocus` and `open` removed); a test covers it.
     2. **Fixed 2026-11-06.** Add game and New collection dropped focus to
        `body` on close: `autoFocus` focused the field before Base UI noted
        the trigger. Both drawers now pass the name input's ref to
        `initialFocus` (merged with react-hook-form's `field.ref`);
        `GameForm` keeps `autoFocus` only for Edit on an existing game
        (`focusNameOnMount`).
     3. **Fixed 2026-11-07** with 8: the picker's popover has
        `initialFocus={false}` and react-day-picker's `autoFocus` focuses the
        selected day, else today.
     4. At 200% on a short window the calendar opens upward and its top
        (month controls, first week) is cut off. Deferred until after
        interview 1 (owner, 2026-11-07: niche).
     5. **Fixed 2026-11-06.** WCAG 2.5.3 (label in name): the logo links
        are named "D.L.A.M.S. home"; `ListRow` has no `aria-label`, a
        visually hidden "View" comes before the visible text ("View NES
        Loose"), and tests match row names by prefix.
     6. **Fixed 2026-11-06.** "Open menu" has `aria-expanded`.
     7. The Select's highlighted option is only a faint background (about
        1.1:1), no outline. Skipped for now (owner, 2026-11-07).
     8. **Fixed 2026-11-07.** Arrow keys did not move between days: the
        generated `CalendarDayButton` never attached its focus `ref`. Now a
        logged local edit (`ref={ref}`); tests cover opening on today and the
        arrow keys. Owner-checked in a browser 2026-11-07.
   - Not ours, or false positives: the login backdrop letters fail contrast
     but are decorative and `aria-hidden`; Base UI's focus-guard spans fail
     `aria-command-name`; react-day-picker day buttons fail label-in-name
     ("6" vs "Friday, November 6th, 2026"); Playwright's Firefox crashes
     running axe on the open game form (no crash without axe).
   - `--ring`: the focused field shows a lighter blue-grey border plus the
     3px glow. Skipped for now (owner, 2026-11-07): too subtle to notice,
     and the glow made focus clear in the keyboard pass.
6a. **Use the shadcn components everywhere (before go-live).** Scanned
   2026-10-27; rescanned 2026-10-31. New code must already use them (owner,
   2026-10-31; rule in `.github/copilot-instructions.md`, "Frontend"), and the
   `add-share` branch's new elements were converted (Share drawer, the drawer
   Delete buttons, `ListRow` as `Button variant="ghost"`). Converting the older
   ones is a styling change, so it needs the owner's go-ahead and scope first.
   Installed in `components/ui/`: `button`, `calendar`, `card`,
   `checkbox`, `combobox`, `drawer`, `field`, `input-group`, `input`,
   `label`, `popover`, `select`, `separator`, `table`, `textarea`.
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
     installed either (`checkbox`). Do the condition fields first: the owner
     finds them the worst-looking dropdown (2026-11-05).
   - **10 raw `<label>`s** across the three drawer forms and the invite
     drawer, where `FieldLabel` should be used. `Field` is used on login,
     register, and the share and edit-collection drawers, but the item
     drawer forms use `react-hook-form` `register` directly. Convert them to
     the form pattern in `.github/copilot-instructions.md` ("Frontend"): a
     zod schema plus `Controller` and `Field`.
   - `textarea` is installed but unused. `input-group` is only used inside
     the generated `combobox`.
   **Started 2026-11-06 on `shadcn-everywhere`, one form at a time.** The
   owner installed `select` and `checkbox` (Base UI versions). Game form
   done (not yet checked in a browser): `schemas/games.ts`
   (`gameFormSchema`, the future-date rule included) with `zodResolver`
   in `useGameDrawerContent`; `GameForm.tsx` uses `Input`, `Select`
   (Base UI `items`), `Checkbox`, and `Field` throughout. Save is no
   longer disabled while name or console is empty; it shows the field
   errors instead, like the other forms. 1 new test (condition and
   completed reach the API). Condition opens below the field
   (`alignItemWithTrigger={false}`; Base UI's default puts the selected
   option over the field). Last played is the shadcn date picker
   (`npx shadcn@latest add calendar popover`, owner-run; added
   `react-day-picker` 10 and `date-fns` 4; `button.tsx` not overwritten):
   `LastPlayedPicker.tsx`, a `Popover` with `Calendar` that disables days
   after today, shows `MM-DD-YYYY`, and has "Clear date"; the value stays
   a `YYYY-MM-DD` string (`parseISO`, and `localDateToIsoDate` in
   `lib/dates.ts`). `lib/dates.ts` is built on `date-fns` (owner: use it
   rather than hand-made date code); the zod rule uses its
   `isAfterToday`. Replaces the browser's date input, whose `max`
   looked clickable in Safari. 2 tests with the clock fixed. The game
   drawer's Close and Add game (default `Button`) are
   converted, so no game file has a raw element left. Add console
   (default `Button`) too, to match.
   **Code done 2026-11-06; the consistency check below prints nothing.
   Not yet checked in a browser:** the console form (`schemas/consoles.ts`,
   `Input`, the shared `ConditionSelect.tsx` that both item forms use,
   so the 6b `SelectTrigger` note is resolved there), every Close (drawers
   and search) as `Button variant="outline"` at the default 36px (owner,
   2026-11-06: same size as the other buttons and a bigger tap target;
   `sm` had shrunk the phone Close from the mobile pass's ~36px), the
   button consistency fixes (Delete link red-outlined, "Create your first
   collection" default, Login's own hover classes removed; then removed:
   with no collections, the sidebar says only "No collections yet." and
   the main area shows "Create collection" under its sentence, through
   `CreateCollectionDrawer`, which owns the drawer and takes its trigger,
   so the sidebar keeps its "+"; the long label overflowed the sidebar
   and the sidebar is hidden behind the menu on phones), the sidebar's
   collection row
   (a ghost `Button` with its layout classes kept, like `ListRow`), the
   create-collection form (`collectionNameSchema`, shared with rename;
   2 new tests in `CollectionNavigation.test.tsx`), the invite drawer's
   link (`Field` and `FieldLabel`), and the session Retry. Save and
   Create stay enabled when a required field is empty and show its
   error instead. `isVideoGameCondition` was removed (zod checks the
   condition). Only `textarea` of the installed components is unused (no
   multi-line field).
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
   `Button` (Share drawer), the item drawer's trash-can Delete and its
   pinned Save / Cancel footer (console and game, 2026-11-02), the drawer
   header with its Close button, and the bordered list section
   (`flex flex-col gap-4 rounded-lg border p-4`). Added 2026-11-06: the
   `SelectTrigger` classes that make the generated `base-nova` select
   match our fields (`w-full rounded-md pl-3 text-base
   data-[size=default]:h-9 md:text-sm`). Resolved 2026-11-06: both item
   forms use `ConditionSelect.tsx`, which holds them once; extract a
   general `FormSelectTrigger` only if a non-condition select appears. Likewise `border-input` on the
   outline `Button` used as the date picker's trigger
   (`LastPlayedPicker.tsx`), if another button-as-field appears.
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
   - **One package per collection type** (owner, 2026-11-06;
     `docs/decisions.md`): move `video_games_routes.py`,
     `video_games_schemas.py`, and `video_games_items.py` into
     `app/collections/video_games/` (`routes.py`, `schemas.py`,
     `items.py`) with `git mv`, and fix the imports in `main.py`,
     `collections/schemas.py`, `shared_routes.py`, `item_routes.py`, and
     the tests. Moves only, as their own step; do the console and game
     split below inside the new package. Models stay in `app/models/`
     (Alembic and `Base` find tables there). The sandbox copier moves with
     item 11. UI as a separate step: `lib/api/consoles.ts`, `games.ts`,
     `consoleLabels.ts`, `videoGameStats.ts`, and `types/videoGames.ts`
     into the video-game feature folder.
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
6e. **Frontend hook consistency check** (owner, 2026-11-02). Go through
   every hook in `dlams-ui/src` and check two things. First, a hook named
   for data returns that data under that name (`useOwnedItems` returns
   `ownedItems`); a name that is hard to match usually means the hook does
   two jobs, so split the job rather than stretch the name (search's
   `useOwnedItems` was fixed this way). Second, query hooks return one
   shape: a named object with the data plus `isPending`, `isError`, and
   `error` (the conventions file's "destructure" rule), and the screen
   using it shows pending and error states. Found 2026-11-02, not
   converted: `useCurrentUser` and `useVideoGameCollectionStats` return
   the raw query result (callers use `data`), and `useConsoleLabels`
   returns a bare `string[]` with no pending or error state, so a failed
   label load is silent. Re-run the UI tests after each change.
   Ternary chains (two-`?` limit in `.github/copilot-instructions.md`,
   2026-11-02): the only one over it, in `CollectionWorkspace.tsx`, was
   fixed the same day (`CollectionBody` with early returns); nine two-`?`
   chains are within the limit.
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
   links").
   **Built so far (2026-11-01, uncommitted):** the endpoint, `GET /items`
   (`item_routes.py`, `video_games_items.py`). Each item has `type`
   (`console` or `game`), `id`, `collection_id`, `collection_name`,
   `title`, `keywords` (searched besides the title: a game's console label;
   a console's label and edition are in its title), and `details` (shown,
   not searched: condition, "Completed", "Last played <date>"). The detail
   line is `keywords`, `details`, and the collection name joined with
   " · ". Sorted by title ignoring case; one query per item type; 7 tests
   in `test_owned_items.py`. Owner-checked 2026-11-02 in Postman against
   the dev stack: items from two owned collections, sorted, in that shape.
   UI data layer (2026-11-02, uncommitted):
   `types/items.ts`, `lib/api/items.ts` (`itemKeys`), and in
   `components/search/` the matcher `searchEntries.ts`
   (`buildSearchEntries` takes any value plus a function giving its title
   and keywords, so the share link page can prepare its consoles and
   games; `searchEntries` filters and ranks) with 5 tests, and
   `useOwnedItems`, which returns `ownedItems` (`SearchResults` builds the
   entries with `useMemo`). `invalidateVideoGameCollection` also invalidates
   `itemKeys.all`; item 8b must do the same on rename and delete.
   Search bar and results (2026-11-02, uncommitted; owner saw it in the
   browser and approved the look): `SearchBar` above the page in `pages/Home.tsx`, and
   `SearchResults` in place of the collection while `?q=` is in the URL
   (`useSearchMode`; URL names in `lib/urlParams.ts`). Focusing or typing
   opens it; the first Escape clears the text, the next closes; "Close
   search" and picking a sidebar collection close it; the sidebar shows no
   selection while open. Results reuse `ListRow`, at most 50 with a count
   in a status line. A result sets `?collection=<id>&item=<type>-<id>`
   (a new history entry); the item's drawer does not open from the URL
   yet (next step). 10 tests in `Search.test.tsx`, including axe.
   Item drawers from the URL (2026-11-02, uncommitted, not yet tried in a
   browser): `?item=` is the one way an existing item's edit drawer opens
   (`components/collections/useOpenItem.ts`). Search results and row
   clicks both set it; the console and game hooks take their lists and
   open the drawer when `item` names one of them, so an unknown or
   deleted item opens nothing. A row click pushes a history entry marked
   in its state, and closing that drawer goes back one step; a drawer
   opened from search or a pasted URL closes by removing `item` (replace),
   which leaves the user in that collection. The Add drawers stay in local
   state. 4 new tests (from the URL, unknown item, close, and a search
   result opening its drawer). Back and forward are not covered by tests
   (MemoryRouter); check them by hand.
   **Replaced 2026-11-03 by item 8d's `useItemDrawer` and drawer content
   components.** The editing logic both managers shared was one hook,
   `components/collections/useItemEditor.ts` (owner, 2026-11-02, after an
   AHA review; named for what it owns, which item is being edited, not
   for the drawer that shows it). The URL stays the single source of
   truth for that item, so no store is involved: reading `?item=` through
   `useOpenItem`, the Add state,
   finding the item, loading the form once per item, and closing. Each
   manager passes its type, list, form, a `toFormValues` function, and an
   `onReset` that clears its mutation errors; forms, payloads, API calls,
   and confirm text stay per type. A new item type adds one
   `useItemEditor` call. Deliberately not shared yet: the mutation wiring
   and the drawer markup (header, Close, delete section; see 6b). Revisit
   both when a third item type arrives (item 11).
   Share link page search (2026-11-02, uncommitted, not yet tried in a
   browser): a "Search this collection" field under the read-only note
   narrows the page's console and game lists in place (query in local
   state, not the URL; no takeover, rows stay unclickable). Shared
   pieces: `SearchField` (the labeled search input; Escape is up to the
   caller) now also renders the signed-in bar, and `useListSearch`
   filters any list with `searchEntries`, returning it unchanged when the
   query is blank. Mappings are `consoleSearchable` and `gameSearchable`
   in `videoGameOptions.ts`. A status line says "N of M items match" or
   "Nothing matches"; each list takes an `emptyMessage` ("No games
   match."); sidebar counts stay totals. 3 new tests. With this, search
   (8a) is built; it ships with the next push. The share page filters in
   place instead of reusing `SearchResults` (signed-in data, URL state,
   and click-through would each have needed a switch). A results panel
   there was considered and dropped (owner, 2026-11-02): a visitor cannot
   open anything, so a list of results adds nothing over filtering. Revisit
   if items get a read-only "view more" detail view, since then results
   would have somewhere to go; the plan then is one display-only
   `SearchResultsPanel` rendered by both pages, with separate logic in
   each. The searchable fields
   per type are written twice, in `video_games_items.py` and in
   `consoleSearchable` / `gameSearchable`; keep them in step, and expect
   each new item type (item 11) to add both.
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
   **API built 2026-11-02 (branch `edit-delete-collection`, uncommitted):**
   `PUT /collections/{id}` renames (`CollectionUpdate`, `name` only,
   `extra="forbid"`, trimmed, blank is 422) and `DELETE /collections/{id}`
   deletes the links, grants, games, and consoles explicitly, then the
   collection, then the owner's labels its items used that nothing else
   uses now. Both depend on `WritableCollection`. 7 tests in
   `test_collection_edit_delete.py`.
   **UI data layer built 2026-11-02 (uncommitted, no screen uses it
   yet):** `collectionsApi.update` and `.delete`, `CollectionUpdate` in
   `types/collections.ts`, the rename form's zod schema
   (`schemas/collections.ts`, `collectionNameSchema`: trimmed, 1 to 100),
   and `components/collections/useManageCollection.ts` with
   `renameMutation` (invalidates the collection list and `itemKeys.all`,
   since search shows collection names) and `deleteMutation` (also stats
   and console labels). After a delete, `useCollections` selects the first
   remaining collection once the list refetches; the deleted collection's
   console, game, and link queries are left to garbage-collect.
   **Controls built 2026-11-03; owner checked them in the browser the
   same day ("working perfectly"):** an "Edit" button (pencil) beside Share, owners and
   sandboxes only, opens `EditCollectionDrawer`, laid out like the item
   drawers: header with title and Close; the trash icon at the top right
   of the item area, then the name field (form pattern); a pinned footer
   with "Save collection" and Cancel. The trash icon swaps the form for
   `DeleteCollectionConfirm`: "Delete <name>? This also deletes 1
   console, 2 games, and 1 share link. This can't be undone." with a
   red-outline "Delete collection" and "Keep collection" (the share-link
   pattern). Counts come from data the page already has: the sidebar's
   video-game stats (`useVideoGameCollectionStats`) and the Share
   button's link list, so opening the confirm sends no request.
   `describeContents` (`components/collections/describeContents.ts`, 3
   unit tests) turns counts into "1 console, 2 games, and 1 share link",
   skipping kinds with none; `itemTypeNames` and `CountNames` in
   `types/items.ts` hold the singular and plural names. A second
   collection type adds its own counts here, as the sidebar's stats
   registry does. After a delete the first remaining collection is
   selected. 5 tests in `EditCollectionDrawer.test.tsx`
   (rename, blank name, counted delete, keep, axe).
8d. **View an item before editing it** (owner, 2026-11-03; high priority,
   right after 8b). Opening an item (a row click, a search result, or
   `?item=`) should show its details read-only first, with an Edit action
   to switch to the form, instead of opening straight into edit mode.
   Viewing is the common case, and it matters more as items gain fields
   (and later images, item 12).
   **Built 2026-11-03 on `view-before-edit`:** games owner-checked in the
   browser; consoles use the same pattern and are not yet checked.
   `useItemDrawer` says only what is open (the URL's item, or Add). Each
   type has a drawer content component and hook (`GameDrawerContent`,
   `useGameDrawerContent`, and the console pair) rendered inside
   `DrawerContent`. They own the form, the mutations, edit mode, and the
   shown item. The drawer keeps that content mounted through the closing
   animation and unmounts it after, so it holds still while the drawer
   slides shut and starts fresh on the next open, with no reset code; this
   replaced a wrapper and then hook state tried the same day to stop a
   flicker of the form. A save during the slide updates the shown item. `GameDetails` and
   `ConsoleDetails` render through `ItemDetailRows`; `ItemActions` holds
   Edit and a red-outline Delete, in the view only. `GameForm` and
   `ConsoleForm` hold the forms; the raw elements 6a lists in the managers'
   forms and drawer Close are now in those files and the drawer content
   components. A console's title is its label, with the edition in the
   rows. Rows and results are named "View <item>". Add opening with the last
   item's values (a bare `form.reset()`) is fixed. Not tested: going
   directly from one open item to another would keep edit mode, but no
   path in the app does that. Clicking Add during the slide was on the
   owner's browser list for games ("looks great"; not reported separately).
   **Designed 2026-11-03 (owner):**
   - **View layout:** the drawer title is the item's name (for example
     "Chrono Trigger"); the header keeps only the title and Close. At the
     top right of the item area, an "Edit" button (pencil) beside the
     trash icon. Then the details as label / value rows, read-only, "—"
     for an empty value (games: Console, Condition, Last played,
     Completed; consoles: Edition, Condition). No footer in view mode.
   - **Edit mode:** "Edit" swaps the rows for the form, the title becomes
     "Edit game" / "Edit console", and the pinned Save / Cancel footer
     appears. Cancel and a successful save return to the view (showing
     the new values), not close the drawer.
   - **Edit mode is local state, not in the URL** (owner: nobody needs a
     link to an edit screen). Opening an item by any route starts in the
     view; closing the drawer or opening another item resets to the
     view; back closes the drawer as it does today.
   - The Add drawers are unchanged: they open straight into the form.
   - Still open: whether a read-only "view more" for share link visitors
     can reuse the view (see 8a's note on a results panel for the share
     page).
8c. **Gzip in Nginx. Done** (deployed 2026-11-01, `e4366a2`). `gzip on` in
   the `http` block of `nginx.conf` for JSON, JS, CSS, and SVG (HTML is
   always included), over 1 KB, level 5, with `Vary: Accept-Encoding` and
   proxied responses included. `nginx -t` passed locally. The deploy did
   not apply it, because the workflow's `nginx -s reload` kept reading the
   old mounted file (`deploy.yml` now recreates the container; confirmed
   2026-11-03); after the owner recreated the Nginx
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
    Other places that assume video games today, to revisit together when
    the new type is built (owner, 2026-11-03: decide then, not before):
    the delete-collection confirm's counts (`DeleteCollectionConfirm`
    reads `useVideoGameCollectionStats`; a type-neutral stats endpoint
    with counts per item type, shared with the stats area 10c, is the
    likely answer), the searchable fields written in both Python and
    TypeScript (item 8a), and each type's drawer content component and
    hook (item 8d).
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
15. **Phone-friendly drawers** (owner, 2026-11-05; later). The owner found
    the shadcn and Base UI demo drawers easier to use on a phone than ours.
    shadcn's docs open them from the bottom on phones and from the side on
    larger screens (`swipeDirection={isMobile ? "down" : "right"}`), with an
    optional swipe handle. A styling change; the owner sets the scope.
    Re-evaluate then the side-drawer `100svh` height in `drawer.tsx` (a
    local edit, 2026-11-05, for iOS 26 Safari's toolbar hiding the footer).
16. **Next bug-fix batch** (owner, 2026-11-05). Not investigated yet.
    - **Console combobox `Add "name"`:** sometimes picking the Add row closes
      the list without setting the new console. Intermittent; not yet
      reproduced. Skipped 2026-11-06 (owner): it was seen before the move
      to Base UI and may be gone; reopen if it shows up again. `ConsoleLabelCombobox.tsx` adds the typed name to the item
      list only while it has no exact match.
    - **Last played: no future dates.** API done 2026-11-06:
      `LastPlayedDate` in `video_games_schemas.py` refuses a date after
      today in UTC (the server's zone, never behind a US user's today)
      with a 422, on `GameCreate` and `GameUpdate`; 1 test. Form done the
      same day; replaced the same day in 6a by the shadcn date picker,
      which disables days after today, and a zod rule in
      `schemas/games.ts`.
    - **Console placeholder on phones. Done 2026-11-06, not yet checked on
      a phone:** "Select or add a console" did not fit at 16px. The text is
      kept; every placeholder is now 14px at every width (a `::placeholder`
      rule in `index.css`, `docs/decisions.md`); typed text stays 16px on
      phones. Calculated to fit from about a 360px-wide screen.
    - **Last played shown as `MM-DD-YYYY`. Done 2026-11-06** (owner's
      format, `11-05-2026`). Date helpers are named for their format:
      `isoDateToMonthDayYear` in `dlams-ui/src/lib/dates.ts` (used by
      `GameDetails.tsx`, `GameList.tsx`, and the date picker), and `date_to_month_day_year` in
      `dlams-fastapi/app/dates.py` (the search detail line in
      `video_games_items.py`). Forms and the API still use `YYYY-MM-DD`.
    - Related, already in Known issues: iPhone auto-zoom on the drawer form
      fields.

## Known issues

- A 422 from the API shows as "[object Object]" if the UI ever displays
  it: `lib/api/client.ts` reads `detail` as a string, but FastAPI's
  validation errors send a list (found reading the code, 2026-11-06). The
  forms validate first, so it shows only when the UI and API rules
  differ.

- On a phone, the admin users table scrolls sideways inside its bordered box,
  and the Make template and Deactivate buttons are in the last column, so an admin
  swipes right to reach them. Checked by reading the code on 2026-10-23, not
  in a browser. Left as is (admin-only, not on the visitor path). The cheap
  fixes are hiding the Created column below `md` or stacking each user as a
  card.
- On a phone, an item drawer could stay at its keyboard-open height after
  the keyboard closed (owner-reported 2026-11-04, under Vaul). With the Base
  UI drawer the keyboard no longer resizes it, so it cannot stay small
  (owner-checked in the iOS Simulator, 2026-11-05). Not yet checked on a
  real phone. While the keyboard is open, the pinned Save / Cancel sit
  behind it.
- On iPhones, tapping a field in the console and game drawer forms zooms
  the page in, and it stays zoomed (seen in the iOS Simulator, 2026-11-05).
  iOS zooms on inputs whose text is under 16px; these are raw inputs with
  `text-sm`. A game's Edit focuses its name field, so it zooms at once.
  shadcn's `Input` uses `text-base md:text-sm`, so converting these forms
  (item 6a) should fix it. Converted 2026-11-06; not yet checked on an
  iPhone or in the Simulator.
- The demo notice in `VideoGamesWorkspace.tsx` now says "All data you add
  will be reset in 30 minutes." Sandboxes stay 7 days and their share
  links keep working, and item 8 and `docs/decisions.md` still describe
  the old notice. Waiting on the owner: keep the wording or not.
- A push to `main` deploys even if CI fails, because the deploy workflow does
  not wait for CI. Decide whether to gate the deploy on it later.
- The UI build emits a Vite large-chunk warning (about 799 kB, 256 kB
  gzipped, on 2026-11-06 after the date picker; about 647 kB on 2026-10-17,
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
  pytest are not configured. **2026-11-02:** the Prettier install's audit
  summary showed 16 (13 moderate, 1 high, 2 critical); Prettier has no
  dependencies, so these arrived some other way since 2026-10-26.
  **2026-11-05, read with `npm audit`:** 15 (2 low, 11 moderate, 2
  critical). Critical: `vitest` and `tinypool` (test tooling). Low or
  moderate: `shadcn` and its dependencies `@shadcn/registry`, `deepmerge`,
  `ts-morph`, `@ts-morph/common` (added 2026-11-05; the app imports only
  its CSS), and `typescript-eslint` / `minimatch` (lint tooling). `zod` is
  no longer listed. Do not run `npm audit fix --force`: it proposes
  `vitest@2.0.5` and `shadcn@1.0.0`, both downgrades. The same install warned `EBADENGINE`: the owner's
  Mac runs Node 23, which `eslint-visitor-keys` does not list as supported
  (the Docker build uses Node 20).
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
