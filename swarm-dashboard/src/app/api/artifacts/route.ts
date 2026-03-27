import { NextResponse } from "next/server";
import { ARTIFACTS } from "@/lib/swarm-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  let filtered = [...ARTIFACTS];
  if (type && type !== "all") {
    filtered = filtered.filter((a) => a.type === type);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((a) => a.status === status);
  }

  return NextResponse.json({
    artifacts: filtered,
    total: filtered.length,
    timestamp: new Date().toISOString(),
  });
}
