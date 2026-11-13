# DLAMS Copilot Instructions

Applies across the DLAMS workspace. Project-local conventions take precedence when they add compatible detail.

## Workspace

- `dlams-ui/`: React + TypeScript frontend.
- `dlams-fastapi/`: FastAPI + SQLAlchemy backend.
- `dlams-deployment/`: Docker Compose and deployment config.
- `DLAMS-PLAN.md`: current status, next steps, known issues, and open questions.
- `docs/architecture.md`: how the system is put together now (components, auth and access, data model, API surface, stack, deployment).
- `docs/decisions.md`: dated decisions and their reasons; `docs/archive/` holds history.
- `.private/ops-notes.md`: git-ignored operational and security notes. The repository is public: never put secrets, credentials, or infrastructure layout in tracked files.

## Current tooling (what exists today)

- Frontend architecture: Vite, Tailwind CSS, shadcn/ui components, React
  Router, and TanStack Query v5 for server state. There is no client-state
  store library (Zustand was removed 2026-10-14 because nothing used it).
- The UI already has local shadcn-style components under
  `dlams-ui/src/components/ui/`; shadcn/ui is component source. The `shadcn`
  package in `package.json` supplies `shadcn/tailwind.css`, not components.
  Reuse these components and follow shadcn conventions rather than introducing
  a competing component system.
