PYTHON ?= python3

.PHONY: dev-graph dev-ingestion init-graph-db test-python

init-graph-db:
	cd apps/graph-service && $(PYTHON) -m pip install -r requirements.txt && $(PYTHON) -m app.db.init_db

dev-graph:
	cd apps/graph-service && $(PYTHON) -m pip install -r requirements.txt && GRAPH_DB_URL=$${GRAPH_DB_URL:-postgresql+asyncpg://postgres:postgres@localhost:5432/aether} $(PYTHON) -m uvicorn app.main:app --reload --port $${PORT:-8001} --host 0.0.0.0

dev-ingestion:
	cd apps/ingestion-service && $(PYTHON) -m pip install -r requirements.txt && GRAPH_SERVICE_URL=$${GRAPH_SERVICE_URL:-http://localhost:8001} $(PYTHON) -m uvicorn app.main:app --reload --port $${PORT:-8002} --host 0.0.0.0

test-python:
	$(PYTHON) -m pytest -q
