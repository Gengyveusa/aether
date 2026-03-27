import { NextResponse } from "next/server";
import { parseArtifactYaml } from "@/lib/artifact-parser";
import { insertArtifact, addLogEntry } from "@/lib/db";

/**
 * POST /api/webhooks/ingest
 *
 * Universal artifact ingestion endpoint. Accepts artifacts from:
 * 1. ScienceClaw x Infinite webhook (MIT Buehler Lab)
 * 2. Any agent following the Quantum Distillery YAML format
 * 3. Manual paste from the dashboard submission form
 *
 * Body can be:
 * - { text: "raw yaml/markdown text", agentId?: "SC-001", source?: "webhook" | "manual" | "email" }
 * - { artifacts: [ { ...artifact fields } ] }  (structured JSON array)
 *
 * Auth: Bearer token in Authorization header (optional, for webhook security)
 */
export async function POST(request: Request) {
  try {
    // Optional auth check for webhook security
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.SWARM_WEBHOOK_SECRET;
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let body: Record<string, unknown>;

    if (contentType.includes("text/plain")) {
      // Raw text body — parse as single artifact block
      const text = await request.text();
      body = { text, source: "webhook" };
    } else {
      body = await request.json();
    }

    const source = (body.source as string) || "webhook";
    const results: Array<{ id: string; title: string; status: string; warnings: string[] }> = [];

    if (body.text) {
      // Parse raw YAML/markdown text — may contain multiple artifacts
      const rawText = body.text as string;
      const agentId = body.agentId as string | undefined;

      // Split on YAML block boundaries (``` yaml ... ```)
      const yamlBlocks = rawText.split(/```yaml/i).slice(1);

      if (yamlBlocks.length > 0) {
        // Multiple YAML blocks found — parse each
        for (const block of yamlBlocks) {
          const cleaned = block.split("```")[0].trim();
          // Find the full context: yaml block + text after it until next yaml block
          const afterBlock = block.split("```").slice(1).join("```").trim();
          const fullText = cleaned + (afterBlock ? "\n" + afterBlock.split("```yaml")[0] : "");

          const parsed = parseArtifactYaml(cleaned + "\n" + afterBlock.split(/```yaml/i)[0], agentId);

          try {
            insertArtifact({ ...parsed.artifact, rawYaml: fullText, sourceChannel: source });
            addLogEntry(
              `INGESTED artifact ${parsed.artifact.id}: "${parsed.artifact.title}" via ${source}`,
              parsed.isValid ? "info" : "warning",
              parsed.artifact.agentId,
            );
            results.push({
              id: parsed.artifact.id,
              title: parsed.artifact.title,
              status: parsed.isValid ? "ingested" : "needs-review",
              warnings: parsed.warnings,
            });
          } catch (dbErr: unknown) {
            const errMsg = dbErr instanceof Error ? dbErr.message : "Unknown error";
            // Duplicate ID — skip
            if (errMsg.includes("UNIQUE constraint")) {
              results.push({ id: parsed.artifact.id, title: parsed.artifact.title, status: "duplicate", warnings: ["Artifact ID already exists"] });
            } else {
              throw dbErr;
            }
          }
        }
      } else {
        // Single artifact — try parsing the whole text
        const parsed = parseArtifactYaml(rawText, agentId);
        try {
          insertArtifact({ ...parsed.artifact, rawYaml: rawText, sourceChannel: source });
          addLogEntry(
            `INGESTED artifact ${parsed.artifact.id}: "${parsed.artifact.title}" via ${source}`,
            parsed.isValid ? "info" : "warning",
            parsed.artifact.agentId,
          );
          results.push({
            id: parsed.artifact.id,
            title: parsed.artifact.title,
            status: parsed.isValid ? "ingested" : "needs-review",
            warnings: parsed.warnings,
          });
        } catch (dbErr: unknown) {
          const errMsg = dbErr instanceof Error ? dbErr.message : "Unknown error";
          if (errMsg.includes("UNIQUE constraint")) {
            results.push({ id: parsed.artifact.id, title: parsed.artifact.title, status: "duplicate", warnings: ["Artifact ID already exists"] });
          } else {
            throw dbErr;
          }
        }
      }
    } else if (Array.isArray(body.artifacts)) {
      // Structured JSON artifacts
      for (const artData of body.artifacts as Array<Record<string, unknown>>) {
        const artifact = {
          id: (artData.id || artData["swarm-artifact-id"] || `SA-${artData.agentId || "MANUAL"}-${Date.now()}-${Math.floor(Math.random() * 999)}`) as string,
          agentId: (artData.agentId || artData["agent-id"] || "MANUAL") as string,
          type: (artData.type || artData["artifact-type"] || "literature-summary") as "literature-summary",
          targetFolder: (artData.targetFolder || artData["target-folder"] || "06-Literature") as string,
          title: (artData.title || "Untitled") as string,
          relevanceScore: (artData.relevanceScore || artData["relevance-score"] || 3) as number,
          architectureAlignment: (artData.architectureAlignment || artData["architecture-alignment"] || []) as string[],
          status: "validating" as const,
          timestamp: new Date().toISOString(),
          cancerSignature: (artData.cancerSignature || artData["cancer-signature"] || "") as string,
          agingSignature: (artData.agingSignature || artData["aging-signature"] || "") as string,
        };

        try {
          insertArtifact({ ...artifact, sourceChannel: source });
          addLogEntry(`INGESTED artifact ${artifact.id}: "${artifact.title}" via ${source}`, "info", artifact.agentId);
          results.push({ id: artifact.id, title: artifact.title, status: "ingested", warnings: [] });
        } catch (dbErr: unknown) {
          const errMsg = dbErr instanceof Error ? dbErr.message : "Unknown error";
          if (errMsg.includes("UNIQUE constraint")) {
            results.push({ id: artifact.id, title: artifact.title, status: "duplicate", warnings: ["Already exists"] });
          } else {
            throw dbErr;
          }
        }
      }
    } else {
      return NextResponse.json({ error: "Request must include 'text' (raw YAML) or 'artifacts' (JSON array)" }, { status: 400 });
    }

    const ingested = results.filter((r) => r.status === "ingested").length;
    const duplicates = results.filter((r) => r.status === "duplicate").length;
    const needsReview = results.filter((r) => r.status === "needs-review").length;

    return NextResponse.json({
      success: true,
      summary: { total: results.length, ingested, duplicates, needsReview },
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook ingest error:", errMsg);
    addLogEntry(`WEBHOOK ERROR: ${errMsg}`, "error");
    return NextResponse.json({ error: "Internal server error", details: errMsg }, { status: 500 });
  }
}

// GET: health check + ingestion stats
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/ingest",
    accepts: ["application/json", "text/plain"],
    methods: ["POST"],
    docs: {
      json: '{ "text": "raw yaml text", "agentId": "SC-001", "source": "webhook|manual|email" }',
      structured: '{ "artifacts": [ { "title": "...", "type": "literature-summary", ... } ] }',
      auth: "Optional Bearer token via SWARM_WEBHOOK_SECRET env var",
    },
  });
}
