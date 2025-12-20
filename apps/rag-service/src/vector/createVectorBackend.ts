import { config } from "@aether/shared-utils";
import { createEmbeddingProvider } from "../providers/embeddingProvider.js";
import { InMemoryVectorBackend } from "./inMemoryVectorBackend.js";
import { QdrantVectorBackend } from "./qdrantVectorBackend.js";
import type { VectorBackend } from "./vectorBackend.js";

export function createVectorBackend(): VectorBackend {
  const backend = config.vector.backend;
  const embeddingProvider = createEmbeddingProvider();
  if (backend === "qdrant") {
    const url = config.vector.qdrantUrl;
    const collection = config.vector.collectionName;
    if (!url || !collection) {
      throw new Error("VECTOR_BACKEND=qdrant requires QDRANT_URL and QDRANT_COLLECTION");
    }
    return new QdrantVectorBackend({
      url,
      collection,
      embeddingProvider,
      model: config.embeddings.model,
      vectorSize: config.vector.vectorSize
    });
  }

  return new InMemoryVectorBackend({ embeddingProvider, model: config.embeddings.model });
}
