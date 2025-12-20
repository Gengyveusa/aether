import { describe, expect, it } from "vitest";
import { createLlmProviderFromConfig } from "../src/providers/llmProvider.js";

const baseCfg: any = {
  llm: { provider: "stub", model: "stub-model", projectId: undefined, location: undefined }
};

describe("createLlmProviderFromConfig", () => {
  it("returns stub provider when provider=stub", async () => {
    const p = createLlmProviderFromConfig({ ...baseCfg, llm: { ...baseCfg.llm, provider: "stub" } } as any);
    const out = await p.generate({ model: "m", prompt: "hello" });
    expect(out).toContain("STUBBED");
  });

  it("throws when provider=vertex but missing project/location", () => {
    expect(() =>
      createLlmProviderFromConfig({ ...baseCfg, llm: { provider: "vertex", model: "gemini-1.5-pro" } } as any)
    ).toThrow(/missing/i);
  });
});
