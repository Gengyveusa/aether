import { Injectable } from "@nestjs/common";
import { type CanonicalContent, type Entity } from "@aether/shared-types";
import { GraphServiceClient } from "../clients/graphServiceClient.js";

@Injectable()
export class EntitiesService {
  constructor(private readonly graph: GraphServiceClient) {}

  async getEntityById(id: string): Promise<Entity | undefined> {
    const entity = await this.graph.getEntity(id);
    return entity ?? undefined;
  }

  // NOTE: graph-service doesn't expose listing yet. This keeps the API stable for now.
  async listEntities(opts?: { type?: string; search?: string; brandId?: string }): Promise<Entity[]> {
    // TODO: implement server-side search in graph-service.
    const items = await this.graph.listEntities({ type: opts?.type, brandId: opts?.brandId, limit: 200, offset: 0 });
    const q = opts?.search?.trim().toLowerCase();
    if (!q) return items;
    return items.filter((e) => `${e.displayName} ${e.slug} ${e.description}`.toLowerCase().includes(q));
  }

  async getCanonicalContent(entityId: string): Promise<CanonicalContent | undefined> {
    const content = await this.graph.getCanonicalContent(entityId);
    return content ?? undefined;
  }
}
