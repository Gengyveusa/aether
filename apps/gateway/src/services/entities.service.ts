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
  async listEntities(): Promise<Entity[]> {
    return [];
  }

  async getCanonicalContent(entityId: string): Promise<CanonicalContent | undefined> {
    const content = await this.graph.getCanonicalContent(entityId);
    return content ?? undefined;
  }
}
