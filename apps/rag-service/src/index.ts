import Fastify from "fastify";
import { z } from "zod";
import { logger } from "@aether/shared-utils";
import { embeddingClient } from "./embeddingClient.js";
import { InMemoryVectorStore } from "./inMemoryVectorStore.js";
import type { VectorDoc } from "./vectorStore.js";
import { EntityBundleSchema, stripHtml } from "./indexing.js";

const app = Fastify({ logger: false });

const vectorStore = new InMemoryVectorStore(embeddingClient);

const SemanticSearchRequestSchema = z.object({
  query: z.string().min(1),
  entityScope: z.array(z.string()).optional(),
  topK: z.number().int().min(1).max(50).optional()
});

const AnswerRequestSchema = z.object({
  query: z.string().min(1),
  entityId: z.string().optional(),
  topK: z.number().int().min(1).max(50).optional()
});

const IndexEntityRequestSchema = z.object({
  entityId: z.string().min(1)
});

app.post("/semantic-search", async (req, reply) => {
  const parsed = SemanticSearchRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const topK = parsed.data.topK ?? 5;

  // entityScope can be used to constrain results to a set of entities.
  const scope = parsed.data.entityScope?.filter(Boolean) ?? [];
  let hits = await vectorStore.search(parsed.data.query, { topK: Math.max(topK, 10) });
  if (scope.length > 0) {
    const scopeSet = new Set(scope);
    hits = hits.filter((h) => (h.entityId ? scopeSet.has(h.entityId) : false)).slice(0, topK);
  } else {
    hits = hits.slice(0, topK);
  }

  return {
    query: parsed.data.query,
    hits
  };
});

app.post("/answer", async (req, reply) => {
  const parsed = AnswerRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const hits = await vectorStore.search(parsed.data.query, { entityId: parsed.data.entityId, topK: parsed.data.topK ?? 5 });
  const answer = hits.length
    ? `Based on the indexed material: ${hits.map((h) => h.text).join(" ")}`
    : "No indexed material found for this query.";

  return {
    answer,
    citations: hits.map((h) => ({ id: h.id, url: h.url ?? null, score: h.score }))
  };
});

app.post("/index/entity", async (req, reply) => {
  const parsed = IndexEntityRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const graphBase = (process.env.GRAPH_SERVICE_URL ?? "http://localhost:8001").replace(/\/$/, "");
  const res = await fetch(`${graphBase}/indexing/entity-bundle/${encodeURIComponent(parsed.data.entityId)}`);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return reply.status(res.status).send({ error: "Failed to fetch entity bundle from graph-service", details: txt });
  }

  const json = await res.json();
  const bundle = EntityBundleSchema.parse(json);

  const docs: VectorDoc[] = [];

  // Entity doc
  const entityText = JSON.stringify(bundle.entity);
  docs.push({ id: `entity:${parsed.data.entityId}`, entityId: parsed.data.entityId, text: entityText, sourceType: "canonical_content" });

  // Canonical content docs
  if (bundle.canonicalContent) {
    const cc = bundle.canonicalContent as any;
    if (typeof cc.aboutShort === "string" && cc.aboutShort.trim()) {
      docs.push({ id: `canonical:aboutShort:${parsed.data.entityId}`, entityId: parsed.data.entityId, text: cc.aboutShort, sourceType: "canonical_content" });
    }
    if (typeof cc.aboutLong === "string" && cc.aboutLong.trim()) {
      docs.push({ id: `canonical:aboutLong:${parsed.data.entityId}`, entityId: parsed.data.entityId, text: cc.aboutLong, sourceType: "canonical_content" });
    }
    if (Array.isArray(cc.faq)) {
      cc.faq.forEach((item: any, idx: number) => {
        const q = String(item?.question ?? "").trim();
        const a = String(item?.answer ?? "").trim();
        if (q && a) {
          docs.push({
            id: `canonical:faq:${parsed.data.entityId}:${idx}`,
            entityId: parsed.data.entityId,
            text: `Q: ${q}\nA: ${a}`,
            sourceType: "canonical_content"
          });
        }
      });
    }
  }

  // Source documents docs
  for (const sd of bundle.sourceDocuments) {
    const raw = sd.content ?? "";
    const asText = sd.contentType?.includes("html") ? stripHtml(raw) : raw;
    if (!asText.trim()) continue;

    docs.push({
      id: `source:${sd.id}`,
      entityId: parsed.data.entityId,
      text: asText.slice(0, 50_000),
      sourceType: "source_document",
      url: sd.url
    });
  }

  await vectorStore.upsertDocuments(docs);
  return { indexedCount: docs.length };
});

const port = Number(process.env.PORT ?? 3002);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => logger.info("rag-service listening", { port, host }))
  .catch((err) => {
    logger.error("rag-service failed to start", { err: String(err) });
    process.exit(1);
  });
