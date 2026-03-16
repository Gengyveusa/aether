import { NextRequest, NextResponse } from "next/server";
import { musicStatusUpdateSchema } from "@/lib/music/validations";
import { getMusicRequests } from "@/lib/music/store";

// PATCH /api/music/[id]/status — update job status

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = musicStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const requests = getMusicRequests();
    const request = requests.find((r) => r.id === params.id);

    if (!request) {
      return NextResponse.json({ error: "Music request not found" }, { status: 404 });
    }

    request.status = parsed.data.status;
    request.updated_at = new Date().toISOString();

    return NextResponse.json({ data: request });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
