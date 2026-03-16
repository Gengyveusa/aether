// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";

// POST /api/music/[id]/publish — publish an approved version

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();

  try {
    const body = await req.json();
    const { version_id, title, description, license_type, attached_to_type, attached_to_id } = body;

    if (!version_id) {
      return NextResponse.json({ error: "version_id is required" }, { status: 400 });
    }

    // Fetch request
    const { data: request, error: reqErr } = await supabase
      .from("music_requests")
      .select("*")
      .eq("id", params.id)
      .single();

    if (reqErr || !request) {
      return NextResponse.json({ error: "Music request not found" }, { status: 404 });
    }

    // Fetch version
    const { data: version, error: verErr } = await supabase
      .from("music_versions")
      .select("*")
      .eq("id", version_id)
      .eq("request_id", params.id)
      .single();

    if (verErr || !version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Insert published record
    const { data: published, error: pubErr } = await supabase
      .from("music_published")
      .insert({
        request_id: params.id,
        version_id,
        title: title || request.title,
        description: description || null,
        license_type: license_type || "internal",
        attached_to_type: attached_to_type || null,
        attached_to_id: attached_to_id || null,
        cover_image_url: version.cover_image_url,
        genre: request.genre,
        mood: request.mood,
        tags: request.tags,
        published_by: user?.id ?? "anonymous",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pubErr) return NextResponse.json({ error: pubErr.message }, { status: 500 });

    // Update request status to published
    await supabase
      .from("music_requests")
      .update({ status: "published" })
      .eq("id", params.id);

    return NextResponse.json({
      data: published,
      message: "Track published successfully",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
