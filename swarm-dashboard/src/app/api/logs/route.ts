import { NextResponse } from "next/server";
import { getRecentLogs } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const logs = getRecentLogs(limit);
  return NextResponse.json({ logs, timestamp: new Date().toISOString() });
}
