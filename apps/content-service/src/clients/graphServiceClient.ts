import { BrandPolicySchema, EntitySchema, type BrandPolicy, type Entity } from "@aether/shared-types";
import { config } from "@aether/shared-utils";

export class GraphServiceClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.graphService.baseUrl;
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
