import { NextRequest, NextResponse } from "next/server";
import { musicCommentSchema } from "@/lib/music/validations";
import { getMusicComments } from "@/lib/music/store";
import type { MusicComment } from "@/lib/music/types";

// GET /api/music/[id]/comments
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const comments = getMusicComments()
    .filter((c) => c.request_id === params.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return NextResponse.json({ data: comments });
}

// POST /api/music/[id]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = musicCommentSchema.safeParse({ ...body, request_id: params.id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const comment: MusicComment = {
      id: crypto.randomUUID(),
      request_id: params.id,
      version_id: parsed.data.version_id || null,
      user_id: "demo-user",
      content: parsed.data.content,
      timestamp_seconds: parsed.data.timestamp_seconds ?? null,
      created_at: new Date().toISOString(),
    };

    getMusicComments().push(comment);

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
