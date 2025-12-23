import { describe, expect, it } from "vitest";
import { createEmbeddingProviderFromConfig } from "../src/providers/embeddingProvider.js";

const baseCfg: any = {
  embeddings: { provider: "stub", model: "stub-embeddings", projectId: undefined, location: undefined }
};

describe("createEmbeddingProviderFromConfig", () => {
  it("returns stub provider when provider=stub", async () => {
    const p = createEmbeddingProviderFromConfig({ ...baseCfg, embeddings: { ...baseCfg.embeddings, provider: "stub" } } as any);
    const v = await p.embed({ model: "m", texts: ["hello"] });
    expect(Array.isArray(v)).toBe(true);
    expect(v[0].length).toBeGreaterThan(0);
  });

  it("throws when provider=vertex but missing project/location", () => {
    expect(() =>
      createEmbeddingProviderFromConfig({ ...baseCfg, embeddings: { provider: "vertex", model: "text-embedding-004" } } as any)
    ).toThrow(/missing/i);
  });
});
