import { createHash } from "node:crypto";
import { config } from "@aether/shared-utils";

export interface LlmProvider {
  generate(opts: { model: string; prompt: string }): Promise<string>;
}

export class StubLlmProvider implements LlmProvider {
  async generate(opts: { model: string; prompt: string }): Promise<string> {
    // Deterministic placeholder (model included for future compatibility)
    return `STUBBED(${opts.model}): ${opts.prompt.slice(0, 120)}`;
  }
}

export class VertexLlmProvider implements LlmProvider {
  async generate(_opts: { model: string; prompt: string }): Promise<string> {
    // TODO: call Vertex AI (Generative Models) with proper auth + safety settings.
    throw new Error("VertexLlmProvider not implemented yet");
  }
}

export function createLlmProvider(): LlmProvider {
  switch (config.llm.provider) {
    case "vertex":
      return new VertexLlmProvider();
    case "stub":
    default:
      return new StubLlmProvider();
  }
}

// Small helper for deterministic prompt hashing (useful later for caching)
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
