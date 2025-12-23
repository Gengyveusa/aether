import { describe, expect, it, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";

describe("rag-service /index/entity and /answer", () => {
  let graph: any;
  let base = "";

  beforeAll(async () => {
    graph = Fastify();
    graph.get("/indexing/entity-bundle/:id", async (req) => {
      const id = (req.params as any).id as string;
      return {
        entity: {
          id,
          type: "brand",
          slug: "acme",
          displayName: "Acme",
          description: "",
          websiteUrl: "https://acme.example",
          primaryTopics: [],
          targetAudiences: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        canonicalContent: {
          entityId: id,
          aboutShort: "Acme makes widgets.",
          aboutLong: "Acme makes widgets for developers.",
          faq: [{ question: "What?", answer: "Widgets" }]
        },
        sourceDocuments: [
          {
            id: "doc1",
            url: "https://acme.example",
            content: "<html><body>Acme widgets</body></html>",
            contentType: "text/html",
            ingestedAt: new Date().toISOString()
          }
        ]
      };
    });
    const addr = await graph.listen({ port: 0, host: "127.0.0.1" });
    base = typeof addr === "string" ? addr : `http://127.0.0.1:${(addr as any).port}`;
    process.env.GRAPH_SERVICE_URL = base;
  });

  afterAll(async () => {
    await graph.close();
  });

  it("indexes bundle and returns answer with citations", async () => {
    const mod = await import("../src/index.ts");
    const app = mod.buildApp();

    const idx = await app.inject({ method: "POST", url: "/index/entity", payload: { entityId: "e1" } });
    expect(idx.statusCode).toBe(200);
    expect((idx.json() as any).indexedCount).toBeGreaterThan(0);

    const ans = await app.inject({ method: "POST", url: "/answer", payload: { entityId: "e1", query: "What does Acme do?", topK: 3 } });
    expect(ans.statusCode).toBe(200);
    const json = ans.json() as any;
    expect(typeof json.answer).toBe("string");
    expect(Array.isArray(json.citations)).toBe(true);
  });
});
