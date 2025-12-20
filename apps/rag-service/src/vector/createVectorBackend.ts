import { config } from "@aether/shared-utils";
import { createEmbeddingProvider } from "../providers/embeddingProvider.js";
import { InMemoryVectorBackend } from "./inMemoryVectorBackend.js";
import { QdrantVectorBackend } from "./qdrantVectorBackend.js";
import type { VectorBackend } from "./vectorBackend.js";

export function createVectorBackend(): VectorBackend {
  const backend = config.vector.backend;
  if (backend === "qdrant") {
    // TODO: move to shared config once we actually integrate Qdrant.
    const url = process.env.QDRANT_URL ?? "http://localhost:6333";
    const collection = process.env.QDRANT_COLLECTION ?? "aether";
    return new QdrantVectorBackend({ url, collection });
  }

  const embeddingProvider = createEmbeddingProvider();
  return new InMemoryVectorBackend({ embeddingProvider, model: config.embeddings.model });
}
