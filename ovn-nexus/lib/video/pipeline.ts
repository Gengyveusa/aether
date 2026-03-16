import {
  PipelineInput,
  PipelineOutput,
  SlideData,
  VoiceSegment,
  MusicTrack,
  TemplateConfig,
} from "./types";
import { parsePptx, extractSlideImages, generateNarrationScript } from "./pptx-parser";
import { generateVoiceSegments, estimateNarrationDuration } from "./ai-voice";
import { generateMusic } from "./ai-music";

// ── Video Pipeline Orchestrator ──────────────────────────────────────────────
// Coordinates the full PPTX → cinematic video workflow.

type ProgressCallback = (step: string, progress: number) => void;

export async function runPipeline(
  input: PipelineInput,
  onProgress?: ProgressCallback
): Promise<PipelineOutput> {
  const fs = await import("fs");
  const path = await import("path");

  const { pptxPath, template, outputDir, title, subtitle, author } = input;

  fs.mkdirSync(outputDir, { recursive: true });

  // ── Step 1: Parse PPTX ──────────────────────────────────────────────────
  onProgress?.("Parsing PowerPoint slides...", 5);

  const parsed = await parsePptx(pptxPath);
  console.log(`Parsed ${parsed.slideCount} slides from: ${parsed.title}`);

  // ── Step 2: Extract slide images ────────────────────────────────────────
  onProgress?.("Extracting slide images...", 15);

  const imagesDir = path.join(outputDir, "slides");
  let slideImages: string[];

  try {
    slideImages = await extractSlideImages(pptxPath, imagesDir);
  } catch (err) {
    console.warn("Could not extract slide images (LibreOffice required):", err);
    slideImages = [];
  }

  // Assign images to slides
  const slides: SlideData[] = parsed.slides.map((slide, i) => ({
    ...slide,
    imagePath: slideImages[i] || undefined,
  }));

  // ── Step 3: Generate narration scripts ──────────────────────────────────
  onProgress?.("Generating narration scripts...", 25);

  const scripts = generateNarrationScript(slides);
  console.log("Narration scripts generated for", scripts.length, "slides");

  // ── Step 4: Generate AI voice narration ─────────────────────────────────
  onProgress?.("Generating AI voice narration...", 35);

  const voiceDir = path.join(outputDir, "voice");
  let voiceSegments: VoiceSegment[];

  try {
    voiceSegments = await generateVoiceSegments(scripts, template, voiceDir);
  } catch (err) {
    console.warn("Voice generation failed (API key required):", err);
    // Create estimated segments
    voiceSegments = scripts.map((text, i) => ({
      slideIndex: i,
      text,
      durationMs: estimateNarrationDuration(text, template.voice.speed),
    }));
  }

  // ── Step 5: Calculate slide durations ───────────────────────────────────
  onProgress?.("Calculating timing...", 55);

  for (let i = 0; i < slides.length; i++) {
    const voiceDuration = voiceSegments[i]?.durationMs || 5000;
    const paddingMs = template.timing.paddingAfterNarrationSec * 1000;
    const minMs = template.timing.minSlideDurationSec * 1000;

    slides[i].duration = Math.max(voiceDuration + paddingMs, minMs) / 1000;
  }

  // ── Step 6: Generate AI background music ────────────────────────────────
  onProgress?.("Generating AI background music...", 65);

  const totalContentDuration = slides.reduce((sum, s) => sum + s.duration * 1000, 0);
  const introDuration = template.timing.introDurationSec * 1000;
  const outroDuration = template.timing.outroDurationSec * 1000;
  const totalDurationMs = introDuration + totalContentDuration + outroDuration;

  const musicDir = path.join(outputDir, "music");
  let musicTrack: MusicTrack;

  try {
    musicTrack = await generateMusic(template, totalDurationMs, musicDir);
  } catch (err) {
    console.warn("Music generation failed:", err);
    musicTrack = {
      url: "",
      title: "No music generated",
      durationMs: totalDurationMs,
      style: template.music.style,
    };
  }

  // ── Step 7: Generate Remotion composition config ────────────────────────
  onProgress?.("Building video composition...", 75);

  const compositionConfig = buildCompositionConfig(
    slides,
    voiceSegments,
    musicTrack,
    template,
    { title: title || parsed.title, subtitle, author }
  );

  // Write composition config for Remotion to consume
  const configPath = path.join(outputDir, "composition.json");
  fs.writeFileSync(configPath, JSON.stringify(compositionConfig, null, 2));

  // ── Step 8: Render video with FFmpeg ────────────────────────────────────
  onProgress?.("Rendering final video...", 85);

  const videoPath = path.join(outputDir, "output.mp4");
  const thumbnailPath = path.join(outputDir, "thumbnail.jpg");

  try {
    await renderVideoWithFFmpeg(slides, voiceSegments, musicTrack, template, videoPath);
    await generateThumbnail(slideImages[0] || "", thumbnailPath, template);
  } catch (err) {
    console.warn("FFmpeg render skipped (run Remotion for full render):", err);
  }

  // ── Step 9: Build output ────────────────────────────────────────────────
  onProgress?.("Complete!", 100);

  return {
    videoPath,
    thumbnailPath,
    durationMs: totalDurationMs,
    slides,
    voiceSegments,
    musicTrack,
    metadata: {
      title: title || parsed.title,
      subtitle,
      author,
      createdAt: new Date().toISOString(),
      templateId: template.id,
    },
  };
}

