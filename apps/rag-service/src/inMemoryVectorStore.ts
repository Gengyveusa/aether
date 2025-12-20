import type { EmbeddingProvider } from "./providers/embeddingProvider.js";
import type { VectorDoc, VectorHit, VectorStore } from "./vectorStore.js";

type Stored = {
  doc: VectorDoc;
  embedding: number[];
};

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] ?? 0) * (b[i] ?? 0);
  return s;
}

export class InMemoryVectorStore implements VectorStore {
  private readonly embeddingProvider: EmbeddingProvider;
  private readonly model: string;
  private readonly store = new Map<string, Stored>();

  constructor(opts: { embeddingProvider: EmbeddingProvider; model: string }) {
    this.embeddingProvider = opts.embeddingProvider;
    this.model = opts.model;
  }

  async upsertDocuments(docs: VectorDoc[]): Promise<void> {
    if (docs.length === 0) return;
    const embeddings = await this.embeddingProvider.embed({ model: this.model, texts: docs.map((d) => d.text) });
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]!;
      const embedding = embeddings[i]!;
      this.store.set(doc.id, { doc, embedding });
    }
  }

  async search(query: string, options?: { entityId?: string; topK?: number }): Promise<VectorHit[]> {
    const topK = options?.topK ?? 5;
    const [q] = await this.embeddingProvider.embed({ model: this.model, texts: [query] });

    const hits: VectorHit[] = [];
    for (const { doc, embedding } of this.store.values()) {
      if (options?.entityId && doc.entityId && doc.entityId !== options.entityId) continue;
      if (options?.entityId && !doc.entityId) continue;

      const score = dot(q!, embedding);
      hits.push({ id: doc.id, score, text: doc.text, entityId: doc.entityId, url: doc.url });
    }

    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, topK);
  }
}
