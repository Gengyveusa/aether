import Fastify from "fastify";
import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { config, logger } from "@aether/shared-utils";
import {
  AiVisibilityProbeConfigSchema,
  AiVisibilityProbeResultSchema,
  AiVisibilityScorecardSchema,
  type AiVisibilityScorecard,
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
  const scorecards = new Map<string, AiVisibilityScorecard>();

  function tokenize(s: string): Set<string> {
    return new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
    );
  }

  function jaccard(a: string, b: string): number {
    const A = tokenize(a);
    const B = tokenize(b);
    if (A.size === 0 || B.size === 0) return 0;
    let inter = 0;
    for (const t of A) if (B.has(t)) inter += 1;
    const union = A.size + B.size - inter;
    return union === 0 ? 0 : inter / union;
  }

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

  app.post("/scorecards/compute", async (req, reply) => {
    const BodySchema = z.object({ entityId: z.string().min(1) });
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
    }

    const entityId = parsed.data.entityId;
    const results = probeResults.filter((r) => r.brandId === entityId);

    const coverage = results.length ? results.filter((r) => r.mentionsBrand).length / results.length : 0;
    const sentimentScore = results.length
      ? results
          .map((r) => (r.sentiment === "positive" ? 1 : r.sentiment === "negative" ? -1 : 0))
          .reduce((a, b) => a + b, 0 as number) / results.length
      : 0;

    // Fetch canonical content from graph-service
    const graphBase = config.graphService.baseUrl;
    let aboutShort = "";
    try {
      const res = await fetch(`${graphBase}/canonical-content/${encodeURIComponent(entityId)}`);
      if (res.ok) {
        const json = await res.json();
        aboutShort = String((json as any).aboutShort ?? "");
      }
    } catch {
      // ignore, keep empty
    }

    const descriptionConsistency = results.length && aboutShort
      ? results.map((r) => jaccard(r.descriptionSnippet, aboutShort)).reduce((a, b) => a + b, 0) / results.length
      : 0;

    const scorecard = AiVisibilityScorecardSchema.parse({
      entityId,
      computedAt: new Date().toISOString(),
      coverage,
      sentimentScore,
      descriptionConsistency
    });

    scorecards.set(entityId, scorecard);
    return scorecard;
  });

  app.get("/scorecards/:entityId", async (req, reply) => {
    const entityId = (req.params as any).entityId as string;
    const sc = scorecards.get(entityId);
    if (!sc) return reply.status(404).send({ error: "Scorecard not found" });
    return sc;
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
