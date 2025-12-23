import { createHash } from "node:crypto";
import { config, type EmbeddingsProviderKind } from "@aether/shared-utils";
import { GoogleAuth } from "google-auth-library";

export interface EmbeddingProvider {
  embed(opts: { model: string; texts: string[] }): Promise<number[][]>;
}

function hashBytes(input: string): Uint8Array {
  const h = createHash("sha256");
  h.update(input);
  return h.digest();
}

function bytesToUnitVector(bytes: Uint8Array, dims: number): number[] {
  const v = new Array<number>(dims);
  for (let i = 0; i < dims; i++) {
    const b = bytes[i % bytes.length] ?? 0;
    v[i] = (b / 127.5) - 1;
  }

  let norm = 0;
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < v.length; i++) v[i] = v[i] / norm;
  return v;
}

export class StubEmbeddingProvider implements EmbeddingProvider {
  async embed(opts: { model: string; texts: string[] }): Promise<number[][]> {
    const dims = 64;
    // Deterministic embeddings based on (model + text)
    return opts.texts.map((t) => bytesToUnitVector(hashBytes(`${opts.model}:${t}`), dims));
  }
}

export class VertexEmbeddingProvider implements EmbeddingProvider {
  private readonly projectId: string;
  private readonly location: string;
  private readonly auth: GoogleAuth;

  constructor(opts: { projectId: string; location: string }) {
    this.projectId = opts.projectId;
    this.location = opts.location;
    this.auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  }

  async embed(opts: { model: string; texts: string[] }): Promise<number[][]> {
    const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${encodeURIComponent(
      opts.model
    )}:predict`;

    const client = await this.auth.getClient();
    const token = await client.getAccessToken();
    const accessToken = typeof token === "string" ? token : token?.token;
    if (!accessToken) throw new Error("Failed to obtain Google access token for Vertex AI embeddings");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        instances: opts.texts.map((text) => ({ content: text }))
      })
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Vertex AI predict (embeddings) failed (${res.status}): ${JSON.stringify(json)}`);
    }

    // Expected: predictions[i].embeddings.values: number[]
    const preds = (json as any)?.predictions;
    if (!Array.isArray(preds)) {
      throw new Error(`Unexpected Vertex embeddings response shape: ${JSON.stringify(json).slice(0, 500)}`);
    }

    const vectors = preds.map((p: any) => p?.embeddings?.values).filter(Boolean);
    if (vectors.length !== opts.texts.length) {
      throw new Error(`Vertex embeddings returned ${vectors.length} vectors for ${opts.texts.length} texts`);
    }
    return vectors as number[][];
  }
}

export function createEmbeddingProviderFromConfig(cfg: typeof config): EmbeddingProvider {
  const provider = cfg.embeddings.provider as EmbeddingsProviderKind;
  switch (provider) {
    case "vertex": {
      const projectId = cfg.embeddings.projectId;
      const location = cfg.embeddings.location;
      if (!projectId || !location) {
        throw new Error(
          "Vertex embeddings selected but missing VERTEX_PROJECT_ID/VERTEX_LOCATION (or EMBEDDINGS_PROJECT_ID/EMBEDDINGS_LOCATION)"
        );
      }
      return new VertexEmbeddingProvider({ projectId, location });
    }
    case "stub":
    default:
      return new StubEmbeddingProvider();
  }
}

export function createEmbeddingProvider(): EmbeddingProvider {
  return createEmbeddingProviderFromConfig(config);
}
