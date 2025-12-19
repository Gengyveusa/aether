import { Args, Query, Resolver } from "@nestjs/graphql";
import { EntitiesService } from "../services/entities.service.js";
import { EntityUnion } from "./models/entity.model.js";
import { CanonicalContentGql } from "./models/canonicalContent.model.js";

@Resolver()
export class EntitiesResolver {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Query(() => EntityUnion, { nullable: true })
  entity(@Args("id") id: string) {
    return this.entitiesService.getEntityById(id) ?? null;
  }

  @Query(() => [EntityUnion])
  entities(@Args("type", { nullable: true }) type?: string, @Args("search", { nullable: true }) search?: string) {
    return this.entitiesService.listEntities({ type, search });
  }

  @Query(() => CanonicalContentGql, { nullable: true })
  canonicalContent(@Args("entityId") entityId: string) {
    return this.entitiesService.getCanonicalContent(entityId) ?? null;
  }
}
