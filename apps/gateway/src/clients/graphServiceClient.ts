import { config } from "@aether/shared-utils";
import {
  CanonicalContentSchema,
  BrandPolicySchema,
  EntitySchema,
  SourceDocumentSchema,
  type CanonicalContent,
  type BrandPolicy,
  type Entity,
  type SourceDocument
} from "@aether/shared-types";

export class GraphServiceClient {
  private readonly baseUrl: string;

  constructor(opts?: { baseUrl?: string }) {
    this.baseUrl = (opts?.baseUrl ?? config.graphService.baseUrl).replace(/\/$/, "");
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

  async listEntities(opts?: { type?: string; brandId?: string; limit?: number; offset?: number }): Promise<Entity[]> {
    const qs = new URLSearchParams();
    if (opts?.type) qs.set("type", opts.type);
    if (opts?.brandId) qs.set("brandId", opts.brandId);
    if (opts?.limit != null) qs.set("limit", String(opts.limit));
    if (opts?.offset != null) qs.set("offset", String(opts.offset));

    const res = await fetch(`${this.baseUrl}/entities?${qs.toString()}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`graph-service GET /entities failed (${res.status}): ${JSON.stringify(json)}`);
    }
    const items = (json as any).entities as unknown;
    return EntitySchema.array().parse(items);
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

  async getBrandPolicy(brandId: string): Promise<BrandPolicy> {
    const res = await fetch(`${this.baseUrl}/brand-policies/${encodeURIComponent(brandId)}?includeDefault=true`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`graph-service GET /brand-policies failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return BrandPolicySchema.parse(json);
  }

  async getBrandPolicyIfExists(brandId: string): Promise<BrandPolicy | null> {
    const res = await fetch(`${this.baseUrl}/brand-policies/${encodeURIComponent(brandId)}?includeDefault=false`);
    if (res.status === 404) return null;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`graph-service GET /brand-policies (raw) failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return BrandPolicySchema.parse(json);
  }

  async putBrandPolicy(brandId: string, policy: BrandPolicy): Promise<BrandPolicy> {
    const res = await fetch(`${this.baseUrl}/brand-policies/${encodeURIComponent(brandId)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(policy)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`graph-service PUT /brand-policies failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return BrandPolicySchema.parse(json);
  }
}
