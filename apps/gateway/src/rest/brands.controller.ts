import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { BrandSchema, type Brand } from "@aether/shared-types";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { ContentServiceClient } from "../clients/contentServiceClient.js";

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
    private readonly content: ContentServiceClient
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
}
