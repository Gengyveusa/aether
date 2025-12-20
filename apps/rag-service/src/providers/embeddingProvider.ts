import { createHash } from "node:crypto";
import { config } from "@aether/shared-utils";

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
  async embed(_opts: { model: string; texts: string[] }): Promise<number[][]> {
    // TODO: call Vertex AI embeddings endpoint.
    throw new Error("VertexEmbeddingProvider not implemented yet");
  }
}

export function createEmbeddingProvider(): EmbeddingProvider {
  switch (config.embeddings.provider) {
    case "vertex":
      return new VertexEmbeddingProvider();
    case "stub":
    default:
      return new StubEmbeddingProvider();
  }
}
