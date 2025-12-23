import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { z } from "zod";
import { BrandSchema, type Brand } from "@aether/shared-types";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { ContentServiceClient } from "../clients/contentServiceClient.js";
import { IngestionServiceClient } from "../clients/ingestionServiceClient.js";
import { BrandPolicySchema, type BrandPolicy } from "@aether/shared-types";
import { ObservabilityServiceClient } from "../clients/observabilityServiceClient.js";

const BrandCreateSchema = BrandSchema.omit({
  id: true,
  type: true,
  createdAt: true,
  updatedAt: true
}).extend({
  id: z.string().min(1).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

@Controller()
export class BrandsController {
  constructor(
    private readonly graph: GraphServiceClient,
    private readonly content: ContentServiceClient,
    private readonly ingestion: IngestionServiceClient,
    private readonly observability: ObservabilityServiceClient
  ) {}

  @Post("/brands")
  async createBrand(@Body() body: unknown) {
    const parsed = BrandCreateSchema.safeParse(body);
    if (!parsed.success) {
      return { error: "Invalid Brand payload", details: parsed.error.flatten() };
    }

    // Create entity in graph-service
    const created = await this.graph.createEntity({ ...parsed.data, type: "brand" });
    if (created.type !== "brand") {
      // Defensive: graph-service should preserve type
      throw new Error("Expected graph-service to return a Brand");
    }

    // Generate canonical content and persist in graph-service
    const gen = await this.content.generateCanonicalContent(created);
    await this.graph.putCanonicalContent(created.id, gen.canonicalContent);

    const brand = BrandSchema.parse(created) as Brand;
    return { brand, hasCanonicalContent: true, policyViolations: gen.policyViolations };
  }

  @Get("/brands/:id/policy")
  async getPolicy(@Param("id") brandId: string) {
    return await this.graph.getBrandPolicy(brandId);
  }

  @Put("/brands/:id/policy")
  async putPolicy(@Param("id") brandId: string, @Body() body: unknown) {
    const parsed = BrandPolicySchema.safeParse(body);
    if (!parsed.success) return { error: "Invalid policy", details: parsed.error.flatten() };
    return await this.graph.putBrandPolicy(brandId, parsed.data as BrandPolicy);
  }

  @Post("/brands/:id/probes/configs")
  async createProbeConfig(@Param("id") brandId: string, @Body() body: unknown) {
    const BodySchema = z.object({
      questions: z.array(z.string()).min(1),
      targetModels: z.array(z.string()).min(1)
    });
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) return { error: "Invalid request", details: parsed.error.flatten() };
    return await this.observability.createProbeConfig({ brandId, ...parsed.data });
  }

  @Post("/brands/:id/probes/run")
  async runProbe(@Param("id") brandId: string, @Body() body: unknown) {
    const BodySchema = z.object({ probeConfigId: z.string().min(1).optional() });
    const parsed = BodySchema.safeParse(body ?? {});
    if (!parsed.success) return { error: "Invalid request", details: parsed.error.flatten() };

    let probeConfigId = parsed.data.probeConfigId;
    if (!probeConfigId) {
      const brand = await this.graph.getEntity(brandId);
      if (!brand || brand.type !== "brand") return { error: "Brand not found" };

      const name = brand.displayName;
      const questions = [
        `Who is ${name}?`,
        `What does ${name} do?`,
        `What are alternatives to ${name}?`,
        `What are the best tools for ${((brand as any).primaryTopics?.[0] as string | undefined) ?? "this space"}?`
      ];
      const targetModels = ["gpt-4.5", "gemini-2.0-pro"];
      const cfg = await this.observability.createProbeConfig({ brandId, questions, targetModels });
      probeConfigId = cfg.id;
    }

    return await this.observability.runProbe({ probeConfigId });
  }

  @Get("/brands/:id/probes/results")
  async listProbeResults(@Param("id") brandId: string) {
    return await this.observability.listProbeResults(brandId);
  }

  @Post("/brands/:id/ingest")
  async ingestBrand(@Param("id") brandId: string, @Body() body: unknown) {
    const BodySchema = z.object({ url: z.string().url().optional() });
    const parsedBody = BodySchema.safeParse(body ?? {});
    if (!parsedBody.success) {
      return { error: "Invalid request", details: parsedBody.error.flatten() };
    }

    let url = parsedBody.data.url;
    if (!url) {
      const entity = await this.graph.getEntity(brandId);
      if (!entity) return { error: "Brand not found" };
      if (entity.type !== "brand") return { error: "Entity is not a brand" };
      url = (entity as any).websiteUrl as string | undefined;
    }

    if (!url) {
      return { error: "No URL provided and brand.websiteUrl missing" };
    }

    return await this.ingestion.ingestUrl({ brandId, url });
  }

  @Get("/brands/:id/source-documents")
  async listSourceDocuments(@Param("id") brandId: string) {
    const docs = await this.graph.listSourceDocuments(brandId);
    // Avoid returning full content from gateway listing
    return {
      sourceDocuments: docs.map((d) => ({
        id: d.id,
        url: d.url,
        ingestedAt: d.ingestedAt,
        contentType: d.contentType ?? null
      }))
    };
  }
}
