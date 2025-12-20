import type { VectorDoc } from "../vectorStore.js";
import type { SearchResult, VectorBackend } from "./vectorBackend.js";

export class QdrantVectorBackend implements VectorBackend {
  // TODO: implement Qdrant HTTP/gRPC client, collection management, and payload schema.
  constructor(_opts: { url: string; collection: string }) {}

  async upsert(_docs: VectorDoc[]): Promise<void> {
    throw new Error("QdrantVectorBackend not implemented yet");
  }

  async search(_query: string, _options?: { entityId?: string; topK?: number }): Promise<SearchResult[]> {
    throw new Error("QdrantVectorBackend not implemented yet");
  }
}
