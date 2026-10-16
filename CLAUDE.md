# DLAMS

Monorepo: `dlams-ui` (React/Vite), `dlams-fastapi` (FastAPI/PostgreSQL),
`dlams-deployment` (Docker Compose/Nginx).

Start here, in order:

1. [`DLAMS-PLAN.md`](./DLAMS-PLAN.md) — read "Where we left off" first, then
   current status, next steps, known issues, open questions, and the rules for
   keeping it up to date.
2. [`docs/architecture.md`](./docs/architecture.md) — how the system is put
   together now: components, auth and access model, data model, API surface,
   stack, and deployment.
3. [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) —
   coding conventions, verified commands, and workflow.
4. [`docs/decisions.md`](./docs/decisions.md) — why things are the way they
   are. `docs/archive/` is history only and may be stale.
5. [`dlams-deployment/README.md`](./dlams-deployment/README.md) — how to run
   the app locally.

Rules that are easy to miss:

- **This repository is public.** Never put secrets, credentials, or
  infrastructure layout in tracked files. Operational and security notes live
  in `.private/ops-notes.md` (git-ignored; read it if it exists, and ask the
  owner if it does not). In a git worktree, `.private` is a symlink to the
  main checkout's copy. If it is missing, the main checkout is the first entry
  of `git worktree list`; read `.private/ops-notes.md` there.
- The owner commits and pushes everything themselves. Leave changes in the
  working tree and do not offer to commit. A push to `main` deploys to
  production.
- Ask before installing packages or changing styling. When a shadcn component
  is needed, give the owner the install command and wait; do not run the CLI
  or write the component file yourself.
- Do not claim a check passed unless it was run.
