import { Module } from "@nestjs/common";

import { EntitiesController } from "../rest/entities.controller.js";
import { CanonicalContentController } from "../rest/canonicalContent.controller.js";
import { EntitiesService } from "../services/entities.service.js";
import { EntitiesResolver } from "../graphql/entities.resolver.js";

@Module({
  controllers: [EntitiesController, CanonicalContentController],
  providers: [EntitiesService, EntitiesResolver]
})
export class EntitiesModule {}
