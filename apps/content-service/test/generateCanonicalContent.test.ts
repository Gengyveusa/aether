import { describe, expect, it, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";

describe("content-service /generate/canonical-content", () => {
  let graph: any;
  let graphBaseUrl = "";

  beforeAll(async () => {
    graph = Fastify();
    graph.get("/brand-policies/:id", async () => ({
      allowedClaims: { canUseSuperlatives: false, allowedSuperlatives: [], allowedComparisons: [] },
      forbiddenPhrases: ["best ever"],
      regulatedTopics: []
    }));
    const addr = await graph.listen({ port: 0, host: "127.0.0.1" });
    graphBaseUrl = typeof addr === "string" ? addr : `http://127.0.0.1:${(addr as any).port}`;
    process.env.GRAPH_SERVICE_URL = graphBaseUrl;
  });

  afterAll(async () => {
    await graph.close();
  });

  it("generates canonical content and returns policyViolations array", async () => {
    const mod = await import("../src/index.ts");
    const app = mod.buildApp();

    const res = await app.inject({
      method: "POST",
      url: "/generate/canonical-content",
      payload: {
        entity: {
          id: "00000000-0000-0000-0000-000000000001",
          type: "brand",
          slug: "acme",
          displayName: "Acme best ever",
          description: "best ever platform",
          websiteUrl: "https://acme.example",
          primaryTopics: ["widgets"],
          targetAudiences: ["developers"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });

    expect(res.statusCode).toBe(200);
    const json = res.json() as any;
    expect(json.canonicalContent).toBeTruthy();
    expect(json.canonicalContent.entityId).toBe("00000000-0000-0000-0000-000000000001");
    expect(Array.isArray(json.policyViolations)).toBe(true);
  });
});
