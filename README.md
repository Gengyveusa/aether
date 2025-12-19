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

### Env vars
- **gateway**
  - `GRAPH_SERVICE_URL` (default: `http://localhost:8001`)
  - `CONTENT_SERVICE_URL` (default: `http://localhost:3003`)
  - `INGESTION_SERVICE_URL` (default: `http://localhost:8002`)
  - `RAG_SERVICE_URL` (default: `http://localhost:3002`)
- **content-service**
  - `GRAPH_SERVICE_URL` (default: `http://localhost:8001`)
- **rag-service**
  - `GRAPH_SERVICE_URL` (default: `http://localhost:8001`)
- **graph-service**
  - `GRAPH_DB_URL` (default: `postgresql+asyncpg://postgres:postgres@localhost:5432/aether`)

### Dev commands

Postgres (docker):

```bash
docker compose up -d postgres
```

TypeScript services (works with `npm` or `pnpm` at repo root):
- `npm run dev:gateway`
- `npm run dev:content`
- `npm run dev:rag`

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
