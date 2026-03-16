// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { musicRequestSchema } from "@/lib/music/validations";
import { generateSunoPrompts } from "@/lib/music/prompt-generator";
import type { MusicRequestInput } from "@/lib/music/types";

// ── Music API ─────────────────────────────────────────────────────────────────
// GET  /api/music  — list music requests (with optional status filter)
// POST /api/music  — create a new music generation request

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  let query = supabase
    .from("music_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count, limit, offset });
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();

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
    const generatedPrompts = generateSunoPrompts(input);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("music_requests")
      .insert({
        user_id: user?.id ?? "anonymous",
        title: input.title,
        project_id: input.project_id || null,
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
        tags: input.tags || [],
        metadata: {},
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      data,
      message: "Music request created with 3 Suno-ready prompts",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
