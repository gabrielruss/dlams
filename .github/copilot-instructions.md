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
  `dlams-ui/src/components/ui/`; shadcn/ui is component source, not a runtime
  dependency in `package.json`. Reuse these components and follow shadcn
  conventions rather than introducing a competing component system.
- `components/ui/combobox.tsx` has one local edit: `ComboboxContent` accepts a
  `container` prop forwarded to the portal, so a combobox inside a drawer can
  render its popup within the drawer (otherwise clicking an option counts as
  an outside click and closes the drawer). The drawer managers pass a ref on
  their `DrawerContent` through `ConsoleLabelCombobox`. Re-apply the edit after
  reinstalling; if it is lost, `tsc` fails on the `container` prop.
- Re-running the CLI overwrites the generated file (for example it restored
  `buttonVariants` in `button.tsx` and moved it to the `radix-ui` package). The
  `react-refresh/only-export-components` lint rule is off under
  `src/components/ui/` for that reason; review the diff after each install.
- The shadcn CLI emits `import { cn } from "cn"` and installs the `cn`
  package (a clsx + tailwind-merge replacement). Leave generated imports
  alone; `@/lib/utils` also works and both coexist (decided 2026-10-14).
- Never edit files the shadcn CLI generated in `src/components/ui/`, including
  small fixes, lint cleanups, and unused classes. Change the consuming
  component instead, or ask the owner to reinstall or customize the file.
  The only local edit is the `container` prop in `combobox.tsx` (above); do not
  add others.
- Do not install packages or run the shadcn CLI. When a shadcn component is
  needed, tell the owner which one and give the command
  (`npx shadcn@latest add <component>`, from `dlams-ui/`); the owner runs it.
  Do not write the component file by hand as a substitute. When a component
  requires a dependency, explain which package is needed and wait for the
  owner to install it before wiring the component or validating a build that
  depends on it.
- TanStack Query v5 is installed and is the standard for server state.
- Backend tests use `unittest`. Write new tests with `unittest` until pytest is adopted. Do not add pytest-only features.
- Ruff and pytest are not configured. Never claim they were run. Adopting them is a separate, focused tooling change, not part of a feature.
- Redux is not used. Do not add it.
- Backend runs on Python 3.13 (see `dlams-fastapi/Dockerfile`). Check project config before using newer language features.

## Commands

- Frontend build (from `dlams-ui/`): `npm run build`
- Frontend lint (from `dlams-ui/`): `npm run lint`
- Hybrid host UI (from `dlams-ui/`): `npm run dev:hybrid`
- Frontend tests: none configured yet.
- Backend tests (from `dlams-fastapi/`): `.venv/bin/python -m unittest discover -s tests -v`
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
- **Auth**: the HTTP-only session cookie is managed by the browser/API; the
  current-user profile from the API is server state in TanStack Query.
- **Form drafts**: keep in local component/form state (React Hook Form for
  submitted data-entry forms) until submit, then send a mutation.

## Frontend (React + TypeScript)

- Follow the UI stack: Vite, Tailwind CSS, shadcn/ui, React Router,
  and TanStack Query v5 for server state.
- Prefer the existing shadcn-style components in `src/components/ui/`.
  shadcn/ui components are maintained in the project source; do not expect a
  `shadcn` runtime package. Add or adapt components using the project's
  established shadcn conventions. When a shadcn component is needed, the owner
  adds it with the shadcn CLI (see above); review its generated source and
  wire it up rather than hand-rolling a parallel primitive.
- Functional components and hooks. Strict TypeScript: no `any` or unsafe casts; type API data and props explicitly.
- Prefer derived values over duplicated state. Use effects only to sync with external systems.
- Do not add `void` solely to discard a promise unless it provides a concrete
  benefit, such as satisfying a configured lint rule or documenting an
  intentional fire-and-forget boundary.
- Move nontrivial data loading, stateful workflows, and reusable component
  behavior into focused custom hooks so components primarily describe their
  rendered structure. Keep hooks feature-scoped and avoid extracting trivial
  one-off presentation state without a readability benefit.
- Use React Hook Form for submitted data-entry forms, including simple
  collection and item forms. Keep standalone controls such as selectors and
  search fields as ordinary inputs unless they belong to a submitted form.
- Keep pages structural. `Home` and other route pages compose feature components and must not own collection fetching, selection, or item CRUD.
- Organize by feature/domain. Keep related components, hooks, API functions,
  and types easy to locate, but do not force unrelated responsibilities into
  one file or folder. Share code only when it is genuinely shared.
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

Styling pass status: **not started** (change to **complete** once the owner finishes customizing styles).

- Not started: add only minimal styles needed to make a feature usable, scoped to the new component. Do not change global styles, design tokens, or shared component styles.
- Complete: ask before any CSS or styling change (global styles, tokens, component styles, Tailwind classes), even small ones. After approval, limit edits to the approved scope.

## Permissions model

- Registration is invitation-only. The API must require a valid, unexpired,
  unused invitation and consume it atomically with account creation. Store
  only a hash of the bearer token; never add an unguarded public signup path.
  Only admins may issue invites. Bootstrap the first admin through the
  operator-run API command, not a public endpoint.
- A collection owner can read, write, and manage who the collection is shared
  with. All sharing is read-only: a shared user can read but never write
  through the API. Demo accounts (role `demo`) can only make `GET` requests;
  browser-local editing for them is planned but not implemented.
- Global `admin` does not grant implicit access to collections the admin does
  not own or have been shared.
- Enforce ownership/grants on every protected endpoint. Never trust a client-supplied owner, role, or cross-collection resource ID.
- Tests for protected API behavior must collectively cover unauthenticated
  access, no grant, shared-user write rejection, owner access, and
  cross-collection resource IDs. Use representative endpoint tests rather
  than duplicating every case for every route.

## Backend (FastAPI + SQLAlchemy)

- Follow PEP 8. Use modern type hints (`X | None`, built-in generics) and annotate handlers and helpers.
- Pydantic v2 schemas with explicit request/response contracts and `response_model` where a response is defined.
- Organize routers, schemas, services, and tests by resource. Keep console and game endpoints in separate modules.
- Keep handlers thin: handle HTTP concerns, validation, authorization, and orchestration. Extract substantial or reused domain logic into a service/helper; do not add a service layer for trivial one-off operations.
- Use FastAPI dependencies for DB sessions and current identity; prefer `Annotated` aliases.
- For new and refactored code, use SQLAlchemy 2.0 style: `DeclarativeBase`, `Mapped`/`mapped_column`, and `select()` with `Session.execute()`/`scalars()`/`scalar()`. Avoid `declarative_base()` and `Session.query()` in new code; migrate existing uses when refactoring the relevant code, not as unrelated cleanup.
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

Update `DLAMS-PLAN.md` when status, next steps, or known issues change. Update `docs/architecture.md` when structure changes (components, endpoints, data model, auth or access rules, deployment, major dependencies). Record architectural decisions in `docs/decisions.md` with the date and reason, marking anything they supersede. Do not log routine refactors; git history covers them.

## Git

- The owner commits and pushes everything themselves. Do not commit or push,
  and do not offer to.
- Leave changes uncommitted for review. A push to `main` deploys to
  production, so say what the owner should do before pushing (for example a
  database backup before a migration).