# DLAMS

DLAMS has a React frontend, a FastAPI backend, and PostgreSQL.

- To run the app, follow [`dlams-deployment/README.md`](./dlams-deployment/README.md).
- For project plans and decisions, see [`DLAMS-PLAN.md`](./DLAMS-PLAN.md).

## Repository layout

This is a monorepo. Each folder keeps its own manifests and README:

- `dlams-ui/` — React frontend
- `dlams-fastapi/` — FastAPI backend
- `dlams-deployment/` — Docker Compose and Nginx

Pushing to `main` runs `.github/workflows/deploy.yml` on the Raspberry Pi
runner, which pulls `~/dlams` and rebuilds `api`, `ui`, and `nginx`. Production
needs `dlams-deployment/.env` on the Pi with `SECRET_KEY` and the `POSTGRES_*`
values (see `dlams-deployment/.env.example`); it is not committed.

