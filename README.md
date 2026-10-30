# DLAMS

A collection tracker I built for fun. Accounts are invite-only, and visitors can try the demo in a temporary account that is deleted after 30 minutes. Live demo: <https://dontlookatmystuff.com>

## Architecture

```
Browser ──► Nginx ──► ui   (React, served as static files)
               │
               └────► api  (FastAPI) ──► db (PostgreSQL)
```

| Folder             | Stack                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `dlams-ui`         | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router, React Hook Form, Zod |
| `dlams-fastapi`    | FastAPI, SQLAlchemy 2, Alembic, PostgreSQL                                                              |
| `dlams-deployment` | Docker Compose, Nginx, GitHub Actions                                                                   |

- The API is the security boundary; the UI hides controls but every rule is enforced server-side.
- Auth: HTTP-only cookie holding an HS256 JWT. Registration requires a single-use, expiring invitation.
- Roles: `user`, `admin`, `template`, `sandbox`. "Try the demo" copies the `template` account into a temporary `sandbox` account, capped at 10 at once, with limits on what it can add and no sharing.
- Access: owner (read and write) or shared (read-only). Admins have no implicit access to collections.
- Migrations run on API start. A push to `main` deploys through GitHub Actions.
- CI runs lint, frontend tests (Vitest, Testing Library, MSW, axe), the build, and backend lint, format check (Ruff), and tests (`unittest`).

Details: [`docs/architecture.md`](./docs/architecture.md) · decisions: [`docs/decisions.md`](./docs/decisions.md) · status: [`DLAMS-PLAN.md`](./DLAMS-PLAN.md)

## Run locally

```bash
make dev
```

UI at <http://localhost:5174>, API docs at <http://localhost:8001/docs>. First-admin setup and other run modes: [`dlams-deployment/README.md`](./dlams-deployment/README.md).

```bash
cd dlams-ui && npm test
cd dlams-fastapi && SECRET_KEY=test python -m unittest discover -s tests
```
