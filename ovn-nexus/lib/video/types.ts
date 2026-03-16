// ── Video Pipeline Types ─────────────────────────────────────────────────────

export interface SlideData {
  index: number;
  title: string;
  body: string;
  notes: string;
  imagePath?: string;        // path to exported slide image
  imageUrl?: string;         // URL after upload
  duration: number;          // seconds this slide is shown
}

export interface VoiceSegment {
  slideIndex: number;
  text: string;
  audioPath?: string;
  audioUrl?: string;
  durationMs: number;
}

export interface MusicTrack {
  url: string;
  title: string;
  durationMs: number;
  style: string;
}

export type TransitionType =
  | "fade"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out"
  | "dissolve"
  | "ken-burns"
  | "cinematic-wipe";

export type AnimationPreset =
  | "documentary"         // Ken Burns + fade transitions, muted palette
  | "cinematic-dark"      // Dark backgrounds, dramatic reveals, spotlight
  | "modern-minimal"      // Clean whites, slide-in, subtle motion
  | "science-journal"     // Paper-like, data-focused, clinical feel
  | "impact-story";       // Bold colors, fast cuts, emotional

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  preset: AnimationPreset;
  fps: number;
  width: number;
  height: number;
  transitions: {
    default: TransitionType;
    intro: TransitionType;
    outro: TransitionType;
  };
  timing: {
    introDurationSec: number;
    outroDurationSec: number;
    transitionDurationSec: number;
    minSlideDurationSec: number;
    paddingAfterNarrationSec: number;
  };
  style: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    overlayOpacity: number;
  };
  voice: {
    provider: "openai" | "elevenlabs";
    voiceId: string;
    speed: number;
    model?: string;
  };
  music: {
    provider: "suno" | "mubert" | "custom";
    style: string;
    volume: number;   // 0-1, relative to voice
  };
}

export interface PipelineInput {
  pptxPath: string;
  template: TemplateConfig;
  outputDir: string;
  title: string;
  subtitle?: string;
  author?: string;
}

export interface PipelineOutput {
  videoPath: string;
  videoUrl?: string;
  thumbnailPath: string;
  thumbnailUrl?: string;
  durationMs: number;
  slides: SlideData[];
  voiceSegments: VoiceSegment[];
  musicTrack: MusicTrack;
  metadata: {
    title: string;
    subtitle?: string;
    author?: string;
    createdAt: string;
    templateId: string;
  };
}

export interface VideoProject {
  id: string;
  title: string;
  status: "draft" | "processing" | "rendering" | "complete" | "error";
  progress: number;         // 0-100
  templateId: string;
  input: PipelineInput;
  output?: PipelineOutput;
  createdAt: string;
  updatedAt: string;
  error?: string;
}
