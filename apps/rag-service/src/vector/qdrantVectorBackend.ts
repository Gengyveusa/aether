import type { VectorDoc } from "../vectorStore.js";
import type { SearchResult, VectorBackend } from "./vectorBackend.js";
import type { EmbeddingProvider } from "../providers/embeddingProvider.js";

function stableUuidFromString(input: string): string {
  // Deterministic UUID-ish value derived from sha256.
  // Qdrant supports UUID point IDs; we convert a hash to UUIDv4 format.
  const bytes = new Uint8Array(16);
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // fill bytes using a simple LCG seeded by h (good enough for stable IDs)
  let x = h >>> 0;
  for (let i = 0; i < 16; i++) {
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    bytes[i] = x & 0xff;
  }
  // version 4 + variant
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

type QdrantCollectionInfo = { status?: string };

async function qdrantRequest<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Qdrant ${init?.method ?? "GET"} ${path} failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json as T;
}

export class QdrantVectorBackend implements VectorBackend {
  private readonly baseUrl: string;
  private readonly collection: string;
  private readonly embeddingProvider: EmbeddingProvider;
  private readonly model: string;
  private readonly vectorSize: number;
  private ensured = false;

  constructor(opts: {
    url: string;
    collection: string;
    embeddingProvider: EmbeddingProvider;
    model: string;
    vectorSize: number;
  }) {
    this.baseUrl = opts.url.replace(/\/$/, "");
    this.collection = opts.collection;
    this.embeddingProvider = opts.embeddingProvider;
    this.model = opts.model;
    this.vectorSize = opts.vectorSize;
  }

  private async ensureCollection(): Promise<void> {
    if (this.ensured) return;

    try {
      await qdrantRequest<QdrantCollectionInfo>(this.baseUrl, `/collections/${encodeURIComponent(this.collection)}`);
      this.ensured = true;
      return;
    } catch (e: any) {
      // If it doesn't exist, create it. Qdrant returns 404; we don't have status code here,
      // so we attempt create unconditionally on error.
    }

    await qdrantRequest(this.baseUrl, `/collections/${encodeURIComponent(this.collection)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        vectors: {
          size: this.vectorSize,
          distance: "Cosine"
        }
      })
    });

    this.ensured = true;
  }

  async upsert(docs: VectorDoc[]): Promise<void> {
    await this.ensureCollection();
    if (docs.length === 0) return;

    const vectors = await this.embeddingProvider.embed({ model: this.model, texts: docs.map((d) => d.text) });
    if (vectors.length !== docs.length) {
      throw new Error(`EmbeddingProvider returned ${vectors.length} vectors for ${docs.length} docs`);
    }
    if (vectors[0] && vectors[0].length !== this.vectorSize) {
      throw new Error(
        `Vector size mismatch: expected ${this.vectorSize}, got ${vectors[0].length}. Set QDRANT_VECTOR_SIZE accordingly.`
      );
    }

    const points = docs.map((d, i) => ({
      id: stableUuidFromString(d.id),
      vector: vectors[i],
      payload: {
        docId: d.id,
        entityId: d.entityId ?? null,
        text: d.text,
        sourceType: d.sourceType,
        url: d.url ?? null
      }
    }));

    await qdrantRequest(this.baseUrl, `/collections/${encodeURIComponent(this.collection)}/points?wait=true`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ points })
    });
  }

  async search(query: string, options?: { entityId?: string; topK?: number }): Promise<SearchResult[]> {
    await this.ensureCollection();
    const topK = options?.topK ?? 5;

    const [q] = await this.embeddingProvider.embed({ model: this.model, texts: [query] });
    if (!q) return [];
    if (q.length !== this.vectorSize) {
      throw new Error(
        `Query vector size mismatch: expected ${this.vectorSize}, got ${q.length}. Set QDRANT_VECTOR_SIZE accordingly.`
      );
    }

    const filter =
      options?.entityId
        ? {
            must: [{ key: "entityId", match: { value: options.entityId } }]
          }
        : undefined;

    const res = await qdrantRequest<any>(
      this.baseUrl,
      `/collections/${encodeURIComponent(this.collection)}/points/search`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vector: q,
          limit: topK,
          with_payload: true,
          filter
        })
      }
    );

    const result = res?.result;
    if (!Array.isArray(result)) return [];

    return result.map((r: any) => ({
      id: String(r?.payload?.docId ?? r?.id),
      score: Number(r?.score ?? 0),
      text: String(r?.payload?.text ?? ""),
      entityId: r?.payload?.entityId ?? undefined,
      url: r?.payload?.url ?? undefined
    }));
  }
}