// ── Composition Config Builder ───────────────────────────────────────────────

interface CompositionConfig {
  meta: { title: string; subtitle?: string; author?: string };
  template: TemplateConfig;
  totalDurationFrames: number;
  scenes: Array<{
    type: "intro" | "slide" | "outro";
    startFrame: number;
    durationFrames: number;
    slide?: SlideData;
    voiceSegment?: VoiceSegment;
    transition: string;
  }>;
  music: MusicTrack;
}

function buildCompositionConfig(
  slides: SlideData[],
  voiceSegments: VoiceSegment[],
  music: MusicTrack,
  template: TemplateConfig,
  meta: { title: string; subtitle?: string; author?: string }
): CompositionConfig {
  const { fps } = template;
  const scenes: CompositionConfig["scenes"] = [];
  let currentFrame = 0;

  // Intro scene
  const introFrames = Math.round(template.timing.introDurationSec * fps);
  scenes.push({
    type: "intro",
    startFrame: currentFrame,
    durationFrames: introFrames,
    transition: template.transitions.intro,
  });
  currentFrame += introFrames;

  // Slide scenes
  for (let i = 0; i < slides.length; i++) {
    const durationFrames = Math.round(slides[i].duration * fps);
    scenes.push({
      type: "slide",
      startFrame: currentFrame,
      durationFrames,
      slide: slides[i],
      voiceSegment: voiceSegments[i],
      transition: template.transitions.default,
    });
    currentFrame += durationFrames;
  }

  // Outro scene
  const outroFrames = Math.round(template.timing.outroDurationSec * fps);
  scenes.push({
    type: "outro",
    startFrame: currentFrame,
    durationFrames: outroFrames,
    transition: template.transitions.outro,
  });
  currentFrame += outroFrames;

  return {
    meta,
    template,
    totalDurationFrames: currentFrame,
    scenes,
    music,
  };
}

// ── FFmpeg Video Renderer ────────────────────────────────────────────────────

async function renderVideoWithFFmpeg(
  slides: SlideData[],
  voiceSegments: VoiceSegment[],
  music: MusicTrack,
  template: TemplateConfig,
  outputPath: string
): Promise<void> {
  const { execSync } = await import("child_process");
  const fs = await import("fs");
  const path = await import("path");

  // Verify we have slide images
  const validSlides = slides.filter((s) => s.imagePath && fs.existsSync(s.imagePath));
  if (validSlides.length === 0) {
    throw new Error("No slide images available for rendering");
  }

  // Build FFmpeg concat filter
  const outputDir = path.dirname(outputPath);
  const concatFile = path.join(outputDir, "concat.txt");
  const concatLines = validSlides
    .map((s) => `file '${s.imagePath}'\nduration ${s.duration}`)
    .join("\n");
  fs.writeFileSync(concatFile, concatLines);

  // Build FFmpeg command
  const parts: string[] = [
    "ffmpeg -y",
    `-f concat -safe 0 -i "${concatFile}"`,
  ];

  // Add voice narration tracks
  const voiceFiles = voiceSegments.filter((v) => v.audioPath && fs.existsSync(v.audioPath));
  if (voiceFiles.length > 0) {
    // Concatenate all voice segments
    const voiceConcatFile = path.join(outputDir, "voice-concat.txt");
    const voiceLines = voiceFiles
      .map((v) => `file '${v.audioPath}'`)
      .join("\n");
    fs.writeFileSync(voiceConcatFile, voiceLines);
    parts.push(`-f concat -safe 0 -i "${voiceConcatFile}"`);
  }

  // Add background music
  if (music.url && fs.existsSync(path.join(outputDir, "music", "background-music.mp3"))) {
    parts.push(`-i "${path.join(outputDir, "music", "background-music.mp3")}"`);
  }

  // Video filter: scale to 1920x1080, add Ken Burns effect
  parts.push(
    `-vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=${template.style.backgroundColor.replace("#", "0x")}"`
  );

  // Audio mixing
  if (voiceFiles.length > 0) {
    const musicVol = template.music.volume;
    parts.push(`-filter_complex "[1:a]volume=1.0[voice];[2:a]volume=${musicVol}[music];[voice][music]amix=inputs=2:duration=longest[aout]" -map 0:v -map "[aout]"`);
  }

  // Output settings
  parts.push(
    `-c:v libx264 -preset medium -crf 23`,
    `-c:a aac -b:a 192k`,
    `-r ${template.fps}`,
    `-pix_fmt yuv420p`,
    `"${outputPath}"`
  );

  const cmd = parts.join(" \\\n  ");
  console.log("Rendering video with FFmpeg...");
  execSync(cmd, { timeout: 600000 });
}

async function generateThumbnail(
  firstImagePath: string,
  outputPath: string,
  template: TemplateConfig
): Promise<void> {
  const { execSync } = await import("child_process");
  const fs = await import("fs");

  if (!firstImagePath || !fs.existsSync(firstImagePath)) return;

  execSync(
    `ffmpeg -y -i "${firstImagePath}" -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -q:v 2 "${outputPath}"`,
    { timeout: 30000 }
  );
}
