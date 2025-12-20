import { Controller, Param, Post } from "@nestjs/common";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { IngestionServiceClient } from "../clients/ingestionServiceClient.js";
import { ContentServiceClient } from "../clients/contentServiceClient.js";
import { RagServiceClient } from "../clients/ragServiceClient.js";
import { runOnboardingWorkflow } from "../workflows/onboarding.js";

@Controller()
export class EntitiesWorkflowController {
  constructor(
    private readonly graph: GraphServiceClient,
    private readonly ingestion: IngestionServiceClient,
    private readonly content: ContentServiceClient,
    private readonly rag: RagServiceClient
  ) {}

  @Post("/entities/:id/onboard")
  async onboard(@Param("id") entityId: string) {
    return await runOnboardingWorkflow({
      entityId,
      graph: this.graph,
      ingestion: this.ingestion,
      content: this.content,
      rag: this.rag
    });
  }
}
