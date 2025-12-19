import { Body, Controller, Param, Post } from "@nestjs/common";
import { z } from "zod";
import { RagServiceClient } from "../clients/ragServiceClient.js";

@Controller()
export class EntitiesRagController {
  constructor(private readonly rag: RagServiceClient) {}

  @Post("/entities/:id/index")
  async indexEntity(@Param("id") entityId: string) {
    return await this.rag.indexEntity(entityId);
  }

  @Post("/entities/:id/answer")
  async answerForEntity(@Param("id") entityId: string, @Body() body: unknown) {
    const BodySchema = z.object({ query: z.string().min(1), topK: z.number().int().min(1).max(50).optional() });
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return { error: "Invalid request", details: parsed.error.flatten() };
    }

    return await this.rag.answerForEntity({ entityId, query: parsed.data.query, topK: parsed.data.topK });
  }
}
