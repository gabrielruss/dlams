# DLAMS

Monorepo: `dlams-ui` (React/Vite), `dlams-fastapi` (FastAPI/PostgreSQL),
`dlams-deployment` (Docker Compose/Nginx).

Start here, in order:

1. [`DLAMS-PLAN.md`](./DLAMS-PLAN.md) — current status, next steps, known
   issues, open questions, and the rules for keeping it up to date.
2. [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) —
   coding conventions, verified commands, and workflow.
3. [`docs/decisions.md`](./docs/decisions.md) — why things are the way they
   are. `docs/archive/` is history only and may be stale.
4. [`dlams-deployment/README.md`](./dlams-deployment/README.md) — how to run
   the app locally.

Rules that are easy to miss:

- **This repository is public.** Never put secrets, credentials, or
  infrastructure layout in tracked files. Operational and security notes live
  in `.private/ops-notes.md` (git-ignored; read it if it exists, and ask the
  owner if it does not).
- Leave changes uncommitted unless the owner asks for a commit. A push to
  `main` deploys to production, so never push without being asked.
- Ask before installing packages, running the shadcn CLI, or changing styling.
- Do not claim a check passed unless it was run.
