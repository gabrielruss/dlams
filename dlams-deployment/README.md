# DLAMS Deployment

Orchestrates dlams-ui and dlams-fastapi with shared nginx.

## Setup

1. Clone all repos as siblings:

   ```
   parent-dir/
   ├── dlams-deployment/
   ├── dlams-ui/
   └── dlams-fastapi/
   ```

2. Create `.env` (or use defaults):

   ```bash
   cp .env.example .env
   ```

3. Run:
   ```bash
   docker-compose up -d --build
   ```

## Access

- App: http://localhost
- API docs: http://localhost/api/docs
