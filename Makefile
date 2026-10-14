# Shortcuts for local development. Run `make help` to list them.
# Production is deployed by the GitHub Actions workflow, not from here.

COMPOSE = docker compose -p dlams-dev -f dlams-deployment/docker-compose.dev.yml

.PHONY: help dev watch logs down test

help:
	@echo "make dev    Build and start the dev stack in the background"
	@echo "            UI http://localhost:5174, API docs http://localhost:8001/docs"
	@echo "make watch  Start the stack and keep the API in sync with your edits"
	@echo "            (restarts on app/ and alembic/ changes, rebuilds on requirements.txt)"
	@echo "make logs   Follow the dev stack logs"
	@echo "make down   Stop the dev stack (keeps the dev database)"
	@echo "make test   Run the backend unit tests (needs dlams-fastapi/.venv)"

dev:
	$(COMPOSE) up --build -d
	@echo "UI: http://localhost:5174   API docs: http://localhost:8001/docs"

watch:
	$(COMPOSE) up --build --watch

logs:
	$(COMPOSE) logs -f

down:
	$(COMPOSE) down

test:
	cd dlams-fastapi && .venv/bin/python -m unittest discover -s tests -v
