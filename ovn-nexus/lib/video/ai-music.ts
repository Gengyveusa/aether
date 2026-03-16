import { MusicTrack, TemplateConfig } from "./types";

// ── AI Music Generation ──────────────────────────────────────────────────────
// Generates background music for the video using AI music services.

/**
 * Generate or select background music for the video.
 */
export async function generateMusic(
  template: TemplateConfig,
  totalDurationMs: number,
  outputDir: string
): Promise<MusicTrack> {
  const fs = await import("fs");
  const path = await import("path");

  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "background-music.mp3");

  switch (template.music.provider) {
    case "suno":
      return await generateSunoMusic(template.music.style, totalDurationMs, outputPath);
    case "mubert":
      return await generateMubertMusic(template.music.style, totalDurationMs, outputPath);
    case "custom":
      // Custom music URL — download it
      return {
        url: "",
        title: "Custom Track",
        durationMs: totalDurationMs,
        style: "custom",
      };
    default:
      throw new Error(`Unknown music provider: ${template.music.provider}`);
  }
}

/**
 * Generate music using Suno API.
 * Requires SUNO_API_KEY environment variable.
 *
 * Suno generates full songs from text prompts.
 * We use instrumental mode for background music.
 */
async function generateSunoMusic(
  style: string,
  durationMs: number,
  outputPath: string
): Promise<MusicTrack> {
  const fs = await import("fs");

  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    console.warn("SUNO_API_KEY not set — using placeholder music track");
    return createPlaceholderTrack(durationMs, style);
  }

  // Suno API v2 — generate instrumental track
  const response = await fetch("https://api.suno.ai/v1/generation", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: style,
      make_instrumental: true,
      duration: Math.min(Math.ceil(durationMs / 1000), 240), // max 4 min
      model: "v3.5",
    }),
  });

  if (!response.ok) {
    console.warn(`Suno API error: ${response.status} — using placeholder`);
    return createPlaceholderTrack(durationMs, style);
  }

  const data = await response.json();
  const audioUrl = data.audio_url || data.output?.audio_url;

  if (audioUrl) {
    // Download the generated music
    const audioResponse = await fetch(audioUrl);
    const buffer = Buffer.from(await audioResponse.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return {
      url: audioUrl,
      title: data.title || "AI Generated Background",
      durationMs: (data.duration || Math.ceil(durationMs / 1000)) * 1000,
      style,
    };
  }

  return createPlaceholderTrack(durationMs, style);
}

/**
 * Generate music using Mubert API.
 * Requires MUBERT_API_KEY environment variable.
 *
 * Mubert generates royalty-free AI music from text prompts.
 */
async function generateMubertMusic(
  style: string,
  durationMs: number,
  outputPath: string
): Promise<MusicTrack> {
  const fs = await import("fs");

  const apiKey = process.env.MUBERT_API_KEY;
  if (!apiKey) {
    console.warn("MUBERT_API_KEY not set — using placeholder music track");
    return createPlaceholderTrack(durationMs, style);
  }

  const durationSec = Math.ceil(durationMs / 1000);

  const response = await fetch("https://api.mubert.com/v2/RecordTrackTTM", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "RecordTrackTTM",
      params: {
        pat: apiKey,
        duration: durationSec,
        tags: [],
        prompt: style,
        mode: "track",
        bitrate: 320,
      },
    }),
  });

  if (!response.ok) {
    console.warn(`Mubert API error: ${response.status} — using placeholder`);
    return createPlaceholderTrack(durationMs, style);
  }

  const data = await response.json();
  const trackUrl = data.data?.tasks?.[0]?.download_link;

  if (trackUrl) {
    const audioResponse = await fetch(trackUrl);
    const buffer = Buffer.from(await audioResponse.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return {
      url: trackUrl,
      title: "Mubert AI Track",
      durationMs: durationSec * 1000,
      style,
    };
  }

  return createPlaceholderTrack(durationMs, style);
}

/**
 * Create a placeholder track entry when AI music services are unavailable.
 * The actual silence/placeholder can be generated with FFmpeg.
 */
function createPlaceholderTrack(durationMs: number, style: string): MusicTrack {
  return {
    url: "",
    title: "Placeholder — Add music manually or configure API key",
    durationMs,
    style,
  };
}

/**
 * Generate a silent audio file for the specified duration (useful for testing).
 */
export async function generateSilence(durationMs: number, outputPath: string): Promise<void> {
  const { execSync } = await import("child_process");

  const durationSec = Math.ceil(durationMs / 1000);
  execSync(
    `ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t ${durationSec} -q:a 9 "${outputPath}" -y`,
    { timeout: 30000 }
  );
}
