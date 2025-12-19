export class IngestionServiceClient {
  private readonly baseUrl: string;

  constructor(opts?: { baseUrl?: string }) {
    this.baseUrl = (opts?.baseUrl ?? (process.env.INGESTION_SERVICE_URL ?? "http://localhost:8002")).replace(/\/$/, "");
  }

  async ingestUrl(input: { brandId: string; url: string }): Promise<{ status: string; brandId: string; url: string }> {
    const res = await fetch(`${this.baseUrl}/ingest/url`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`ingestion-service POST /ingest/url failed (${res.status}): ${JSON.stringify(json)}`);
    }

    return json as { status: string; brandId: string; url: string };
  }
}
