import { createHash } from "node:crypto";
import { config, type LlmProviderKind } from "@aether/shared-utils";
import { GoogleAuth } from "google-auth-library";

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
  private readonly projectId: string;
  private readonly location: string;
  private readonly auth: GoogleAuth;

  constructor(opts: { projectId: string; location: string }) {
    this.projectId = opts.projectId;
    this.location = opts.location;
    this.auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  }

  async generate(opts: { model: string; prompt: string }): Promise<string> {
    // Uses Vertex AI public REST API. Assumes GOOGLE_APPLICATION_CREDENTIALS is set externally.
    const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${encodeURIComponent(
      opts.model
    )}:generateContent`;

    const client = await this.auth.getClient();
    const token = await client.getAccessToken();
    const accessToken = typeof token === "string" ? token : token?.token;
    if (!accessToken) throw new Error("Failed to obtain Google access token for Vertex AI");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: opts.prompt }] }]
      })
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Vertex AI generateContent failed (${res.status}): ${JSON.stringify(json)}`);
    }

    // Expected shape (Gemini): candidates[0].content.parts[0].text
    const text =
      (json as any)?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") ??
      (json as any)?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || typeof text !== "string") {
      throw new Error(`Unexpected Vertex AI response shape: ${JSON.stringify(json).slice(0, 500)}`);
    }

    return text;
  }
}

export function createLlmProviderFromConfig(cfg: typeof config): LlmProvider {
  const provider = cfg.llm.provider as LlmProviderKind;
  switch (provider) {
    case "vertex": {
      const projectId = cfg.llm.projectId;
      const location = cfg.llm.location;
      if (!projectId || !location) {
        throw new Error("Vertex LLM selected but missing VERTEX_PROJECT_ID/VERTEX_LOCATION (or LLM_PROJECT_ID/LLM_LOCATION)");
      }
      return new VertexLlmProvider({ projectId, location });
    }
    case "stub":
    default:
      return new StubLlmProvider();
  }
}

export function createLlmProvider(): LlmProvider {
  return createLlmProviderFromConfig(config);
}

// Small helper for deterministic prompt hashing (useful later for caching)
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
