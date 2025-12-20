import type { VectorDoc, VectorHit } from "../vectorStore.js";

export type SearchResult = VectorHit;

export interface VectorBackend {
  upsert(docs: VectorDoc[]): Promise<void>;
  search(query: string, options?: { entityId?: string; topK?: number }): Promise<SearchResult[]>;
}
