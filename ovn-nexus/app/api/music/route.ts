import { NextRequest, NextResponse } from "next/server";
import { musicRequestSchema } from "@/lib/music/validations";
import { generateSunoPrompts } from "@/lib/music/prompt-generator";
import { getMusicRequests } from "@/lib/music/store";
import type { MusicRequestInput, MusicRequest, SunoPrompt } from "@/lib/music/types";

// ── Music API ─────────────────────────────────────────────────────────────────
// GET  /api/music  — list music requests (with optional status filter)
// POST /api/music  — create a new music generation request

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const musicRequests = getMusicRequests();
  let results = [...musicRequests].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (status) {
    results = results.filter((r) => r.status === status);
  }

  return NextResponse.json({
    data: results.slice(offset, offset + limit),
    total: results.length,
    limit,
    offset,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = musicRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const input: MusicRequestInput = parsed.data;

    // Generate 3 Suno-ready prompts
    const generatedPrompts: SunoPrompt[] = generateSunoPrompts(input);

    const now = new Date().toISOString();
    const newRequest: MusicRequest = {
      id: crypto.randomUUID(),
      project_id: input.project_id || null,
      user_id: "demo-user",
      title: input.title,
      use_case: input.use_case,
      mood: input.mood,
      genre: input.genre,
      tempo: input.tempo,
      instrumentation: input.instrumentation || null,
      voice_type: input.voice_type,
      lyrics_mode: input.lyrics_mode,
      lyrics_text: input.lyrics_text || null,
      prompt_notes: input.prompt_notes || null,
      duration_seconds: input.duration_seconds || null,
      generated_prompts: generatedPrompts,
      status: "queued",
      assigned_operator_id: null,
      tags: input.tags || [],
      metadata: {},
      created_at: now,
      updated_at: now,
    };

    getMusicRequests().push(newRequest);

    return NextResponse.json({
      data: newRequest,
      message: "Music request created with 3 Suno-ready prompts",
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
