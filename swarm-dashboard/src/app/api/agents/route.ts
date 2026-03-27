import { NextResponse } from "next/server";
import { AGENTS } from "@/lib/swarm-data";

export async function GET() {
  return NextResponse.json({
    agents: AGENTS,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { agentId, action } = body as { agentId: string; action: "activate" | "deactivate" | "seed" };

  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // In production, this would trigger actual agent activation
  const statusMap = {
    activate: "active" as const,
    deactivate: "idle" as const,
    seed: "seeding" as const,
  };

  return NextResponse.json({
    agentId,
    action,
    newStatus: statusMap[action],
    timestamp: new Date().toISOString(),
    message: `Agent ${agentId} ${action} command received`,
  });
}
