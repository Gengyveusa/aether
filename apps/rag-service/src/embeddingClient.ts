import { createHash } from "node:crypto";

export interface EmbeddingClient {
  embed(texts: string[]): Promise<number[][]>;
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
    // map 0..255 -> -1..1
    v[i] = (b / 127.5) - 1;
  }

  let norm = 0;
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < v.length; i++) v[i] = v[i] / norm;
  return v;
}

export const embeddingClient: EmbeddingClient = {
  async embed(texts: string[]): Promise<number[][]> {
    const dims = 64;
    return texts.map((t) => bytesToUnitVector(hashBytes(t), dims));
  }
};
