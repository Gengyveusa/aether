// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";

const AUDIO_BUCKET = process.env.SUPABASE_MUSIC_BUCKET || "music-uploads";

// GET /api/music/[id]/versions — list versions for a request
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("music_versions")
    .select("*")
    .eq("request_id", params.id)
    .order("version_number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// POST /api/music/[id]/versions — upload a new version (operator uploads audio)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();

  try {
    // Verify request exists
    const { data: request, error: reqError } = await supabase
      .from("music_requests")
      .select("id, status")
      .eq("id", params.id)
      .single();

    if (reqError || !request) {
      return NextResponse.json({ error: "Music request not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const promptUsed = formData.get("prompt_used") as string | null;
    const sunoGenId = formData.get("suno_generation_id") as string | null;
    const coverImage = formData.get("cover_image") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const format = audioFile.name.split(".").pop()?.toLowerCase() || "mp3";
    if (!["mp3", "wav", "flac", "ogg"].includes(format)) {
      return NextResponse.json(
        { error: "Unsupported audio format. Use mp3, wav, flac, or ogg." },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Count existing versions to determine version number
    const { count } = await supabase
      .from("music_versions")
      .select("id", { count: "exact", head: true })
      .eq("request_id", params.id);

    const versionNumber = (count || 0) + 1;

    // Upload audio to Supabase Storage
    const audioPath = `${params.id}/v${versionNumber}/audio.${format}`;
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(audioPath, audioBuffer, {
        contentType: audioFile.type || `audio/${format}`,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Get public URL for the uploaded audio
    const { data: urlData } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(audioPath);
    const audioUrl = urlData.publicUrl;

    // Upload cover image if provided
    let coverImageUrl: string | null = null;
    if (coverImage) {
      const coverExt = coverImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const coverPath = `${params.id}/v${versionNumber}/cover.${coverExt}`;
      const coverBuffer = Buffer.from(await coverImage.arrayBuffer());

      const { error: coverUploadError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(coverPath, coverBuffer, {
          contentType: coverImage.type || `image/${coverExt}`,
          upsert: true,
        });

      if (!coverUploadError) {
        const { data: coverUrlData } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(coverPath);
        coverImageUrl = coverUrlData.publicUrl;
      }
    }

    // Insert version record
    const { data: version, error: insertError } = await supabase
      .from("music_versions")
      .insert({
        request_id: params.id,
        version_number: versionNumber,
        audio_url: audioUrl,
        audio_format: format,
        audio_size_bytes: audioFile.size,
        prompt_used: promptUsed,
        suno_generation_id: sunoGenId,
        cover_image_url: coverImageUrl,
        uploaded_by: user?.id ?? "anonymous",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Auto-update request status to "generated"
    if (request.status === "generating" || request.status === "queued") {
      await supabase
        .from("music_requests")
        .update({ status: "generated" })
        .eq("id", params.id);
    }

    return NextResponse.json({
      data: version,
      message: `Version ${versionNumber} uploaded successfully`,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 400 });
  }
}
