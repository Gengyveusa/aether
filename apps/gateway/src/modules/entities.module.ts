import { Module } from "@nestjs/common";

import { EntitiesController } from "../rest/entities.controller.js";
import { CanonicalContentController } from "../rest/canonicalContent.controller.js";
import { BrandsController } from "../rest/brands.controller.js";
import { EntitiesRagController } from "../rest/entitiesRag.controller.js";
import { EntitiesWorkflowController } from "../rest/entitiesWorkflow.controller.js";
import { EntitiesScorecardController } from "../rest/entitiesScorecard.controller.js";
import { EntitiesService } from "../services/entities.service.js";
import { EntitiesResolver } from "../graphql/entities.resolver.js";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { ContentServiceClient } from "../clients/contentServiceClient.js";
import { IngestionServiceClient } from "../clients/ingestionServiceClient.js";
import { RagServiceClient } from "../clients/ragServiceClient.js";
import { ObservabilityServiceClient } from "../clients/observabilityServiceClient.js";
import { BrandFieldsResolver } from "../graphql/brandFields.resolver.js";
import { RagResolver } from "../graphql/rag.resolver.js";
import { PolicyAndProbesResolver } from "../graphql/policyAndProbes.resolver.js";
import { WorkflowsAndScorecardResolver } from "../graphql/workflowsAndScorecard.resolver.js";

@Module({
  controllers: [
    BrandsController,
    EntitiesController,
    CanonicalContentController,
    EntitiesRagController,
    EntitiesWorkflowController,
    EntitiesScorecardController
  ],
  providers: [
    GraphServiceClient,
    ContentServiceClient,
    IngestionServiceClient,
    RagServiceClient,
    ObservabilityServiceClient,
    EntitiesService,
    EntitiesResolver,
    BrandFieldsResolver,
    RagResolver,
    PolicyAndProbesResolver,
    WorkflowsAndScorecardResolver
  ]
})
export class EntitiesModule {}
