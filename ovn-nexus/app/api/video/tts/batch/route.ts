import { NextRequest, NextResponse } from "next/server";

// ── Batch TTS Narration API ─────────────────────────────────────────────────
// POST /api/video/tts/batch — Generate narration for multiple slides.
// Returns JSON with base64-encoded MP3 segments + per-slide status.
//
// Processes slides sequentially with retry/backoff per slide.
// Never silently skips — every slide gets a definitive status.

const MAX_SLIDES = 50;
const MAX_TEXT_LENGTH = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

// ElevenLabs voice mappings
const ELEVENLABS_VOICES: Record<string, string> = {
  eryn:    "g6xIsTj2HwM6GjFCqOSz",
  george:  "JBFqnCBsd6RMkjVDRZzb",
  aria:    "9BWtsMINqrJLrRacOk9x",
  roger:   "CwhRBWXzGAHq8TQ4Fs17",
  sarah:   "EXAVITQu4vr4xnSDxMaL",
  onyx:    "JBFqnCBsd6RMkjVDRZzb",
  echo:    "CwhRBWXzGAHq8TQ4Fs17",
  nova:    "9BWtsMINqrJLrRacOk9x",
  alloy:   "EXAVITQu4vr4xnSDxMaL",
  fable:   "g6xIsTj2HwM6GjFCqOSz",
  shimmer: "9BWtsMINqrJLrRacOk9x",
};

const OPENAI_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

interface SlideInput {
  index: number;
  text: string;
}

interface SlideResult {
  index: number;
  status: "success" | "failed" | "skipped";
  audioBase64?: string;
  byteLength?: number;
  durationEstimateMs?: number;
  error?: string;
  provider?: string;
  retries?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slides,
      voiceId = "onyx",
      speed = 0.95,
      model = "tts-1-hd",
      provider: requestedProvider,
    } = body as {
      slides: SlideInput[];
      voiceId?: string;
      speed?: number;
      model?: string;
      provider?: string;
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

    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const provider = requestedProvider
      || (elevenlabsKey ? "elevenlabs" : "openai");

    if (provider === "elevenlabs" && !elevenlabsKey) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
    }
    if (provider === "openai" && !openaiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const results: SlideResult[] = [];

    for (const slide of slides) {
      // Validate text
      if (!slide.text || typeof slide.text !== "string") {
        results.push({ index: slide.index, status: "skipped", error: "Missing or invalid text" });
        continue;
      }
      if (slide.text.length > MAX_TEXT_LENGTH) {
        results.push({ index: slide.index, status: "skipped", error: `Text exceeds ${MAX_TEXT_LENGTH} chars` });
        continue;
      }

      let retries = 0;
      let success = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          let buffer: ArrayBuffer;

          if (provider === "elevenlabs") {
            buffer = await callElevenLabs(slide.text, voiceId, speed, elevenlabsKey!);
          } else {
            buffer = await callOpenAI(slide.text, voiceId, speed, model, openaiKey!);
          }

          const base64 = Buffer.from(buffer).toString("base64");
          // Estimate: ~16kbps for speech MP3
          const durationEstimateMs = Math.round((buffer.byteLength / 2000) * 1000);

          results.push({
            index: slide.index,
            status: "success",
            audioBase64: base64,
            byteLength: buffer.byteLength,
            durationEstimateMs,
            provider,
            retries,
          });

          console.log(
            `[TTS:batch] slide=${slide.index} status=ok provider=${provider} ` +
            `chars=${slide.text.length} bytes=${buffer.byteLength} retries=${retries}`
          );
          success = true;
          break;
        } catch (err) {
          retries = attempt;
          const errMsg = err instanceof Error ? err.message : String(err);

          if (attempt < MAX_RETRIES && isRetryable(errMsg)) {
            const delay = RETRY_DELAYS[attempt] || 4000;
            console.warn(`[TTS:batch] slide=${slide.index} retry ${attempt + 1}: ${errMsg}`);
            await sleep(delay);
            continue;
          }

          results.push({
            index: slide.index,
            status: "failed",
            error: errMsg,
            provider,
            retries,
          });

          console.error(`[TTS:batch] slide=${slide.index} FAILED after ${retries + 1} attempts: ${errMsg}`);
          break;
        }
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;

    return NextResponse.json({
      results,
      summary: {
        total: slides.length,
        succeeded,
        failed,
        skipped,
        provider,
      },
    });
  } catch (err) {
    console.error("[TTS:batch] route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── ElevenLabs ──────────────────────────────────────────────────────────────

async function callElevenLabs(
  text: string,
  voiceId: string,
  speed: number,
  apiKey: string
): Promise<ArrayBuffer> {
  const elevenVoiceId = ELEVENLABS_VOICES[voiceId] || ELEVENLABS_VOICES["george"];

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${errorText.slice(0, 200)}`);
  }

  return await response.arrayBuffer();
}

// ── OpenAI ──────────────────────────────────────────────────────────────────

async function callOpenAI(
  text: string,
  voiceId: string,
  speed: number,
  model: string,
  apiKey: string
): Promise<ArrayBuffer> {
  const voice = OPENAI_VOICES.includes(voiceId) ? voiceId : "onyx";

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      speed: Math.max(0.25, Math.min(4.0, speed)),
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI ${response.status}: ${errorText.slice(0, 200)}`);
  }

  return await response.arrayBuffer();
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes("429") || lower.includes("timeout") ||
         lower.includes("econnreset") || lower.includes("socket") ||
         lower.includes("rate");
}
