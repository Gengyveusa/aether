import { Module } from "@nestjs/common";

import { EntitiesController } from "../rest/entities.controller.js";
import { CanonicalContentController } from "../rest/canonicalContent.controller.js";
import { BrandsController } from "../rest/brands.controller.js";
import { EntitiesService } from "../services/entities.service.js";
import { EntitiesResolver } from "../graphql/entities.resolver.js";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { ContentServiceClient } from "../clients/contentServiceClient.js";

@Module({
  controllers: [BrandsController, EntitiesController, CanonicalContentController],
  providers: [GraphServiceClient, ContentServiceClient, EntitiesService, EntitiesResolver]
})
export class EntitiesModule {}
