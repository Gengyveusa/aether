import "reflect-metadata";

import { describe, expect, it, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import request from "supertest";

import { NestFactory } from "@nestjs/core";

let app: any;
let server: any;

let graphServer: any;
let contentServer: any;
let ingestionServer: any;
let ragServer: any;
let obsServer: any;

async function startFastify(build: (f: any) => void) {
  const f = Fastify();
  build(f);
  const addr = await f.listen({ port: 0, host: "127.0.0.1" });
  const baseUrl = typeof addr === "string" ? addr : `http://127.0.0.1:${(addr as any).port}`;
  return { f, baseUrl };
}

beforeAll(async () => {
  const graph = await startFastify((f) => {
    const entities = new Map<string, any>();
    const docs: any[] = [];
    const policies = new Map<string, any>();

    f.post("/entities", async (req) => {
      const b = req.body as any;
      const id = b.id ?? "00000000-0000-0000-0000-000000000011";
      const now = new Date().toISOString();
      const ent = { ...b, id, createdAt: now, updatedAt: now };
      entities.set(id, ent);
      return ent;
    });
    f.get("/entities/:id", async (req, reply) => {
      const id = (req.params as any).id;
      const ent = entities.get(id);
      if (!ent) return reply.status(404).send({});
      return ent;
    });
    f.put("/canonical-content/:id", async (req) => req.body);
    f.get("/source-documents", async (req) => ({ sourceDocuments: docs }));
    f.post("/source-documents", async (req) => {
      const d = req.body as any;
      docs.push({ id: "doc1", brandId: d.brandId, url: d.url, ingestedAt: new Date().toISOString(), contentType: d.contentType });
      return docs[docs.length - 1];
    });
    f.get("/brand-policies/:id", async (req) => {
      const id = (req.params as any).id;
      return policies.get(id) ?? { allowedClaims: { canUseSuperlatives: false, allowedSuperlatives: [], allowedComparisons: [] }, forbiddenPhrases: [], regulatedTopics: [] };
    });
    f.put("/brand-policies/:id", async (req) => {
      const id = (req.params as any).id;
      policies.set(id, req.body);
      return req.body;
    });
  });

  const content = await startFastify((f) => {
    f.post("/generate/canonical-content", async (req) => {
      const ent = (req.body as any).entity;
      return { canonicalContent: { entityId: ent.id, aboutShort: "", aboutLong: "", faq: [] }, policyViolations: [] };
    });
  });

  const ingestion = await startFastify((f) => {
    f.post("/ingest/url", async (req) => {
      const b = req.body as any;
      return { status: "ok", brandId: b.brandId, url: b.url };
    });
  });

  const rag = await startFastify((f) => {
    f.post("/index/entity", async () => ({ indexedCount: 1 }));
    f.post("/answer", async () => ({ answer: "stub", citations: [{ id: "c1", url: null, score: 0.5 }] }));
  });

  const obs = await startFastify((f) => {
    f.post("/probes/configs", async () => ({ id: "cfg1", brandId: "b1", questions: ["q"], targetModels: ["m"] }));
    f.post("/probes/run", async () => ({ results: [] }));
    f.get("/probes/results", async () => ({ results: [] }));
  });

  graphServer = graph.f;
  contentServer = content.f;
  ingestionServer = ingestion.f;
  ragServer = rag.f;
  obsServer = obs.f;

  process.env.GRAPH_SERVICE_URL = graph.baseUrl;
  process.env.CONTENT_SERVICE_URL = content.baseUrl;
  process.env.INGESTION_SERVICE_URL = ingestion.baseUrl;
  process.env.RAG_SERVICE_URL = rag.baseUrl;
  process.env.OBSERVABILITY_SERVICE_URL = obs.baseUrl;
  process.env.DISABLE_GRAPHQL = "true";

  // Import compiled JS so Nest can read emitted decorator metadata.
  const { AppModule } = await import("../dist/modules/app.module.js");
  app = await NestFactory.create(AppModule, { logger: false });
  await app.init();
  server = app.getHttpServer();
});

afterAll(async () => {
  await app.close();
  await graphServer.close();
  await contentServer.close();
  await ingestionServer.close();
  await ragServer.close();
  await obsServer.close();
});

describe("gateway core flow", () => {
  it("POST /brands then ingest then answer", async () => {
    const create = await request(server)
      .post("/brands")
      .send({ slug: "acme", displayName: "Acme", description: "", websiteUrl: "https://acme.example", primaryTopics: [], targetAudiences: [] })
      .expect(201);

    const createJson: any = create.body && Object.keys(create.body).length ? create.body : JSON.parse(create.text);
    expect(createJson.brand).toBeTruthy();
    const brandId = createJson.brand.id;
    expect(typeof brandId).toBe("string");

    await request(server).post(`/brands/${brandId}/ingest`).send({}).expect(201);

    const answer = await request(server)
      .post(`/entities/${brandId}/answer`)
      .send({ query: "What does it do?" })
      .expect(201);

    expect(typeof answer.body.answer).toBe("string");
    expect(Array.isArray(answer.body.citations)).toBe(true);
  });
});
