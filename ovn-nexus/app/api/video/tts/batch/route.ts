import { NextRequest, NextResponse } from "next/server";

// ── Batch TTS Narration API ─────────────────────────────────────────────────
// POST /api/video/tts/batch — Generate narration for multiple slides.
// Returns JSON with base64-encoded MP3 segments.
//
// Processes slides sequentially to avoid rate limits.
// Streams progress via Server-Sent Events is possible but for simplicity
// we return all segments in a single JSON response.

const OPENAI_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
const MAX_SLIDES = 50;
const MAX_TEXT_LENGTH = 4096;

interface SlideInput {
  index: number;
  text: string;
}

interface SegmentOutput {
  index: number;
  audioBase64: string;
  durationEstimateMs: number;
  byteLength: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slides,
      voiceId = "onyx",
      speed = 0.95,
      model = "tts-1-hd",
    } = body as {
      slides: SlideInput[];
      voiceId?: string;
      speed?: number;
      model?: string;
    };

    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: "slides array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (slides.length > MAX_SLIDES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_SLIDES} slides per batch` },
        { status: 400 }
      );
    }

    if (!OPENAI_VOICES.includes(voiceId)) {
      return NextResponse.json(
        { error: `voiceId must be one of: ${OPENAI_VOICES.join(", ")}` },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const segments: SegmentOutput[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (const slide of slides) {
      if (!slide.text || typeof slide.text !== "string") {
        errors.push({ index: slide.index, error: "Missing or invalid text" });
        continue;
      }

      if (slide.text.length > MAX_TEXT_LENGTH) {
        errors.push({ index: slide.index, error: `Text exceeds ${MAX_TEXT_LENGTH} chars` });
        continue;
      }

      try {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            input: slide.text,
            voice: voiceId,
            speed: Math.max(0.25, Math.min(4.0, speed)),
            response_format: "mp3",
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          errors.push({ index: slide.index, error: `OpenAI ${response.status}: ${errorText.slice(0, 200)}` });
          continue;
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        // Estimate duration: ~16kbps for speech MP3 → bytes / 2000 ≈ seconds
        const estimatedDurationMs = Math.round((buffer.byteLength / 2000) * 1000);

        segments.push({
          index: slide.index,
          audioBase64: base64,
          durationEstimateMs: estimatedDurationMs,
          byteLength: buffer.byteLength,
        });
      } catch (err) {
        errors.push({
          index: slide.index,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      segments,
      errors,
      totalGenerated: segments.length,
      totalRequested: slides.length,
    });
  } catch (err) {
    console.error("Batch TTS route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
