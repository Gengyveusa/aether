import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase-client";

// ── Audio Storage API ───────────────────────────────────────────────────────
// POST /api/video/store — Upload generated audio to Supabase Storage.
//   Body: { audioBase64, slideIndex, presentationId, filename? }
//   Returns: { url, path }
//
// GET /api/video/store?presentationId=xxx — List stored audio for a presentation.
//   Returns: { slides: [{ index, url, filename, size }] }

const BUCKET = "presentation-audio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      audioBase64,
      slideIndex,
      presentationId = "gingival-immunity-v2",
      filename,
    } = body;

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json({ error: "audioBase64 is required" }, { status: 400 });
    }
    if (slideIndex === undefined || slideIndex === null) {
      return NextResponse.json({ error: "slideIndex is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Ensure bucket exists (idempotent)
    await ensureBucket(supabase);

    const buffer = Buffer.from(audioBase64, "base64");
    const fname = filename || `slide_${String(slideIndex).padStart(2, "0")}_audio.mp3`;
    const storagePath = `${presentationId}/${fname}`;

    // Upload (upsert to allow re-generation)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("[Store] upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    console.log(`[Store] uploaded slide=${slideIndex} path=${storagePath} bytes=${buffer.byteLength}`);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: storagePath,
      slideIndex,
      byteLength: buffer.byteLength,
    });
  } catch (err) {
    console.error("[Store] route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const presentationId = req.nextUrl.searchParams.get("presentationId") || "gingival-immunity-v2";
    const supabase = createServiceClient();

    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list(presentationId, {
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      // Bucket may not exist yet
      return NextResponse.json({ slides: [], total: 0 });
    }

    const slides = (files || [])
      .filter((f) => f.name.endsWith(".mp3"))
      .map((f) => {
        // Extract slide index from filename: slide_01_audio.mp3 → 1
        const match = f.name.match(/slide_(\d+)/);
        const index = match ? parseInt(match[1], 10) : -1;

        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(`${presentationId}/${f.name}`);

        return {
          index,
          url: urlData.publicUrl,
          filename: f.name,
          size: f.metadata?.size || 0,
          updatedAt: f.updated_at,
        };
      })
      .sort((a, b) => a.index - b.index);

    return NextResponse.json({
      slides,
      total: slides.length,
      presentationId,
    });
  } catch (err) {
    console.error("[Store] list error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function ensureBucket(supabase: ReturnType<typeof createServiceClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB per file
      allowedMimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav"],
    });
    if (error && !error.message.includes("already exists")) {
      console.warn("[Store] bucket creation warning:", error.message);
    }
  }
}
