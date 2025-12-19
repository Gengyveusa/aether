import Fastify from "fastify";
import { z } from "zod";
import { CanonicalContentSchema, type Entity, EntitySchema } from "@aether/shared-types";
import { logger } from "@aether/shared-utils";
import { StubLlmClient } from "./llmClient.js";

const app = Fastify({ logger: false });
const llmClient = new StubLlmClient();

const GenerateCanonicalContentRequestSchema: z.ZodType<{ entity: Entity }> = z.object({
  entity: EntitySchema
}) as z.ZodType<{ entity: Entity }>;

const RefreshCanonicalContentRequestSchema = z.object({
  entityId: z.string().min(1)
});

app.post("/generate/canonical-content", async (req, reply) => {
  const parsed = GenerateCanonicalContentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  // TODO: call LLM + persist
  await llmClient.generateText(`Generate canonical content for ${parsed.data.entity.displayName}`);

  const canonicalContent = CanonicalContentSchema.parse({
    entityId: parsed.data.entity.id,
    aboutShort: "",
    aboutLong: "",
    faq: []
  });

  return { canonicalContent };
});

app.post("/refresh/canonical-content", async (req, reply) => {
  const parsed = RefreshCanonicalContentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  // TODO: fetch entity + regenerate
  const canonicalContent = CanonicalContentSchema.parse({
    entityId: parsed.data.entityId,
    aboutShort: "",
    aboutLong: "",
    faq: []
  });

  return { canonicalContent };
});

const port = Number(process.env.PORT ?? 3003);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => logger.info("content-service listening", { port, host }))
  .catch((err) => {
    logger.error("content-service failed to start", { err: String(err) });
    process.exit(1);
  });
