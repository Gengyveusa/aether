# AETHER  
![Aether logo](assets/Aether%20Favicon.png)  

AETHER — Multi-Agent GEo Visibility Engine optimizing brand presence for LLM crawlers and AI systems.  

## Mission  
AETHER optimizes the discoverability and representation of a brand across AI‑powered crawlers and large language models. The system orchestrates multiple specialized agents that simulate web crawlers, analyze content, build knowledge graphs and compute a GEo visibility score to ensure that a brand's information is accurately and prominently represented in generative AI systems.  

## Architecture  
AETHER is composed of several autonomous agents working together:  
- **Crawler Simulator** – mimics LLM-powered web crawlers to explore the brand's online presence, retrieving pages and metadata.  
- **Content Analyzer** – processes and summarizes page content, extracting entities and assessing quality, relevance and tone.  
- **Knowledge Graph Builder** – constructs and updates a structured knowledge graph from extracted entities, capturing relationships.  
- **Orchestrator** – coordinates agent interactions, manages pipelines and aggregates results into actionable insights.  
- **GEo Scoring** – calculates the brand's GEo visibility score based on presence, quality and diversity across sources.  

## Directory Structure  
The repository will follow this layout:  
- `crawler_simulator/` – agent that fetches and simulates crawling.  
- `content_analyzer/` – agent for text analysis and summarization.  
- `knowledge_graph_builder/` – agent to assemble a knowledge graph.  
- `orchestrator/` – core orchestrator to manage agent workflows.  
- `pipelines/` – pipeline definitions for tasks like crawling & analysis.  
- `geo_scoring/` – functions for computing visibility scores.  
- `assets/` – static assets including the AETHER logo.  

---  

## Monorepo apps (Aether.ai vertical slice)

Current end-to-end flow (in-memory):
- Create Brand via **gateway** `POST /brands` → forwards to **graph-service** `POST /entities`, generates CanonicalContent via **content-service**, persists via **graph-service** `PUT /canonical-content/{entityId}`.
- Read entity via **gateway** `GET /entities/:id` → **graph-service** `GET /entities/{id}`.
- Read CanonicalContent via **gateway** `GET /canonical-content/:entityId` → **graph-service** `GET /canonical-content/{entityId}`.

### Ports
- **gateway**: `3001`
- **rag-service**: `3002`
- **content-service**: `3003`
- **graph-service**: `8001`
- **ingestion-service**: `8002`
- **observability-service**: `3004`

### Env vars
- **gateway**
  - `GRAPH_SERVICE_URL` (default: `http://localhost:8001`)
  - `CONTENT_SERVICE_URL` (default: `http://localhost:3003`)
  - `INGESTION_SERVICE_URL` (default: `http://localhost:8002`)
  - `RAG_SERVICE_URL` (default: `http://localhost:3002`)
  - `OBSERVABILITY_SERVICE_URL` (default: `http://localhost:3004`)
- **shared (Node services)**
  - `LLM_PROVIDER` = `stub` | `vertex` (default: `stub`)
  - `LLM_MODEL` (default: `stub-model`)
  - `VERTEX_PROJECT_ID` / `VERTEX_LOCATION` (used by Vertex providers)
  - `LLM_PROJECT_ID` / `LLM_LOCATION` (optional overrides)
  - `EMBEDDINGS_PROVIDER` = `stub` | `vertex` (default: `stub`)
  - `EMBEDDINGS_MODEL` (default: `stub-embeddings`)
  - `EMBEDDINGS_PROJECT_ID` / `EMBEDDINGS_LOCATION` (optional overrides)
  - `VECTOR_BACKEND` = `in_memory` | `qdrant` (default: `in_memory`)
  - `QDRANT_URL` (default: `http://localhost:6333`)
  - `QDRANT_COLLECTION` (default: `aether-entities`)
  - `QDRANT_VECTOR_SIZE` (default: `64`)
  - `GRAPH_BACKEND` = `postgres` | `neo4j` | `in_memory` (default: `postgres`)
