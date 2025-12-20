import { BrandPolicySchema, EntitySchema, type BrandPolicy, type Entity } from "@aether/shared-types";

export class GraphServiceClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = (process.env.GRAPH_SERVICE_URL ?? "http://localhost:8001").replace(/\/$/, "");
  }

  async getEntity(entityId: string): Promise<Entity> {
    const res = await fetch(`${this.baseUrl}/entities/${encodeURIComponent(entityId)}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`graph-service GET /entities/${entityId} failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return EntitySchema.parse(json);
  }

  async getBrandPolicy(brandId: string): Promise<BrandPolicy> {
    const res = await fetch(`${this.baseUrl}/brand-policies/${encodeURIComponent(brandId)}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        `graph-service GET /brand-policies/${brandId} failed (${res.status}): ${JSON.stringify(json)}`
      );
    }
    return BrandPolicySchema.parse(json);
  }
}
