# DLAMS decisions

Dated record of decisions and their reasons. Newest first within each group.
An entry marked **Superseded** is kept for history only; the entry that
replaces it is named. Proposals and open questions live in
[`DLAMS-PLAN.md`](../DLAMS-PLAN.md), not here.

## Repository and delivery

### The demo lives in the production app, on the main domain — 2026-10-17
- Visitors use the real app at its main domain, not a separate demo site or
  subdomain. They sign in as `demo-user`, which holds the `demo` role and is
  GET-only at the API, so it cannot change anything. This answers the earlier
  open question about the demo URL.
- The domain is not written in tracked files (public repository). **Revised
  2026-10-27:** the production domain is named in `dlams-deployment/nginx.conf`
  and will be linked from the README as the live demo link, so it is public by
  design. What stays out of tracked files is anything else about the host: IP
  addresses, paths, the network layout, and credentials.

### No screenshots in the README — 2026-10-27
- The README links the live demo instead of showing screenshots. The owner does
  not want to maintain images that drift from the app, and a visitor can open
  the real thing in one click.
- **Supersedes** the "README with screenshots" in the 2026-10-14 portfolio
  checkpoint below.

### Database backups stay on the host — 2026-10-15
- A nightly `pg_dump` (`dlams-deployment/scripts/backup-db.sh`, 03:15, 14 days
  kept) protects against a bad migration or an accidental delete. It is not
  copied off the Pi.