- **content-service**
  - `GRAPH_SERVICE_URL` (default: `http://localhost:8001`)
- **rag-service**
  - `GRAPH_SERVICE_URL` (default: `http://localhost:8001`)
- **graph-service**
  - `GRAPH_DB_URL` (default: `postgresql+asyncpg://postgres:postgres@localhost:5432/aether`)
- **ingestion-service**
  - `GRAPH_SERVICE_URL` (default: `http://localhost:8001`)
- **observability-service**
  - (none yet; in-memory only)

### Dev commands

Postgres (docker):

```bash
docker compose up -d postgres
```

TypeScript services (works with `npm` or `pnpm` at repo root):
- `npm run dev:gateway`
- `npm run dev:content`
- `npm run dev:rag`
- `npm run dev:observability`
- `npm run dev` (runs all Node services together)

Python services:
- Graph service:

```bash
python3 -m pip install -r apps/graph-service/requirements.txt
cd apps/graph-service
GRAPH_DB_URL='postgresql+asyncpg://postgres:postgres@localhost:5432/aether' python3 -m app.db.init_db
GRAPH_DB_URL='postgresql+asyncpg://postgres:postgres@localhost:5432/aether' python3 -m uvicorn app.main:app --reload --port 8001 --host 0.0.0.0
```

- Ingestion service:

```bash
python3 -m pip install -r apps/ingestion-service/requirements.txt
cd apps/ingestion-service
GRAPH_SERVICE_URL='http://localhost:8001' python3 -m uvicorn app.main:app --reload --port 8002 --host 0.0.0.0
```

Or using `make`:

```bash
make dev-graph
make dev-ingestion
make test-python
```

### Example: hit the vertical slice

1) Create brand (gateway):

```bash
curl -sS -X POST http://localhost:3001/brands \\
  -H 'content-type: application/json' \\
  -d '{
    "slug": "acme",
    "displayName": "Acme",
    "description": "Example brand.",
    "websiteUrl": "https://acme.example",
    "primaryTopics": ["widgets"],
    "targetAudiences": ["developers"]
  }'
```

2) Read entity (gateway):

```bash
curl -sS http://localhost:3001/entities/<ENTITY_ID>
```

3) Read canonical content (gateway):

```bash
curl -sS http://localhost:3001/canonical-content/<ENTITY_ID>
```

4) Ingest website HTML (gateway):

```bash
curl -sS -X POST http://localhost:3001/brands/<ENTITY_ID>/ingest -H 'content-type: application/json' -d '{}'
```

5) List source documents (gateway):

```bash
curl -sS http://localhost:3001/brands/<ENTITY_ID>/source-documents
```

6) Index for RAG + ask a question (gateway):

```bash
curl -sS -X POST http://localhost:3001/entities/<ENTITY_ID>/index
curl -sS -X POST http://localhost:3001/entities/<ENTITY_ID>/answer -H 'content-type: application/json' -d '{\"query\":\"What does this brand do?\"}'
```

7) Set brand policy and see policy violations (gateway):

```bash
curl -sS -X PUT http://localhost:3001/brands/<ENTITY_ID>/policy \\
  -H 'content-type: application/json' \\
  -d '{\n+    \"allowedClaims\": {\"canUseSuperlatives\": false, \"allowedSuperlatives\": [], \"allowedComparisons\": []},\n+    \"forbiddenPhrases\": [\"best ever\"],\n+    \"regulatedTopics\": [\"financial returns\"]\n+  }'
```

Then regenerate canonical content via content-service:

```bash
curl -sS -X POST http://localhost:3003/refresh/canonical-content \\
  -H 'content-type: application/json' \\
  -d '{\"entityId\":\"<ENTITY_ID>\"}'
```

8) Create and run AI visibility probes (gateway):

```bash
curl -sS -X POST http://localhost:3001/brands/<ENTITY_ID>/probes/run -H 'content-type: application/json' -d '{}'
curl -sS http://localhost:3001/brands/<ENTITY_ID>/probes/results
```
