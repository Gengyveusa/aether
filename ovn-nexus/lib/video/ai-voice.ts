import { VoiceSegment, TemplateConfig } from "./types";

// ── AI Voice Generation ──────────────────────────────────────────────────────
// Generates narration audio from text using OpenAI TTS or ElevenLabs.

interface TTSOptions {
  text: string;
  voiceId: string;
  speed: number;
  model?: string;
  outputPath: string;
}

/**
 * Generate voice narration for all slides.
 */
export async function generateVoiceSegments(
  scripts: string[],
  template: TemplateConfig,
  outputDir: string
): Promise<VoiceSegment[]> {
  const fs = await import("fs");
  const path = await import("path");

  fs.mkdirSync(outputDir, { recursive: true });

  const segments: VoiceSegment[] = [];

  for (let i = 0; i < scripts.length; i++) {
    const text = scripts[i];
    const outputPath = path.join(outputDir, `narration-${String(i).padStart(3, "0")}.mp3`);

    if (template.voice.provider === "openai") {
      await generateOpenAITTS({
        text,
        voiceId: template.voice.voiceId,
        speed: template.voice.speed,
        model: template.voice.model || "tts-1-hd",
        outputPath,
      });
    } else if (template.voice.provider === "elevenlabs") {
      await generateElevenLabsTTS({
        text,
        voiceId: template.voice.voiceId,
        speed: template.voice.speed,
        outputPath,
      });
    }

    // Get audio duration
    const durationMs = await getAudioDuration(outputPath);

    segments.push({
      slideIndex: i,
      text,
      audioPath: outputPath,
      durationMs,
    });
  }

  return segments;
}

/**
 * Generate TTS using OpenAI's API.
 * Requires OPENAI_API_KEY environment variable.
 */
async function generateOpenAITTS(options: TTSOptions): Promise<void> {
  const fs = await import("fs");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required for voice generation");
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || "tts-1-hd",
      input: options.text,
      voice: options.voiceId,
      speed: options.speed,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI TTS failed: ${response.status} ${error}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(options.outputPath, buffer);
}

/**
 * Generate TTS using ElevenLabs API.
 * Requires ELEVENLABS_API_KEY environment variable.
 */
async function generateElevenLabsTTS(options: TTSOptions): Promise<void> {
  const fs = await import("fs");

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY environment variable is required");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${options.voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: options.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: options.speed,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${response.status} ${error}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(options.outputPath, buffer);
}

/**
 * Get audio duration in milliseconds using ffprobe.
 */
async function getAudioDuration(filePath: string): Promise<number> {
  const { execSync } = await import("child_process");

  try {
    const result = execSync(
      `ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`,
      { encoding: "utf-8" }
    ).trim();

    return Math.round(parseFloat(result) * 1000);
  } catch {
    // Fallback: estimate from file size (~16kbps for speech mp3)
    const fs = await import("fs");
    const stats = fs.statSync(filePath);
    return Math.round((stats.size / 2000) * 1000); // rough estimate
  }
}

/**
 * Estimate word count to approximate narration duration (for planning).
 * Average narration is ~150 words per minute.
 */
export function estimateNarrationDuration(text: string, speed: number = 1.0): number {
  const words = text.split(/\s+/).length;
  const wpm = 150 * speed;
  return Math.round((words / wpm) * 60 * 1000); // ms
}
