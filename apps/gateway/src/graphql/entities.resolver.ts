import { Args, Query, Resolver } from "@nestjs/graphql";
import { EntitiesService } from "../services/entities.service.js";
import { EntityUnion } from "./models/entity.model.js";
import { CanonicalContentGql } from "./models/canonicalContent.model.js";

@Resolver()
export class EntitiesResolver {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Query(() => EntityUnion, { nullable: true })
  async entity(@Args("id") id: string) {
    return (await this.entitiesService.getEntityById(id)) ?? null;
  }

  @Query(() => [EntityUnion])
  async entities(
    @Args("type", { nullable: true }) _type?: string,
    @Args("search", { nullable: true }) _search?: string
  ) {
    // TODO: implement filters via graph-service endpoint
    return await this.entitiesService.listEntities();
  }

  @Query(() => CanonicalContentGql, { nullable: true })
  async canonicalContent(@Args("entityId") entityId: string) {
    return (await this.entitiesService.getCanonicalContent(entityId)) ?? null;
  }
}
