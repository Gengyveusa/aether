export type VectorDoc = {
  id: string;
  entityId?: string;
  text: string;
  sourceType: "source_document" | "canonical_content";
  url?: string;
};

export type VectorHit = {
  id: string;
  score: number;
  text: string;
  entityId?: string;
  url?: string;
};

export interface VectorStore {
  upsertDocuments(docs: VectorDoc[]): Promise<void>;
  search(query: string, options?: { entityId?: string; topK?: number }): Promise<VectorHit[]>;
}
