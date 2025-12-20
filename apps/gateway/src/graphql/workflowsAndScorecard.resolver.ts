import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { IngestionServiceClient } from "../clients/ingestionServiceClient.js";
import { ContentServiceClient } from "../clients/contentServiceClient.js";
import { RagServiceClient } from "../clients/ragServiceClient.js";
import { ObservabilityServiceClient } from "../clients/observabilityServiceClient.js";
import { runOnboardingWorkflow } from "../workflows/onboarding.js";
import { AiVisibilityScorecardGql, OnboardingResultGql, RunProbesAndScoreResultGql } from "./models/scorecard.model.js";

@Resolver()
export class WorkflowsAndScorecardResolver {
  constructor(
    private readonly graph: GraphServiceClient,
    private readonly ingestion: IngestionServiceClient,
    private readonly content: ContentServiceClient,
    private readonly rag: RagServiceClient,
    private readonly observability: ObservabilityServiceClient
  ) {}

  @Query(() => AiVisibilityScorecardGql, { nullable: true })
  async visibilityScorecard(@Args("entityId") entityId: string) {
    return await this.observability.getScorecard(entityId);
  }

  @Mutation(() => OnboardingResultGql)
  async onboardEntity(@Args("entityId") entityId: string) {
    return await runOnboardingWorkflow({
      entityId,
      graph: this.graph,
      ingestion: this.ingestion,
      content: this.content,
      rag: this.rag
    });
  }

  @Mutation(() => RunProbesAndScoreResultGql)
  async runProbesAndScore(@Args("entityId") entityId: string) {
    // Reuse brand probe logic: treat entityId as brandId for now.
    const cfg = await this.observability.createProbeConfig({
      brandId: entityId,
      questions: ["Who is this entity?", "What does this entity do?", "What are alternatives?"] ,
      targetModels: ["gpt-4.5", "gemini-2.0-pro"]
    });
    const run = await this.observability.runProbe({ probeConfigId: cfg.id });
    const scorecard = await this.observability.computeScorecard(entityId);
    return { probeResultIds: run.results.map((r) => r.id), scorecard };
  }
}
