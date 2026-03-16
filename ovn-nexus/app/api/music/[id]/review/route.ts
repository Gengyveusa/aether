// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { musicReviewSchema } from "@/lib/music/validations";

// POST /api/music/[id]/review — review a version (rate, select, approve)

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();

  try {
    const body = await req.json();
    const parsed = musicReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify version exists and belongs to this request
    const { data: version, error: fetchErr } = await supabase
      .from("music_versions")
      .select("id, request_id")
      .eq("id", parsed.data.version_id)
      .eq("request_id", params.id)
      .single();

    if (fetchErr || !version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date().toISOString();

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      reviewed_by: user?.id,
      reviewed_at: now,
    };
    if (parsed.data.rating !== undefined) updatePayload.rating = parsed.data.rating;
    if (parsed.data.review_notes !== undefined) updatePayload.review_notes = parsed.data.review_notes;
    if (parsed.data.is_selected !== undefined) updatePayload.is_selected = parsed.data.is_selected;

    // If selecting this version, deselect others first
    if (parsed.data.is_selected) {
      await supabase
        .from("music_versions")
        .update({ is_selected: false })
        .eq("request_id", params.id)
        .neq("id", parsed.data.version_id);
    }

    // Update the version
    const { data: updated, error: updateErr } = await supabase
      .from("music_versions")
      .update(updatePayload)
      .eq("id", parsed.data.version_id)
      .select()
      .single();

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    // If a version is selected, move request to "review" status
    if (parsed.data.is_selected) {
      await supabase
        .from("music_requests")
        .update({ status: "review" })
        .eq("id", params.id)
        .eq("status", "generated");
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
