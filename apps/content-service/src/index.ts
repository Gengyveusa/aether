import Fastify from "fastify";
import { z } from "zod";
import { CanonicalContentSchema, type Entity, EntitySchema } from "@aether/shared-types";
import { logger } from "@aether/shared-utils";
import { llmClient } from "./llmClient.js";

const app = Fastify({ logger: false });

const GenerateCanonicalContentRequestSchema: z.ZodType<{ entity: Entity }> = z.object({
  entity: EntitySchema
}) as z.ZodType<{ entity: Entity }>;

const RefreshCanonicalContentRequestSchema = z.object({
  entityId: z.string().min(1)
});

async function generateCanonicalContent(entity: Entity) {
  const aboutShort = await llmClient.generateText(
    `Write a 1-2 sentence canonical about for ${entity.displayName} (${entity.type}).`
  );
  const aboutLong = await llmClient.generateText(
    `Write a longer canonical about (3-5 sentences) for ${entity.displayName}. Include what it is and who it's for.`
  );

  const faq = [
    {
      question: `What is ${entity.displayName}?`,
      answer: await llmClient.generateText(`Answer plainly: What is ${entity.displayName}?`)
    },
    {
      question: `Who is ${entity.displayName} for?`,
      answer: await llmClient.generateText(`Answer plainly: Who is ${entity.displayName} for?`)
    }
  ];

  return CanonicalContentSchema.parse({
    entityId: entity.id,
    aboutShort,
    aboutLong,
    faq
  });
}

app.post("/generate/canonical-content", async (req, reply) => {
  const parsed = GenerateCanonicalContentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const canonicalContent = await generateCanonicalContent(parsed.data.entity);

  return { canonicalContent };
});

app.post("/refresh/canonical-content", async (req, reply) => {
  const parsed = RefreshCanonicalContentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const baseUrl = (process.env.GRAPH_SERVICE_URL ?? "http://localhost:8001").replace(/\/$/, "");
  const res = await fetch(`${baseUrl}/entities/${encodeURIComponent(parsed.data.entityId)}`);
  if (!res.ok) {
    return reply.status(res.status).send({ error: "Failed to fetch entity from graph-service" });
  }

  const entityJson = await res.json();
  const entity = EntitySchema.parse(entityJson);
  const canonicalContent = await generateCanonicalContent(entity);

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
