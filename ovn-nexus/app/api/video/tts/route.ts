import { NextRequest, NextResponse } from "next/server";

// ── TTS Narration API ───────────────────────────────────────────────────────
// POST /api/video/tts — Generate narration audio for a single slide.
// Returns MP3 binary (audio/mpeg).
//
// Provider priority: ElevenLabs (if key set) → OpenAI fallback.
// Includes retry with exponential backoff for reliability.

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // ms

// ElevenLabs voice mappings — maps our template voice IDs to ElevenLabs voice IDs
const ELEVENLABS_VOICES: Record<string, string> = {
  // Template voice names → ElevenLabs voice IDs
  // Using high-quality pre-made voices
  eryn:    "g6xIsTj2HwM6GjFCqOSz", // Eryn — warm, authoritative female
  george:  "JBFqnCBsd6RMkjVDRZzb", // George — deep authoritative male
  aria:    "9BWtsMINqrJLrRacOk9x", // Aria — clear, professional female
  roger:   "CwhRBWXzGAHq8TQ4Fs17", // Roger — calm, narrative male
  sarah:   "EXAVITQu4vr4xnSDxMaL", // Sarah — natural conversational female
  // Fallback aliases for OpenAI voice names
  onyx:    "JBFqnCBsd6RMkjVDRZzb", // → George
  echo:    "CwhRBWXzGAHq8TQ4Fs17", // → Roger
  nova:    "9BWtsMINqrJLrRacOk9x", // → Aria
  alloy:   "EXAVITQu4vr4xnSDxMaL", // → Sarah
  fable:   "g6xIsTj2HwM6GjFCqOSz", // → Eryn
  shimmer: "9BWtsMINqrJLrRacOk9x", // → Aria
};

const OPENAI_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voiceId = "onyx",
      speed = 0.95,
      model = "tts-1-hd",
      provider: requestedProvider,
      slideIndex,
    } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required and must be a string" },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "text must be 5000 characters or fewer" },
        { status: 400 }
      );
    }

    // Determine provider: explicit request → ElevenLabs (if key) → OpenAI fallback
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const provider = requestedProvider
      || (elevenlabsKey ? "elevenlabs" : "openai");

    if (provider === "elevenlabs" && !elevenlabsKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is not configured" },
        { status: 500 }
      );
    }
    if (provider === "openai" && !openaiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    let audioBuffer: ArrayBuffer;
    let usedProvider: string;

    if (provider === "elevenlabs") {
      audioBuffer = await generateElevenLabs(text, voiceId, speed, elevenlabsKey!);
      usedProvider = "elevenlabs";
    } else {
      audioBuffer = await generateOpenAI(text, voiceId, speed, model, openaiKey!);
      usedProvider = "openai";
    }

    console.log(
      `[TTS] slide=${slideIndex ?? "?"} provider=${usedProvider} voice=${voiceId} ` +
      `chars=${text.length} bytes=${audioBuffer.byteLength}`
    );

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "public, max-age=604800, immutable",
        "X-TTS-Provider": usedProvider,
      },
    });
  } catch (err) {
    console.error("[TTS] route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// ── ElevenLabs TTS ──────────────────────────────────────────────────────────

async function generateElevenLabs(
  text: string,
  voiceId: string,
  speed: number,
  apiKey: string
): Promise<ArrayBuffer> {
  const elevenVoiceId = ELEVENLABS_VOICES[voiceId] || ELEVENLABS_VOICES["george"];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
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

      if (response.status === 429) {
        // Rate limited — wait and retry
        const delay = RETRY_DELAYS[attempt] || 4000;
        console.warn(`[TTS] ElevenLabs rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs TTS failed: ${response.status} ${errorText.slice(0, 300)}`);
      }

      return await response.arrayBuffer();
    } catch (err) {
      if (attempt < MAX_RETRIES && isRetryable(err)) {
        const delay = RETRY_DELAYS[attempt] || 4000;
        console.warn(`[TTS] ElevenLabs error, retrying in ${delay}ms:`, (err as Error).message);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }

  throw new Error("ElevenLabs TTS failed after all retries");
}

// ── OpenAI TTS (fallback) ───────────────────────────────────────────────────

async function generateOpenAI(
  text: string,
  voiceId: string,
  speed: number,
  model: string,
  apiKey: string
): Promise<ArrayBuffer> {
  const voice = OPENAI_VOICES.includes(voiceId) ? voiceId : "onyx";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
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

      if (response.status === 429) {
        const delay = RETRY_DELAYS[attempt] || 4000;
        console.warn(`[TTS] OpenAI rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI TTS failed: ${response.status} ${errorText.slice(0, 300)}`);
      }

      return await response.arrayBuffer();
    } catch (err) {
      if (attempt < MAX_RETRIES && isRetryable(err)) {
        const delay = RETRY_DELAYS[attempt] || 4000;
        console.warn(`[TTS] OpenAI error, retrying in ${delay}ms:`, (err as Error).message);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }

  throw new Error("OpenAI TTS failed after all retries");
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("429") || msg.includes("timeout") ||
           msg.includes("econnreset") || msg.includes("socket");
  }
  return false;
}
