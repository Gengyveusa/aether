import {
  CanonicalContentSchema,
  EntitySchema,
  SourceDocumentSchema,
  type CanonicalContent,
  type Entity,
  type SourceDocument
} from "@aether/shared-types";

function baseUrlFromEnv(name: string, fallback: string) {
  return (process.env[name] ?? fallback).replace(/\/$/, "");
}

export class GraphServiceClient {
  private readonly baseUrl: string;

  constructor(opts?: { baseUrl?: string }) {
    this.baseUrl = (opts?.baseUrl ?? baseUrlFromEnv("GRAPH_SERVICE_URL", "http://localhost:8001")).replace(/\/$/, "");
  }

  async createEntity(payload: unknown): Promise<Entity> {
    const res = await fetch(`${this.baseUrl}/entities`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`graph-service POST /entities failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return EntitySchema.parse(json);
  }

  async getEntity(id: string): Promise<Entity | null> {
    const res = await fetch(`${this.baseUrl}/entities/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`graph-service GET /entities/${id} failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return EntitySchema.parse(json);
  }

  async putCanonicalContent(entityId: string, content: CanonicalContent): Promise<CanonicalContent> {
    const res = await fetch(`${this.baseUrl}/canonical-content/${encodeURIComponent(entityId)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(content)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        `graph-service PUT /canonical-content/${entityId} failed (${res.status}): ${JSON.stringify(json)}`
      );
    }
    return CanonicalContentSchema.parse(json);
  }

  async getCanonicalContent(entityId: string): Promise<CanonicalContent | null> {
    const res = await fetch(`${this.baseUrl}/canonical-content/${encodeURIComponent(entityId)}`);
    if (res.status === 404) return null;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        `graph-service GET /canonical-content/${entityId} failed (${res.status}): ${JSON.stringify(json)}`
      );
    }
    return CanonicalContentSchema.parse(json);
  }

  async listSourceDocuments(brandId: string): Promise<SourceDocument[]> {
    const res = await fetch(`${this.baseUrl}/source-documents?brandId=${encodeURIComponent(brandId)}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`graph-service GET /source-documents failed (${res.status}): ${JSON.stringify(json)}`);
    }
    const docs = (json as any).sourceDocuments as unknown;
    return SourceDocumentSchema.array().parse(docs);
  }
}
