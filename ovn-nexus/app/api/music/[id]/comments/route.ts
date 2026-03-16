// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { musicCommentSchema } from "@/lib/music/validations";

// GET /api/music/[id]/comments
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("music_comments")
    .select("*, profiles!music_comments_user_id_fkey(full_name, avatar_url)")
    .eq("request_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// POST /api/music/[id]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();

  try {
    const body = await req.json();
    const parsed = musicCommentSchema.safeParse({ ...body, request_id: params.id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("music_comments")
      .insert({
        request_id: params.id,
        version_id: parsed.data.version_id || null,
        user_id: user?.id ?? "anonymous",
        content: parsed.data.content,
        timestamp_seconds: parsed.data.timestamp_seconds ?? null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
