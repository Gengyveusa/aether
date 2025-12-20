export function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export function getEnv(name: string, defaultValue?: string): string | undefined {
  return process.env[name] ?? defaultValue;
}

function getNumberEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const n = Number(raw);
  if (!Number.isFinite(n)) return defaultValue;
  return n;
}

function getUrlEnv(name: string, defaultValue: string): string {
  return (process.env[name] ?? defaultValue).replace(/\/$/, "");
}

export type LlmProviderKind = "stub" | "vertex";
export type EmbeddingsProviderKind = "stub" | "vertex";
export type VectorBackendKind = "in_memory" | "qdrant";
export type GraphBackendKind = "postgres" | "neo4j" | "in_memory";

export const config = {
  gateway: {
    port: getNumberEnv("GATEWAY_PORT", 3001)
  },
  graphService: {
    baseUrl: getUrlEnv("GRAPH_SERVICE_URL", "http://localhost:8001")
  },
  ingestionService: {
    baseUrl: getUrlEnv("INGESTION_SERVICE_URL", "http://localhost:8002")
  },
  ragService: {
    baseUrl: getUrlEnv("RAG_SERVICE_URL", "http://localhost:3002")
  },
  contentService: {
    baseUrl: getUrlEnv("CONTENT_SERVICE_URL", "http://localhost:3003")
  },
  observabilityService: {
    baseUrl: getUrlEnv("OBSERVABILITY_SERVICE_URL", "http://localhost:3004")
  },
  llm: {
    provider: (process.env.LLM_PROVIDER ?? "stub") as LlmProviderKind,
    model: process.env.LLM_MODEL ?? "stub-model",
    projectId: process.env.LLM_PROJECT_ID ?? process.env.VERTEX_PROJECT_ID,
    location: process.env.LLM_LOCATION ?? process.env.VERTEX_LOCATION
  },
  embeddings: {
    provider: (process.env.EMBEDDINGS_PROVIDER ?? "stub") as EmbeddingsProviderKind,
    model: process.env.EMBEDDINGS_MODEL ?? "stub-embeddings",
    projectId: process.env.EMBEDDINGS_PROJECT_ID ?? process.env.VERTEX_PROJECT_ID,
    location: process.env.EMBEDDINGS_LOCATION ?? process.env.VERTEX_LOCATION
  },
  vector: {
    backend: (process.env.VECTOR_BACKEND ?? "in_memory") as VectorBackendKind,
    qdrantUrl: process.env.QDRANT_URL ?? "http://localhost:6333",
    collectionName: process.env.QDRANT_COLLECTION ?? "aether-entities",
    // Default aligns with StubEmbeddingProvider dims; can be overridden for real embedding sizes.
    vectorSize: getNumberEnv("QDRANT_VECTOR_SIZE", 64)
  },
  graph: {
    backend: (process.env.GRAPH_BACKEND ?? "postgres") as GraphBackendKind
  }
} as const;