- Local edits to generated files. Re-apply these after reinstalling a
  component (run `npx shadcn@latest add <component> --diff` first to see what
  would change). In `components/ui/drawer.tsx`:
  - Side drawers set `data-[swipe-axis=x]:[--drawer-content-height:100svh]`
    (2026-11-05), so on iOS 26 Safari the drawer ends above the floating
    toolbar instead of behind it (it measured `lvh` 739, `svh` 699). If it is
    lost, the pinned Save / Cancel footer is cut off on iPhones; tests do not
    catch it. Re-evaluate with plan item 15 (phone-friendly drawers).
  In `components/ui/combobox.tsx`:
  - The unused `children` in `ComboboxChipsInput` was removed (2026-10-18) so
    lint passes; a reinstall brings that lint error back.
  - `ComboboxTrigger` has `aria-label="Show options"` (2026-10-26), so the
    dropdown-arrow button has an accessible name. If it is lost, the axe tests
    for the Add console and Add game drawers fail.
  - `ComboboxInput` uses `render={<ComboboxTrigger />}` on `InputGroupButton`
    (2026-11-04, the Base UI `Button` has no `asChild`; matches the base
    registry). If it is lost, `tsc` fails on `asChild`.
  In `components/ui/calendar.tsx`:
  - `CalendarDayButton` passes its `ref` to `Button` (2026-11-07). The
    generated file makes the ref to focus the active day but never attaches
    it (react-day-picker's own `DayButton` does). If it is lost, arrow keys
    stop moving between days and the calendar no longer opens on today; the
    last played picker tests fail. shadcn's `bases/radix` calendar has it.
  - `dropdown_root` adds `has-focus:ring-[3px] has-focus:ring-ring/50`
    (2026-11-08, from shadcn's `new-york-v4` calendar). The month and year
    controls are transparent native `<select>`s, so without it their focus
    is invisible. Tests do not catch a lost ring; check by tabbing.
- Re-running the CLI overwrites the generated file (for example it restored
  `buttonVariants` in `button.tsx` and moved it to the `radix-ui` package). The
  `react-refresh/only-export-components` lint rule is off under
  `src/components/ui/` for that reason; review the diff after each install.
- The shadcn CLI emits `import { cn } from "cn"` and installs the `cn`
  package (a clsx + tailwind-merge replacement). Leave generated imports
  alone; `@/lib/utils` also works and both coexist (decided 2026-10-14).
- Ask before editing a file the shadcn CLI generated in
  `src/components/ui/`. Editing is fine in principle (shadcn is open code,
  meant to be modified), but a reinstall can overwrite an edit. Prefer
  changing the consuming component when that is as simple. If the owner
  approves an edit, keep it small and add it to the list of local edits above.
- Do not install packages or run the shadcn CLI. When a shadcn component is
  needed, tell the owner which one and give the command
  (`npx shadcn@latest add <component>`, from `dlams-ui/`); the owner runs it.
  Do not write the component file by hand as a substitute. When a component
  requires a dependency, explain which package is needed and wait for the
  owner to install it before wiring the component or validating a build that
  depends on it.
- TanStack Query v5 is installed and is the standard for server state.
- Backend tests use `unittest`. Write new tests with `unittest` until pytest is adopted. Do not add pytest-only features.
- Ruff lints and formats the backend (config in `dlams-fastapi/pyproject.toml`; CI runs both checks). A Claude Code hook (`.claude/hooks/ruff-format.sh`) formats each edited `.py` file. Type checking is Pylance on `basic` in the editor; there is no mypy. pytest is not configured; never claim it was run.
- Redux is not used. Do not add it.
- Backend runs on Python 3.13 (see `dlams-fastapi/Dockerfile`). Check project config before using newer language features.

## Commands

- Frontend build (from `dlams-ui/`): `npm run build`
- Frontend lint (from `dlams-ui/`): `npm run lint`
- Frontend format (from `dlams-ui/`): `npm run format:check`, or
  `npm run format` to apply. Prettier (pinned in `devDependencies`, config
  in `.prettierrc`, generated `src/components/ui/` ignored) is also what
  VS Code formats with on save, and a Claude Code hook
  (`.claude/hooks/prettier-format.sh`) formats each edited UI file.
- Hybrid host UI (from `dlams-ui/`): `npm run dev:hybrid`
- Frontend tests (from `dlams-ui/`): `npm test` (Vitest, one run) or
  `npm run test:watch`. Tests sit beside the code as `*.test.tsx`. Use
  `renderApp(route)` from `src/test/renderApp.tsx` (fresh `QueryClient`,
  `MemoryRouter`, and a `userEvent` instance) and register MSW handlers per
  test with `server.use(...)` from `src/test/server.ts`. The API base in tests
  is `http://localhost/api`. A request with no handler fails with a network
  error and prints an `[MSW] Error`, but the test fails only if its
  assertions depend on that request; check the output for MSW errors.
- Backend tests (from `dlams-fastapi/`): `.venv/bin/python -m unittest discover -s tests -v`
- Backend lint and format (from `dlams-fastapi/`): `.venv/bin/ruff check .` and
  `.venv/bin/ruff format --check .` (drop `--check` to format; `ruff check
  --fix .` applies safe fixes). Ruff comes from `requirements-dev.txt`.
- Dev shortcuts (from the repo root): `make dev`, `make watch`, `make logs`,
  `make down`, `make test`; `make help` lists them.
- Local Docker stack (from `dlams-deployment/`):
  `docker compose -p dlams-dev -f docker-compose.dev.yml up --build -d`

Run the smallest relevant command for the change. Verify commands against
`package.json`, project manifests, and deployment docs when those change; do
not invent scripts.

## Scope and dependencies

- Keep changes focused on the request. Preserve existing behavior.
- Dependency upgrades are separate, explicitly requested changes. Do not bump versions during feature work.
- Do not add a library when an existing dependency solves the problem.
- Search the codebase for prior art before writing something similar.
- Surface errors; never silently swallow failures.

## Do not edit without being asked

- Lockfiles, except when a normal package-manager install is needed for an
  approved dependency change.
- Existing Alembic migrations that may have been applied. Add a new forward
  migration instead.
- Generated code and `.env` files. Never commit credentials or secrets.
- `dlams-deployment/` config unless the task requires a deployment change.

## State: where each kind lives

Decide by asking whether the data lives on the backend and the UI only holds a
cached copy.

- **Server state** (collections, items, grants, user profile, anything
  returned by the API): TanStack Query only. Do not mirror it into `useState`
  or another store as a second source of truth. Temporary
  form drafts and explicitly requested optimistic updates may differ from
  server data while being edited or submitted.
- **Client state** (drawer open, form drafts, theme, view preferences): local
  `useState` by default. If several distant components genuinely need to share
  client/UI state, ask the owner before adding a store library; it must hold
  only client/UI state, never data returned by the API.
- **Selections and filters**: store the ID, not the object, and look the data
  up via a query. Prefer URL params (route or search params) for state that
  should survive refresh or be shareable. The selected collection ID is in
  the URL search params; collection data is queried by TanStack Query.
  App paths come from `lib/routes.ts` (`routes.login`,
  `sharedCollectionPath(token)`) and search param names from
  `lib/urlParams.ts`; never type a path as a string (decided 2026-11-08).
- **Auth**: the HTTP-only session cookie is managed by the browser/API; the
  current-user profile from the API is server state in TanStack Query.
- **Form drafts**: keep in local component/form state (React Hook Form for
  submitted data-entry forms) until submit, then send a mutation.

## Frontend (React + TypeScript)

- Follow the UI stack: Vite, Tailwind CSS, shadcn/ui, React Router,
  and TanStack Query v5 for server state.
- New and changed code must use the installed components in
  `src/components/ui/` (`Button`, `Input`, `Label`, `Textarea`, ...), never a
  raw `<button>`, `<input>`, `<label>`, `<select>`, or `<textarea>` (none
  are left outside `components/ui/` since 2026-11-06; the 6a consistency
  check in the plan should print nothing). If no installed component fits,
  give the owner the install command and wait.
  Destructive final actions are `<Button variant="outline"
  className="border-destructive text-destructive">`, not the solid
  `destructive` variant; the button that starts a delete (before its
  confirm) uses the same red outline (2026-11-06). Every Close, of a
  drawer or the search panel, is `variant="outline"` at the default size
  (36px, like every other button; no button uses `size="sm"`); a main
  action is the default `Button`, with no extra hover or cursor classes
  (`index.css` sets the pointer cursor). Deleting from a drawer starts at the top right of
  the item area, never in the drawer header beside Close (decided
  2026-11-02). An item's view has Edit beside a red-outline trash icon and
  "Delete" (`aria-label` "Delete <type>"; decided 2026-11-03). The Edit
  collection drawer has a red trash-can icon alone (`variant="ghost"
  size="icon"`, `text-destructive`, `aria-label` and `title`).
- shadcn/ui components are maintained in the project source. Add or adapt
  components using the project's
  established shadcn conventions. When a shadcn component is needed, the owner
  adds it with the shadcn CLI (see above); review its generated source and
  wire it up rather than hand-rolling a parallel primitive.
- Functional components and hooks. Strict TypeScript: no `any` or unsafe casts; type API data and props explicitly.
- Prefer derived values over duplicated state. Use effects only to sync with external systems.
- A ternary chain has at most two `?` (one level of nesting, such as
  `a ? x : b ? y : z`); decided 2026-11-02. With a third, write it another
  way: a small function or component with early `if` returns, or a lookup
  object. ESLint has no rule for this limit (`no-nested-ternary` bans all
  nesting), so check by eye.
- Do not add `void` solely to discard a promise unless it provides a concrete
  benefit, such as satisfying a configured lint rule or documenting an
  intentional fire-and-forget boundary.
- Move nontrivial data loading, stateful workflows, and reusable component
  behavior into focused custom hooks so components primarily describe their
  rendered structure. Keep hooks feature-scoped and avoid extracting trivial
  one-off presentation state without a readability benefit.
- Every submitted form, even a one-field one, uses one pattern (decided
  2026-10-31; every form follows it since 2026-11-06):
  1. A zod schema in `src/schemas/<feature>.ts` with limits matching the
     API, and `type <Name>FormValues = z.infer<typeof schema>`.
  2. `useForm<Values>({ resolver: zodResolver(schema), defaultValues })`,
     in the feature hook when there is one, otherwise in the component.
  3. `<form onSubmit={form.handleSubmit(...)}>`; each field follows shadcn's
     React Hook Form guide (https://ui.shadcn.com/docs/forms/react-hook-form):
     `Controller` > `Field data-invalid={fieldState.invalid}` > `FieldLabel
     htmlFor`, the control (`Input`, `Textarea`, a select, a checkbox, or the
     combobox) with a matching `id` and `aria-invalid={fieldState.invalid}`,
     then `{fieldState.invalid && <FieldError errors={[fieldState.error]} />}`.
     Ids are `<form>-<field>` (`login-username`), unique on the page. No raw
     `<label>`.
  4. A mutation's error shows in a `<p role="alert">` below the fields.
  5. Submit is a default `Button`, disabled and relabeled ("Creating...")
     while pending; cancel is `variant="outline"`.
  Standalone controls that are not submitted (a search field, a selector)
  stay a plain `Input` without a form.
- Dates go through `src/lib/dates.ts` (backend: `app/dates.py`), one
  function per format, named for it (`isoDateToMonthDayYear`), built on
  `date-fns` rather than hand-made parsing or padding. Dates are
  shown as `MM-DD-YYYY` (decided 2026-11-06); the API and forms use
  `YYYY-MM-DD`.
- Keep pages structural. `Home` and other route pages compose feature components and must not own collection fetching, selection, or item CRUD.
- Organize by feature/domain. Keep related components, hooks, API functions,
  and types easy to locate, but do not force unrelated responsibilities into
  one file or folder. Share code only when it is genuinely shared. A
  feature's hooks live in its `hooks/` folder
  (`components/collections/hooks/`); hooks shared across features live in
  `src/hooks/` (decided 2026-11-06).
- When repeated component styles emerge across several instances, extract
  them into a reusable component when the behavior and semantics are also
  shared. Avoid premature abstraction for one-off or merely similar styling.
- API layer: one small shared transport client that throws on non-2xx, with
  endpoint functions in per-resource modules (auth, collections, consoles,
  games). Do not grow one catch-all API file.
- Split a component or module when it starts mixing responsibilities (rough guide: over ~250 lines is a prompt to check).
- Provide loading, empty, and error states, keyboard support, visible focus, and labeled form fields.
- Entity editing: prefer a right-side drawer that keeps page context. Use blocking modals only for confirmations.
- Put create/edit forms in right-side drawers rather than embedding them in
  collection or item lists. Keep list views and page context visible behind
  the drawer.
- A drawer is its own component that holds its open state and form and
  renders its trigger (`EditCollectionDrawer`, `ShareCollectionDrawer`), or
  takes it through a `renderTrigger` prop when the trigger differs by place
  (`CreateCollectionDrawer`). It does not live inside the screen that shows
  the trigger (decided 2026-11-06). Item drawers, which open from `?item=`,
  keep their content component and hook instead.
- UI permission gating is UX only; the API enforces authorization.

### Server state with TanStack Query

- Use v5 APIs only: single options-object signatures, `isPending` (not
  `isLoading`) for initial load, `gcTime` (not `cacheTime`).
- Define a query key factory per resource in that resource's API module
  (e.g. `collectionKeys.detail(id)`). Keys include every variable the query
  function uses. No inline key arrays.
- Share key + fetcher with `queryOptions()`, and wrap it in a feature hook
  (e.g. `useCollection(id)`) in the feature folder. Components do not call
  `useQuery` with ad hoc options.
- Query functions throw on errors. Catch only when translating a specific
  expected response (such as HTTP 401 meaning an unauthenticated session) to
  its explicit domain state. Never return success-shaped fallback data for
  unexpected failures.
- Use `enabled` for dependent queries. Defaults for `staleTime`/`retry` live
  in the single `QueryClient`; do not override per hook without a stated
  reason.
- Destructure the query result to the fields a component uses (for example,
  `data`, `isPending`, `isError`, and `error`) instead of retaining a generic
  `query` object when that improves readability. For repeated or reusable
  derived views, prefer a focused feature hook or TanStack Query's `select`.
- A query hook returns a named object: its data under the name the hook
  promises (`useOwnedItems` returns `ownedItems`, `useAdminUsers` returns
  `users`), with lists defaulting to `[]`, plus `isPending`, `isError`, and
  `error`. Not the raw query result, and not a bare value that drops the
  loading and error state. If the name is hard to match, the hook is
  probably doing two jobs: split it rather than stretch the name (decided
  2026-11-02; every query hook follows it since 2026-11-07). The returned
  object loses TanStack's type narrowing, so guard `error.message` with
  `error &&`, not `isError &&`.
- Mutations invalidate the affected keys in `onSuccess` (return the promise).
  Await invalidations so the mutation remains pending until affected views
  have refreshed. Changes to sharing or grants must invalidate both the
  collection and collection-list keys. Optimistic updates only when requested.
- Every query-backed view handles pending, error, and empty states.
- Do not mirror query data in component state or any other store.
- `@tanstack/eslint-plugin-query` is not installed. The owner controls
  dependency installation; do not add it or change package files without
  approval. When available, fix its warnings rather than disabling rules.
- Tests: create a fresh `QueryClient` per test with `retry: false`.
- Follow the official v5 docs for anything not covered here:
  https://tanstack.com/query/v5/docs/framework/react/overview

## Styling

Styling pass status: **complete** (the owner finished the mobile pass on 2026-10-26).

- Not started: add only minimal styles needed to make a feature usable, scoped to the new component. Do not change global styles, design tokens, or shared component styles.
- Complete: ask before any CSS or styling change (global styles, tokens, component styles, Tailwind classes), even small ones. After approval, limit edits to the approved scope.

## Testing

Reference: Kent C. Dodds, "Write tests. Not too many. Mostly integration."
(https://kentcdodds.com/blog/write-tests). Use it to decide when to write a
test and which kind.

- Write tests to gain confidence the app works, not to reach a coverage
  number. Do not chase 100% coverage or test trivial code.
- Testing trophy: static checks (TypeScript, ESLint) are the base, most tests
  are integration tests, and a few end-to-end tests sit on top. Unit tests are
  for pure logic that is hard to exercise through a flow.
- Test what a user sees and does. Do not test implementation details; you
  should rarely have to change a test when you refactor. No shallow rendering.
- Mock as little as possible. Mock at the network boundary (MSW) or for things
  that cannot run in a test, not the app's own modules or hooks.
- Put a test beside the feature it covers, named for it (for example
  `components/video-games/VideoGamesWorkspace.test.tsx`), so each collection
  type keeps its own tests. Cross-cutting flows such as sign-in live with their
  page (`pages/Login.test.tsx`).
- Accessibility: `expectNoViolations(container)` from `src/test/axe.ts` runs
  axe on rendered markup. Add it to the test for a screen rather than writing
  separate accessibility tests. jsdom cannot check color contrast, so that rule
  is off and contrast is checked in a real browser.
- Backend: add tests where they protect authentication, authorization, or
  persistent-data boundaries (see "Permissions model").

## Permissions model

- Registration is invitation-only. The API must require a valid, unexpired,
  unused invitation and consume it atomically with account creation. Store
  only a hash of the bearer token; never add an unguarded public signup path.
  Only admins may issue invites. Bootstrap the first admin through the
  operator-run API command, not a public endpoint.
- A collection owner can read, write, and manage who the collection is shared
  with. All sharing is read-only: a shared user can read but never write
  through the API. The demo template account (role `template`) is the source
  demo sessions copy. Demo-session accounts (role `sandbox`,
  `app/auth/sandbox.py`) write only to their own copy, within limits; they
  can create read-only share links but never share with users. A share link
  (`/shared/{token}`) is the only way to read a collection without signing
  in, and it is never an access level in the permission code.
- Global `admin` does not grant implicit access to collections the admin does
  not own or have been shared.
- Enforce ownership/grants on every protected endpoint. Never trust a client-supplied owner, role, or cross-collection resource ID.
- Tests for protected API behavior must collectively cover unauthenticated
  access, no grant, shared-user write rejection, owner access, and
  cross-collection resource IDs. Use representative endpoint tests rather
  than duplicating every case for every route.

## Backend (FastAPI + SQLAlchemy)

- Follow PEP 8. Use modern type hints (`X | None`, built-in generics) and annotate handlers and helpers.
- Pydantic v2 schemas with explicit request/response contracts. A route declares its response with its return type annotation; set `response_model` only when it differs from the return type. Ruff's FAST001 and FAST002 enforce this and the `Annotated` rule (decided 2026-11-13). FAST003 is off: Ruff does not follow a dependency alias, so routes that get a path parameter through one (`OwnedCollectionDep`) are false positives.
- Request schemas (the bodies routes accept) extend `RequestSchema` (`app/schemas.py`), which sets `extra="forbid"`, so an undeclared field is a 422 instead of being silently dropped (decided 2026-10-31; base class 2026-11-13). Response schemas extend `BaseModel`. Every request schema follows this, and `tests/test_request_schemas.py` lists each one with the body the UI sends; add a new request schema there.
- Organize routers, schemas, services, and tests by resource. Keep console and game endpoints in separate modules.
- Keep handlers thin: handle HTTP concerns, validation, authorization, and orchestration. Extract substantial or reused domain logic into a service/helper; do not add a service layer for trivial one-off operations.
- Dependencies are always `Annotated` aliases, never `x: T = Depends(f)` (decided 2026-10-31): `DbSessionDep` (`app/utils.py`), `CurrentUserDep` (`app/auth/utils.py`), and `CollectionWithAccessDep`, `ReadableCollectionDep`, `WritableCollectionDep`, `OwnedCollectionDep` (`app/collections/permissions.py`). Each alias ends in `Dep`, as in the FastAPI docs, so a route signature shows what is injected (decided 2026-11-11). Add a new alias beside its dependency function.
- Collection access is declared in the route signature through those aliases, never checked by a helper called in the body. `ReadableCollectionDep`: owner or grant. `WritableCollectionDep`: owner; a grant reader gets 403. `OwnedCollectionDep`: owner only, anyone else gets 404; use it for managing who can see a collection (grants, links). Route tests pass the collection in directly (as `create_link(request, collection, db)`), and the access rules are tested on the dependency functions, plus a test that each route declares its dependency.
- Queries use SQLAlchemy 2.0 `select()` with `db.scalars()`/`db.scalar()`/`db.get()`, never `db.query()`. Models use `Mapped`/`mapped_column`. All of `app/` follows this, and `Base` in `app/db.py` is a `DeclarativeBase`. Pydantic settings use `model_config = ConfigDict(...)`, never a v1 `class Config`. Each `APIRouter` is named for what it serves (`collections_router`, `console_labels_router`), never a bare `router`, so `main.py` imports every router without `as` (decided 2026-11-11).
- Transactions: commit successful writes, roll back failures before reuse, and never turn a DB failure into a success-shaped response.
- Return intentional status codes and error details. No broad `except`, and never expose internal exception details to clients.
- Enforce durable invariants with DB constraints (foreign keys, unique/check constraints, indexes) in addition to API validation.

## Migrations

- Schema changes use new forward Alembic migrations. Review autogenerated output; do not accept it blindly. Keep migrations deterministic and explicit.
- Never run migrations against production or change production data without explicit authorization and an agreed backup/validation procedure.

## Workflow

For features, refactors, or anything touching architecture:

1. Read `DLAMS-PLAN.md` and the relevant source.
2. Search for similar components, hooks, API clients, and tests.
3. Confirm behavior, permissions, and error states against the API contract.
4. Implement the smallest complete change and run focused validation.
5. For user-visible features, give safe local manual test steps with expected results.

Small, isolated edits (typos, one-line fixes) can skip steps 1-3.

Build a feature in layers when it allows, one reviewable step at a time,
each with its tests passing and the owner able to try it before the next:
for example the API endpoint, then the UI data layer (API module, query
hook, pure logic), then the visible UI, then the follow-on behavior. Say
what the next layer is at the end of each step.

Update `DLAMS-PLAN.md` when status, next steps, or known issues change. Update `docs/architecture.md` when structure changes (components, endpoints, data model, auth or access rules, deployment, major dependencies). Record architectural decisions in `docs/decisions.md` with the date and reason, marking anything they supersede. Do not log routine refactors; git history covers them.

## Git

- The owner commits and pushes everything themselves. Do not commit or push,
  and do not offer to.
- Leave changes uncommitted for review. A push to `main` deploys to
  production, so say what the owner should do before pushing (for example a
  database backup before a migration).