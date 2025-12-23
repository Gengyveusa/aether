import { Args, Query, Resolver } from "@nestjs/graphql";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { ObservabilityServiceClient } from "../clients/observabilityServiceClient.js";
import { BrandPolicyGql } from "./models/policy.model.js";
import { AiVisibilityProbeResultGql } from "./models/probe.model.js";

@Resolver()
export class PolicyAndProbesResolver {
  constructor(
    private readonly graph: GraphServiceClient,
    private readonly observability: ObservabilityServiceClient
  ) {}

  @Query(() => BrandPolicyGql)
  async brandPolicy(@Args("brandId") brandId: string) {
    return await this.graph.getBrandPolicy(brandId);
  }

  @Query(() => [AiVisibilityProbeResultGql])
  async probeResults(@Args("brandId") brandId: string) {
    const res = await this.observability.listProbeResults(brandId);
    return res.results;
  }
}
