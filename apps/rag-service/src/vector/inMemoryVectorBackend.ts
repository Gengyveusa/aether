import type { VectorDoc } from "../vectorStore.js";
import type { VectorBackend } from "./vectorBackend.js";
import { InMemoryVectorStore } from "../inMemoryVectorStore.js";
import type { EmbeddingProvider } from "../providers/embeddingProvider.js";

export class InMemoryVectorBackend implements VectorBackend {
  private readonly store: InMemoryVectorStore;

  constructor(opts: { embeddingProvider: EmbeddingProvider; model: string }) {
    this.store = new InMemoryVectorStore({ embeddingProvider: opts.embeddingProvider, model: opts.model });
  }

  async upsert(docs: VectorDoc[]): Promise<void> {
    await this.store.upsertDocuments(docs);
  }

  async search(query: string, options?: { entityId?: string; topK?: number }) {
    return await this.store.search(query, options);
  }
}
