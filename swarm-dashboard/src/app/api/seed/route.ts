import { NextResponse } from "next/server";
import { generateSeedingPrompt } from "@/lib/artifact-parser";

/**
 * GET /api/seed?agentId=SC-001&agentName=ScienceClaw
 * Returns a ready-to-use seeding prompt for any agent
 *
 * POST /api/seed
 * { agentId, agentName, queries?: string[] }
 * Returns a customized seeding prompt
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId") || "SC-001";
  const agentName = searchParams.get("agentName") || "Research Agent";

  const prompt = generateSeedingPrompt(agentId, agentName);

  return NextResponse.json({
    agentId,
    agentName,
    prompt,
    instructions: "Copy this prompt into any AI agent (Claude, ChatGPT, ScienceClaw). Paste the agent's output into the Submit Artifact form or POST it to /api/webhooks/ingest.",
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { agentId, agentName, queries } = body as {
    agentId: string;
    agentName: string;
    queries?: string[];
  };

  const prompt = generateSeedingPrompt(
    agentId || "SC-001",
    agentName || "Research Agent",
    queries,
  );

  return NextResponse.json({
    agentId,
    agentName,
    prompt,
    queryCount: queries?.length || 7,
  });
}
