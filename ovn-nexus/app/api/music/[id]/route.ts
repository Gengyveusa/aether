import { NextRequest, NextResponse } from "next/server";
import { getMusicRequests } from "@/lib/music/store";

// GET /api/music/[id] — get a single music request

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requests = getMusicRequests();
  const request = requests.find((r) => r.id === params.id);

  if (!request) {
    return NextResponse.json({ error: "Music request not found" }, { status: 404 });
  }

  return NextResponse.json({ data: request });
}
