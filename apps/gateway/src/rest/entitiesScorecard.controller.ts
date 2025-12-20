import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { z } from "zod";
import { ObservabilityServiceClient } from "../clients/observabilityServiceClient.js";
import { GraphServiceClient } from "../clients/graphServiceClient.js";

@Controller()
export class EntitiesScorecardController {
  constructor(
    private readonly observability: ObservabilityServiceClient,
    private readonly graph: GraphServiceClient
  ) {}

  @Get("/entities/:id/scorecard")
  async getScorecard(@Param("id") entityId: string) {
    const sc = await this.observability.getScorecard(entityId);
    if (!sc) return { error: "Scorecard not found" };
    return sc;
  }

  @Post("/entities/:id/probes/run-and-score")
  async runAndScore(@Param("id") entityId: string, @Body() body: unknown) {
    const BodySchema = z.object({ probeConfigId: z.string().min(1).optional() });
    const parsed = BodySchema.safeParse(body ?? {});
    if (!parsed.success) return { error: "Invalid request", details: parsed.error.flatten() };

    let probeConfigId = parsed.data.probeConfigId;
    if (!probeConfigId) {
      const entity = await this.graph.getEntity(entityId);
      if (!entity) return { error: "Entity not found" };
      const name = entity.displayName;
      const questions = [
        `Who is ${name}?`,
        `What does ${name} do?`,
        `How is ${name} described?`
      ];
      const targetModels = ["gpt-4.5", "gemini-2.0-pro"];
      const cfg = await this.observability.createProbeConfig({ brandId: entityId, questions, targetModels });
      probeConfigId = cfg.id;
    }

    const probeRun = await this.observability.runProbe({ probeConfigId });
    const scorecard = await this.observability.computeScorecard(entityId);

    return { probeResults: probeRun.results, scorecard };
  }
}