- Decision: accept the Pi as a single point of failure for now. An off-device
  copy (pulling from the owner's Mac, pushing from the Pi, or cloud storage)
  is deferred, not rejected; the script already supports a push destination.
- Reason: the data is a small, single-owner collection that can be re-entered,
  and the extra moving part was not worth it yet.

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

### All sharing is read-only — 2026-10-16
- Sharing a collection gives another user read access and nothing else. There
  is no `edit` or `demo` grant: the collection owner is the only user who ever
  writes to it. A grant is just "this user can read this collection".
- Demo behavior now comes only from the `demo` account role (see "Demo
  accounts: an admin-assigned role, GET-only at the API"), so the `demo` grant
  mode was redundant and is removed with `edit`.
- Reason: collaborative editing was costing more complexity than it earned (a
  second write path, mode management, more test cases, a grants screen with a
  mode control), and it blocked simpler ownership of related data such as
  console labels.
- Consequences: the "update a grant" endpoint and the `mode` column go away.
  The grants screen becomes a "Shared with" list: add a username, remove a
  user. A demo account's sharing form needs no special case.
- **Supersedes** the grant modes in "Collection ownership and grants"
  (2026-10-04) and resolves the open question about the `demo` grant mode.
  Admins still have no implicit access to collections they do not own.

### Demo accounts: an admin-assigned role, GET-only at the API — 2026-10-14
- A demo account is a user whose role is `demo` (alongside `user` and
  `admin`). Only an admin can set it, from admin user management, by changing
  an existing account's role between `user` and `demo`. No invitation
  produces one, nothing creates one directly, and the API never sets or
  clears `admin` this way. Other users never see the option.
- Demo content is entered by hand: register the account as an ordinary user
  from an invitation, add the collection and items through the normal UI,
  then switch the role to `demo`. Switching back to `user` allows editing the
  content later. A seed script was considered and deferred as too much for
  now.
- In the sharing area a demo account can only grant read-only access, so the
  access-mode control is not shown to it at all (no greyed-out option and no
  helper text).
- A demo account is read-only at the API: any request from it other than
  `GET`, `HEAD`, or `OPTIONS` returns 403, including creating collections.
  The check lives once, in `get_current_user`. Login, logout, and register do
  not use it, so there are no named exceptions.
- A demo account owns its demo collection, so the owner-scoped sharing screen
  can show real grants. Visitors will eventually use the app as if it were a
  full account, but their edits are saved only in their browser and never
  reach the API. That is the difference from a `view-only` grant.
- Reason: demo credentials are public, so the API must give them no write
  path at all, not just no write path into one collection.
- **Supersedes** parts of "Collection ownership and grants" (2026-10-04): the
  global `demo` role dropped then returns with a different meaning
  (admin-created, GET-only), and the demo collection is owned by the demo
  account instead of being a main-account collection with a `demo` grant. The
  `demo` grant mode is now redundant; whether to remove it is an open
  question in the plan. Built 2026-10-15 (role, admin switch, and the API
  check); deployed 2026-10-17.

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
- **Partly superseded 2026-10-14** by "Demo accounts: an admin-assigned role,
  GET-only at the API": a `demo` role returns, and the demo account owns the
  demo collection.
- **Superseded 2026-10-16** by "All sharing is read-only": the `edit`,
  `view-only`, and `demo` grant modes no longer exist.

### Demo behavior — 2026-10-02
- Demo credentials are public and carry no authority; server-side
  authorization alone protects persistent writes.
- Demo visitors may eventually edit a browser-local copy that survives
  refresh and can be reset to the source collection. Those edits must never
  become database writes.

## Domain model

### Console labels belong to the owner; items belong to collections — 2026-10-16
- A console label (a platform name such as `Xbox 360`) belongs to a user, the
  owner of the collections that use it, and is reused across that user's
  collections. Names are unique per user ignoring case, enforced by a database
  index, and matched ignoring case and surrounding spaces.
- Consoles and games each have their own `collection_id`, and both require a
  console label. Owner-scoped labels are safe because only owners write (see
  "All sharing is read-only"), so no other user can attach to or change a
  label.
- Console and game forms share one searchable dropdown of the signed-in
  user's labels (the shadcn Combobox, installed by the owner on 2026-10-16;
  it added `@base-ui/react` and `radix-ui`). It is labeled "Console label" on
  console forms and "Console" on game forms. It only selects from a list, so
  whenever what you type matches no label exactly it also offers an
  `Add "name"` row, the "creatable" pattern in Base UI's docs. A collection
  with no consoles, such as "Games to sell", can still hold games for any
  platform.
- Changing only the capitalization of a console's label renames the label
  (2026-10-17); before, the matching label was found and the change ignored.
  The rename applies to every console and game that uses the label.
- A label is deleted only when no console and no game, in any of the owner's
  collections, uses it. Deleting or relabelling the last console no longer
  fails while games use its label.
- The label list is per user (`GET /console-labels`), not per collection. A
  console's game count is the number of games with its label across all of the
  owner's collections (changed 2026-10-17; it counted only its own collection),
  so every console with that label shows the same number.
- Deferred, not rejected: a rename-label action (the link from items to
  labels is a real foreign key, so a rename would update every item), and a
  small screen to manage labels.
- Migration `b8e1d6a42c07` drops and recreates the grants, labels, consoles,
  and games tables, deleting any rows in them. The owner confirmed there was
  no data worth keeping, and a database backup is the safety net.
- **Supersedes** from "Video-game rules" (2026-10-05): labels are scoped per
  collection, a console must exist before a game, and the last console cannot
  be deleted or relabelled while games use its label. It also replaces three
  same-day versions (console optional; console required but per-collection
  labels; labels per collection with inline create) that were tried in the dev
  stack and dropped.

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
- ~~Console must exist before a game for its label.~~ Superseded 2026-10-16
  (see above). The game dropdown shows each distinct label once.
- Condition is a fixed list: `Loose`, `CIB`, `New`, `Item & Box`.
- Deleting a console edition is allowed while another edition of the same
  label remains; deleting the last edition is blocked while games use the
  label. Game deletion asks for confirmation.
- Duplicate game and console names are allowed within a collection. A console
  game count is derived, never stored.
- The module is named `video_games` (not `catalog`) to avoid implying a
  shared reference catalog.

## Code and UI conventions

### Login branding: backdrop text, two fonts, two brand colors — 2026-10-18
- The login page shows "DON'T LOOK AT MY STUFF" as a faint full-screen
  background. DON'T is turned sideways on the left, at the screen's full height
  (its width capped at a quarter of the screen); LOOK / AT MY / STUFF is
  stacked beside it, each line stretched to the width left over. The whole
  group is centered. On a wide screen the height limit makes the lines narrower
  than the space, so the group is centered rather than stretched. Tried and
  dropped: choosing one, two, or three lines to fit the screen shape, and a
  single block sized to the largest fit; the owner preferred the plain
  centered stack.
- The text is measured in the browser (font-independent) and re-fitted on
  resize and font load. It is decorative and hidden from assistive tech. The
  login card is 80% opaque so the text shows through faintly; computed
  contrast stays about 19:1 for body text, but muted text drops to the AA
  line at lower opacity, so do not go below 80% without checking.
- Fonts: Fira Code is the app font (`--font-sans`); Półtawski Nowy is for the
  logo text only (`--font-logo`). Both come from `@fontsource-variable`
  packages, so they are self-hosted and visitors' browsers make no request to
  a font service.
- Brand colors, taken from the owner's portfolio site palette: `--teal`
  (`#17b890`, the selected-collection accent bar) and `--red` (`#ba3f2c`, a
  dark red from flamingo's hue, 5.25:1 on `#fafafa`; used for DON'T and
  intended for errors). Dark-mode variants and the `aa`/`aaa` variants are not
  defined; `--destructive` has not been repointed.
- The sidebar header shows a `D.L.A.M.S.` wordmark instead of the "D" square
  and "DLAMS" text, in the same two fonts and colors: the logo font, the first
  D and its period in `red`, the rest in the sidebar text color at full
  strength, fitted to the old header height (76px). The periods mark it as an
  acronym of the login text and cost about a quarter of the size. The home
  link's accessible name stays "DLAMS home", and the app name stays plain
  DLAMS everywhere else.
- The favicon is the wordmark's red D alone, as a static
  `dlams-ui/public/favicon.svg` on a transparent background. The letter is the
  bold Półtawski Nowy D converted to a path (a favicon cannot load web fonts),
  made with a throwaway `fonttools` install outside the repo. SVG only; older
  Safari may show no icon until a PNG fallback is added.
- On phones (below `md`) the login page shows the logo above the form instead
  of behind it, at full strength, because a card centered over the logo hides
  most of it. The page is a three-row grid (logo row, card, empty row of equal
  size), so the card is exactly centered and the logo is fitted to the space
  above it. Tried and dropped: splitting the text above and below the card
  (DON'T LOOK on top, AT MY STUFF below, in two lines or four) and a fixed
  288px logo block above the card. From 768px up, the logo stays faint behind
  the card.
- Below `md` the sidebar is replaced by a top bar with a menu button and a
  small wordmark; the button opens the same sidebar contents in a left drawer,
  which closes when the page location changes (picking a collection).
- Considered and dropped: reusing the login backdrop behind the whole app
  (it would need translucent panels so muted text stays above the AA line),
  and a smaller copy of the login logo in the sidebar header. The owner
  chose the wordmark.


### Generated shadcn files may be edited, with the owner's approval — 2026-10-26
- Editing a file the shadcn CLI generated is allowed when the owner approves
  it. Shadcn's docs call it open code ("The top layer of your component code
  is open for modification"). Before, the rule was never to edit them.
- Reason: axe found the combobox's dropdown-arrow button had no accessible
  name. A one-line `aria-label` on the generated `ComboboxTrigger` was simpler
  than copying its markup into our own component, which would have
  duplicated generated code.
- Cost: a reinstall can overwrite an edit. The local edits are listed in
  `.github/copilot-instructions.md` with how each is noticed if lost; check
  `npx shadcn@latest add <component> --diff` before reinstalling.
- **Supersedes** "never edit generated files" (2026-10-14 conventions). The
  rule that the owner, not Claude, runs the CLI is unchanged.

### Muted text and input borders darkened to meet contrast — 2026-10-27
- Two light-theme tokens in `index.css` changed: `--muted-foreground` (L 0.554
  to 0.52) so small muted text, such as the "owner" badge, reaches the 4.5:1 AA
  line (badge 4.35 to 5.02:1), and `--input` (L 0.929 to 0.65) so input borders
  reach the 3:1 that WCAG 1.4.11 asks of form-field boundaries (1.23 to
  3.23:1). Found by axe-style review of the theme and confirmed by Firefox's
  contrast check on the badge. Ratios are calculated from the tokens.
- The sidebar access badge is a black pill with white text, the same for
  `owner` and `view-only` (owner's choice, 2026-10-27): `bg-foreground` with
  `text-background`, 20.17:1. It was tried grey (4.35:1, failing), then
  solid blue and yellow, then those at 50%, and dropped each as too loud or too
  soft. The `blue` and `yellow` theme colors added for those attempts were
  removed. The word on the badge, not its color, says which access it is.
- The selected-collection bar in the sidebar is `red` instead of `teal`
  (owner's choice, 2026-10-27), the same red as the D in the logo. Teal was
  2.42:1 against the sidebar, under the 3:1 WCAG 1.4.11 asks of a graphical
  cue, and the bar is the only visible cue for the selection (the selected and
  unselected text colors are near-identical). Red is 5.23:1. The `teal` theme
  color stays in `index.css` but nothing uses it now.
- Not changed: `--ring`, and the dark theme tokens, which the app never turns
  on.
- **Supersedes** the "default input border is about 1.2:1" finding in the
  plan's accessibility item.

### Combobox popups render inside their drawer through a `container` prop — 2026-10-17
- A combobox popup renders in a portal outside the drawer, so a click on an
  option can count as an outside click and close the drawer. `ComboboxContent`
  in the generated `combobox.tsx` accepts a `container` prop for the portal,
  and the console and game drawers pass a ref on their `DrawerContent`
  through `ConsoleLabelCombobox`.
- This is a local edit to a generated shadcn file (see the 2026-10-26 entry
  below for the rule). A reinstall removes it, and `tsc` then fails on the `container` prop, which points at what to
  re-apply.
- Tried and dropped: an `onInteractOutside` handler that matches the popup
  with a selector (fragile), a drawer wrapper component with the same handler,
  and Base UI's `inline` list (always open, so it does not scale to many
  consoles). A combobox popup shell composed in our own file would avoid the
  edit but duplicates the generated popup markup.
- The drawer-dismissal cause was never confirmed in a browser or from the
  library docs.

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
- Testing reference point (2026-10-26): Kent C. Dodds, "Write tests. Not too
  many. Mostly integration." (https://kentcdodds.com/blog/write-tests) is the
  guide for when to write a test and which kind: the testing trophy, no
  coverage target, no implementation-detail tests, minimal mocking. The rules
  are in `.github/copilot-instructions.md` ("Testing"). This sharpens the
  entry above; it does not supersede it.
