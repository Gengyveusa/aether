import { CanonicalContentSchema, EntitySchema, type CanonicalContent, type Entity } from "@aether/shared-types";

function baseUrlFromEnv(name: string, fallback: string) {
  return (process.env[name] ?? fallback).replace(/\/$/, "");
}

export class ContentServiceClient {
  private readonly baseUrl: string;

  constructor(opts?: { baseUrl?: string }) {
    this.baseUrl = (opts?.baseUrl ?? baseUrlFromEnv("CONTENT_SERVICE_URL", "http://localhost:3003")).replace(/\/$/, "");
  }

  async generateCanonicalContent(entity: Entity): Promise<CanonicalContent> {
    const res = await fetch(`${this.baseUrl}/generate/canonical-content`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entity })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        `content-service POST /generate/canonical-content failed (${res.status}): ${JSON.stringify(json)}`
      );
    }

    const parsed = EntitySchema.parse(entity);
    const canonical = CanonicalContentSchema.parse((json as any).canonicalContent);
    if (canonical.entityId !== parsed.id) {
      throw new Error("content-service returned canonicalContent with mismatched entityId");
    }
    return canonical;
  }
}
