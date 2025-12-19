export type RagCitation = { id: string; url: string | null; score: number };
export type RagAnswer = { answer: string; citations: RagCitation[] };

export class RagServiceClient {
  private readonly baseUrl: string;

  constructor(opts?: { baseUrl?: string }) {
    this.baseUrl = (opts?.baseUrl ?? (process.env.RAG_SERVICE_URL ?? "http://localhost:3002")).replace(/\/$/, "");
  }

  async indexEntity(entityId: string): Promise<{ indexedCount: number }> {
    const res = await fetch(`${this.baseUrl}/index/entity`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityId })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`rag-service POST /index/entity failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json as { indexedCount: number };
  }

  async answerForEntity(input: { entityId: string; query: string; topK?: number }): Promise<RagAnswer> {
    const res = await fetch(`${this.baseUrl}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityId: input.entityId, query: input.query, topK: input.topK })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`rag-service POST /answer failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json as RagAnswer;
  }
}
