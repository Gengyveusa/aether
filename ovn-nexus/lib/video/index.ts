// ── Video Pipeline — Public API ───────────────────────────────────────────────
// Re-exports for convenient importing.

export type {
  SlideData,
  VoiceSegment,
  MusicTrack,
  TransitionType,
  AnimationPreset,
  TemplateConfig,
  PipelineInput,
  PipelineOutput,
  VideoProject,
} from "./types";

export { getTemplate, listTemplates, TEMPLATES } from "./templates";
export { parsePptx, extractSlideImages, generateNarrationScript } from "./pptx-parser";
export { generateVoiceSegments, estimateNarrationDuration } from "./ai-voice";
export { generateMusic } from "./ai-music";
export { runPipeline } from "./pipeline";
