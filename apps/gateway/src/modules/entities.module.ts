import { Module } from "@nestjs/common";

import { EntitiesController } from "../rest/entities.controller.js";
import { CanonicalContentController } from "../rest/canonicalContent.controller.js";
import { BrandsController } from "../rest/brands.controller.js";
import { EntitiesRagController } from "../rest/entitiesRag.controller.js";
import { EntitiesService } from "../services/entities.service.js";
import { EntitiesResolver } from "../graphql/entities.resolver.js";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { ContentServiceClient } from "../clients/contentServiceClient.js";
import { IngestionServiceClient } from "../clients/ingestionServiceClient.js";
import { RagServiceClient } from "../clients/ragServiceClient.js";
import { BrandFieldsResolver } from "../graphql/brandFields.resolver.js";
import { RagResolver } from "../graphql/rag.resolver.js";

@Module({
  controllers: [BrandsController, EntitiesController, CanonicalContentController, EntitiesRagController],
  providers: [
    GraphServiceClient,
    ContentServiceClient,
    IngestionServiceClient,
    RagServiceClient,
    EntitiesService,
    EntitiesResolver,
    BrandFieldsResolver,
    RagResolver
  ]
})
export class EntitiesModule {}
