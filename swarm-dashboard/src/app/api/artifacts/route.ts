import { NextResponse } from "next/server";
import { getAllArtifacts, updateArtifactStatus, seedIfEmpty } from "@/lib/db";
import { ARTIFACTS } from "@/lib/swarm-data";

export async function GET(request: Request) {
  // Seed DB with initial data if empty
  seedIfEmpty(ARTIFACTS);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const agentId = searchParams.get("agentId") || undefined;

  const artifacts = getAllArtifacts({ type, status, agentId });

  return NextResponse.json({
    artifacts,
    total: artifacts.length,
    timestamp: new Date().toISOString(),
  });
}

// PATCH: Update artifact status (approve, reject, flag)
export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status } = body as { id: string; status: string };

  const validStatuses = ["ingested", "validating", "review", "flagged", "rejected"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
  }

  const updated = updateArtifactStatus(id, status as "ingested" | "validating" | "review" | "flagged" | "rejected");
  if (!updated) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, id, status });
}
