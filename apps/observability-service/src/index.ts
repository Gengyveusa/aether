import Fastify from "fastify";
import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { config, logger } from "@aether/shared-utils";
import {
  AiVisibilityProbeConfigSchema,
  AiVisibilityProbeResultSchema,
  SentimentSchema,
  type AiVisibilityProbeConfig,
  type AiVisibilityProbeResult
} from "@aether/shared-types";
import { fileURLToPath } from "node:url";

export function buildApp() {
  const app = Fastify({ logger: false });

  // In-memory storage (swap to DB later)
  const probeConfigs = new Map<string, AiVisibilityProbeConfig>();
  const probeResults: AiVisibilityProbeResult[] = [];

function hashToInt(input: string): number {
  const h = createHash("sha256").update(input).digest();
  return h.readUInt32BE(0);
}

function synthesizeResult(cfg: AiVisibilityProbeConfig, modelId: string, question: string): AiVisibilityProbeResult {
  const runAt = new Date().toISOString();
  const seed = hashToInt(`${cfg.brandId}:${cfg.id}:${modelId}:${question}:${runAt.slice(0, 10)}`);
  const mentionsBrand = seed % 100 < 70;
  const sentiment = SentimentSchema.parse(["positive", "neutral", "negative"][seed % 3]);

  const rawAnswer = mentionsBrand
    ? `Model ${modelId} mentions brand ${cfg.brandId}. Answer: ${question} -> This appears relevant.`
    : `Model ${modelId} does not mention the brand directly. Answer: ${question} -> Generic guidance.`;

  const descriptionSnippet = rawAnswer.slice(0, 160);

  return AiVisibilityProbeResultSchema.parse({
    id: `probe_res_${randomUUID()}`,
    probeConfigId: cfg.id,
    brandId: cfg.brandId,
    runAt,
    modelId,
    question,
    rawAnswer,
    mentionsBrand,
    descriptionSnippet,
    sentiment
  });
}

// TODO: expose Prometheus metrics, tracing health, etc.
app.get("/metrics", async () => "# metrics stub\n");

app.get("/health", async () => ({ status: "ok" }));

app.post("/probes/configs", async (req, reply) => {
  const BodySchema = AiVisibilityProbeConfigSchema.omit({ id: true }).extend({
    id: z.string().min(1).optional()
  });
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const id = parsed.data.id ?? `probe_cfg_${randomUUID()}`;
  const cfg = AiVisibilityProbeConfigSchema.parse({ ...parsed.data, id });
  probeConfigs.set(cfg.id, cfg);
  return cfg;
});

app.get("/probes/configs/:id", async (req, reply) => {
  const id = (req.params as any).id as string;
  const cfg = probeConfigs.get(id);
  if (!cfg) return reply.status(404).send({ error: "Probe config not found" });
  return cfg;
});

app.post("/probes/run", async (req, reply) => {
  const BodySchema = z.object({ probeConfigId: z.string().min(1) });
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const cfg = probeConfigs.get(parsed.data.probeConfigId);
  if (!cfg) return reply.status(404).send({ error: "Probe config not found" });

  const results: AiVisibilityProbeResult[] = [];
  for (const modelId of cfg.targetModels) {
    for (const question of cfg.questions) {
      results.push(synthesizeResult(cfg, modelId, question));
    }
  }

  probeResults.push(...results);
  return { results };
});

app.get("/probes/results", async (req, reply) => {
  const q = req.query as any;
  const brandId = String(q.brandId ?? "");
  if (!brandId) return reply.status(400).send({ error: "brandId is required" });
  const results = probeResults.filter((r) => r.brandId === brandId);
  return { results };
});

  return app;
}

export async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? new URL(config.observabilityService.baseUrl).port ?? 3004);
  const host = process.env.HOST ?? "0.0.0.0";
  await app.listen({ port, host });
  logger.info("observability-service listening", { port, host });
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  start().catch((err) => {
    logger.error("observability-service failed to start", { err: String(err) });
    process.exit(1);
  });
}
