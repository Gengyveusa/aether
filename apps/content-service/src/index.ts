import Fastify from "fastify";
import { z } from "zod";
import { BrandPolicySchema, CanonicalContentSchema, type BrandPolicy, type Entity, EntitySchema } from "@aether/shared-types";
import { logger } from "@aether/shared-utils";
import { llmClient } from "./llmClient.js";
import { GraphServiceClient } from "./clients/graphServiceClient.js";
import { enforcePolicyOnCanonicalContent, type PolicyViolation } from "./policy/enforcement.js";

const app = Fastify({ logger: false });
const graph = new GraphServiceClient();

const GenerateCanonicalContentRequestSchema: z.ZodType<{ entity: Entity }> = z.object({
  entity: EntitySchema
}) as z.ZodType<{ entity: Entity }>;

const RefreshCanonicalContentRequestSchema = z.object({
  entityId: z.string().min(1)
});

async function generateCanonicalContent(entity: Entity, policy?: BrandPolicy) {
  const aboutShort = await llmClient.generateText(
    `Write a 1-2 sentence canonical about for ${entity.displayName} (${entity.type}). Policy: ${policy ? JSON.stringify(policy) : "none"}`
  );
  const aboutLong = await llmClient.generateText(
    `Write a longer canonical about (3-5 sentences) for ${entity.displayName}. Include what it is and who it's for. Policy: ${policy ? JSON.stringify(policy) : "none"}`
  );

  const faq = [
    {
      question: `What is ${entity.displayName}?`,
      answer: await llmClient.generateText(
        `Answer plainly: What is ${entity.displayName}? Policy: ${policy ? JSON.stringify(policy) : "none"}`
      )
    },
    {
      question: `Who is ${entity.displayName} for?`,
      answer: await llmClient.generateText(
        `Answer plainly: Who is ${entity.displayName} for? Policy: ${policy ? JSON.stringify(policy) : "none"}`
      )
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

  let policy: BrandPolicy | undefined;
  if (parsed.data.entity.type === "brand") {
    policy = BrandPolicySchema.parse(await graph.getBrandPolicy(parsed.data.entity.id));
  }

  const canonicalContentRaw = await generateCanonicalContent(parsed.data.entity, policy);
  const enforced = policy ? enforcePolicyOnCanonicalContent(canonicalContentRaw, policy) : { canonicalContent: canonicalContentRaw, policyViolations: [] as PolicyViolation[] };

  return { canonicalContent: enforced.canonicalContent, policyViolations: enforced.policyViolations };
});

app.post("/refresh/canonical-content", async (req, reply) => {
  const parsed = RefreshCanonicalContentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  let entity: Entity;
  try {
    entity = await graph.getEntity(parsed.data.entityId);
  } catch (e) {
    return reply.status(502).send({ error: "Failed to fetch entity from graph-service", details: String(e) });
  }

  let policy: BrandPolicy | undefined;
  if (entity.type === "brand") {
    policy = BrandPolicySchema.parse(await graph.getBrandPolicy(entity.id));
  }

  const canonicalContentRaw = await generateCanonicalContent(entity, policy);
  const enforced = policy ? enforcePolicyOnCanonicalContent(canonicalContentRaw, policy) : { canonicalContent: canonicalContentRaw, policyViolations: [] as PolicyViolation[] };

  return { canonicalContent: enforced.canonicalContent, policyViolations: enforced.policyViolations };
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
