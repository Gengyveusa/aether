import { describe, it, expect } from "vitest";

// Requires a running Qdrant (e.g. docker run -p 6333:6333 qdrant/qdrant)
// and VECTOR_BACKEND=qdrant.

describe("QdrantVectorBackend (integration)", () => {
  it.skip("upserts and searches", async () => {
    process.env.VECTOR_BACKEND = "qdrant";
    process.env.QDRANT_URL = "http://localhost:6333";
    process.env.QDRANT_COLLECTION = `test_${Date.now()}`;
    process.env.QDRANT_VECTOR_SIZE = "64";

    const { createVectorBackend } = await import("../src/vector/createVectorBackend.js");
    const backend = createVectorBackend();

    await backend.upsert([
      { id: "doc1", entityId: "e1", text: "Acme makes widgets", sourceType: "canonical_content" },
      { id: "doc2", entityId: "e1", text: "Bananas are yellow", sourceType: "source_document" }
    ]);

    const hits = await backend.search("widgets", { entityId: "e1", topK: 2 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].id).toBeTruthy();
  });
});
