import { NextRequest, NextResponse } from "next/server";

// ── TTS Narration API ───────────────────────────────────────────────────────
// POST /api/video/tts — Generate narration audio for a single slide.
// Returns MP3 binary (audio/mpeg).

const OPENAI_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voiceId = "onyx",
      speed = 0.95,
      model = "tts-1-hd",
    } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required and must be a string" },
        { status: 400 }
      );
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: "text must be 4096 characters or fewer" },
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

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice: voiceId,
        speed: Math.max(0.25, Math.min(4.0, speed)),
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI TTS error: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `OpenAI TTS failed: ${response.status}` },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    console.error("TTS route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
