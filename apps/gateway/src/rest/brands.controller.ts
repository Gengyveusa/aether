import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { z } from "zod";
import { BrandSchema, type Brand } from "@aether/shared-types";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { ContentServiceClient } from "../clients/contentServiceClient.js";
import { IngestionServiceClient } from "../clients/ingestionServiceClient.js";

const BrandCreateSchema = BrandSchema.omit({
  id: true,
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
    private readonly ingestion: IngestionServiceClient
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
    const canonicalContent = await this.content.generateCanonicalContent(created);
    await this.graph.putCanonicalContent(created.id, canonicalContent);

    const brand = BrandSchema.parse(created) as Brand;
    return { brand, hasCanonicalContent: true };
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
