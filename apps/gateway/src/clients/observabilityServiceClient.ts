import type { AiVisibilityProbeConfig, AiVisibilityProbeResult, AiVisibilityScorecard } from "@aether/shared-types";
import { config } from "@aether/shared-utils";

export class ObservabilityServiceClient {
  private readonly baseUrl: string;

  constructor(opts?: { baseUrl?: string }) {
    this.baseUrl = (opts?.baseUrl ?? config.observabilityService.baseUrl).replace(/\/$/, "");
  }

  async createProbeConfig(input: { brandId: string; questions: string[]; targetModels: string[] }) {
    const res = await fetch(`${this.baseUrl}/probes/configs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`observability-service POST /probes/configs failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json as AiVisibilityProbeConfig;
  }

  async runProbe(input: { probeConfigId: string }): Promise<{ results: AiVisibilityProbeResult[] }> {
    const res = await fetch(`${this.baseUrl}/probes/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`observability-service POST /probes/run failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json as { results: AiVisibilityProbeResult[] };
  }

  async listProbeResults(brandId: string): Promise<{ results: AiVisibilityProbeResult[] }> {
    const res = await fetch(`${this.baseUrl}/probes/results?brandId=${encodeURIComponent(brandId)}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`observability-service GET /probes/results failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json as { results: AiVisibilityProbeResult[] };
  }

  async computeScorecard(entityId: string): Promise<AiVisibilityScorecard> {
    const res = await fetch(`${this.baseUrl}/scorecards/compute`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entityId })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`observability-service POST /scorecards/compute failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json as AiVisibilityScorecard;
  }

  async getScorecard(entityId: string): Promise<AiVisibilityScorecard | null> {
    const res = await fetch(`${this.baseUrl}/scorecards/${encodeURIComponent(entityId)}`);
    if (res.status === 404) return null;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`observability-service GET /scorecards failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return json as AiVisibilityScorecard;
  }
}
