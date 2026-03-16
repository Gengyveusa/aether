import { NextRequest, NextResponse } from "next/server";
import { getMusicRequests, getMusicVersions } from "@/lib/music/store";
import type { MusicVersion } from "@/lib/music/types";

// GET /api/music/[id]/versions — list versions for a request
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const versions = getMusicVersions()
    .filter((v) => v.request_id === params.id)
    .sort((a, b) => a.version_number - b.version_number);

  return NextResponse.json({ data: versions });
}

// POST /api/music/[id]/versions — upload a new version (operator uploads audio)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requests = getMusicRequests();
    const request = requests.find((r) => r.id === params.id);

    if (!request) {
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

    // In production: upload to Supabase Storage, get public URL
    const musicVersions = getMusicVersions();
    const existingVersions = musicVersions.filter((v) => v.request_id === params.id);
    const versionNumber = existingVersions.length + 1;

    const now = new Date().toISOString();
    const newVersion: MusicVersion = {
      id: crypto.randomUUID(),
      request_id: params.id,
      version_number: versionNumber,
      audio_url: `/api/music/${params.id}/versions/${versionNumber}/audio`,
      audio_format: format,
      audio_size_bytes: audioFile.size,
      duration_seconds: null,
      stems_url: null,
      cover_image_url: coverImage ? `/api/music/${params.id}/versions/${versionNumber}/cover` : null,
      waveform_data: null,
      prompt_used: promptUsed,
      suno_generation_id: sunoGenId,
      is_selected: false,
      rating: null,
      review_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      uploaded_by: "demo-operator",
      created_at: now,
      updated_at: now,
    };

    musicVersions.push(newVersion);

    // Auto-update request status to "generated"
    if (request.status === "generating" || request.status === "queued") {
      request.status = "generated";
      request.updated_at = now;
    }

    return NextResponse.json({
      data: newVersion,
      message: `Version ${versionNumber} uploaded successfully`,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 400 });
  }
}
