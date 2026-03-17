import { TemplateConfig, AnimationPreset } from "./types";

// ── Cinematic Template Presets ───────────────────────────────────────────────
// Each preset defines a complete visual + audio identity for video generation.

export const TEMPLATES: Record<AnimationPreset, TemplateConfig> = {
  documentary: {
    id: "documentary",
    name: "Documentary",
    description: "Ken Burns-style with slow pans, warm tones, and authoritative narration",
    preset: "documentary",
    fps: 30,
    width: 1920,
    height: 1080,
    transitions: {
      default: "ken-burns",
      intro: "fade",
      outro: "fade",
    },
    timing: {
      introDurationSec: 4,
      outroDurationSec: 5,
      transitionDurationSec: 1.5,
      minSlideDurationSec: 5,
      paddingAfterNarrationSec: 1,
    },
    style: {
      backgroundColor: "#0a0a0a",
      textColor: "#f5f5f0",
      accentColor: "#c9a84c",
      fontFamily: "Georgia, serif",
      overlayOpacity: 0.4,
    },
    voice: {
      provider: "elevenlabs",
      voiceId: "george",
      speed: 0.95,
      model: "eleven_multilingual_v2",
    },
    music: {
      provider: "custom",
      style: "cinematic orchestral, documentary, ambient, inspiring",
      volume: 0.15,
    },
  },

  "cinematic-dark": {
    id: "cinematic-dark",
    name: "Cinematic Dark",
    description: "Dramatic reveals with deep blacks, spotlight effects, and bold typography",
    preset: "cinematic-dark",
    fps: 30,
    width: 1920,
    height: 1080,
    transitions: {
      default: "dissolve",
      intro: "cinematic-wipe",
      outro: "fade",
    },
    timing: {
      introDurationSec: 5,
      outroDurationSec: 6,
      transitionDurationSec: 1.2,
      minSlideDurationSec: 6,
      paddingAfterNarrationSec: 1.5,
    },
    style: {
      backgroundColor: "#000000",
      textColor: "#ffffff",
      accentColor: "#3b82f6",
      fontFamily: "'Inter', sans-serif",
      overlayOpacity: 0.6,
    },
    voice: {
      provider: "elevenlabs",
      voiceId: "roger",
      speed: 0.9,
      model: "eleven_multilingual_v2",
    },
    music: {
      provider: "custom",
      style: "dark cinematic, hans zimmer style, tension, dramatic orchestral",
      volume: 0.2,
    },
  },

  "modern-minimal": {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean, Apple-style presentation with smooth slide-ins and white space",
    preset: "modern-minimal",
    fps: 30,
    width: 1920,
    height: 1080,
    transitions: {
      default: "slide-left",
      intro: "zoom-in",
      outro: "fade",
    },
    timing: {
      introDurationSec: 3,
      outroDurationSec: 4,
      transitionDurationSec: 0.8,
      minSlideDurationSec: 4,
      paddingAfterNarrationSec: 0.8,
    },
    style: {
      backgroundColor: "#fafafa",
      textColor: "#1a1a1a",
      accentColor: "#2563eb",
      fontFamily: "'Inter', sans-serif",
      overlayOpacity: 0.05,
    },
    voice: {
      provider: "elevenlabs",
      voiceId: "aria",
      speed: 1.0,
      model: "eleven_multilingual_v2",
    },
    music: {
      provider: "custom",
      style: "modern ambient, corporate tech, clean minimal electronic",
      volume: 0.1,
    },
  },

  "science-journal": {
    id: "science-journal",
    name: "Science Journal",
    description: "Academic feel with paper-like backgrounds, data callouts, and clinical precision",
    preset: "science-journal",
    fps: 30,
    width: 1920,
    height: 1080,
    transitions: {
      default: "fade",
      intro: "fade",
      outro: "fade",
    },
    timing: {
      introDurationSec: 4,
      outroDurationSec: 5,
      transitionDurationSec: 1.0,
      minSlideDurationSec: 6,
      paddingAfterNarrationSec: 1.2,
    },
    style: {
      backgroundColor: "#f8f6f0",
      textColor: "#2d2d2d",
      accentColor: "#16a34a",
      fontFamily: "'Merriweather', Georgia, serif",
      overlayOpacity: 0.1,
    },
    voice: {
      provider: "elevenlabs",
      voiceId: "sarah",
      speed: 0.92,
      model: "eleven_multilingual_v2",
    },
    music: {
      provider: "custom",
      style: "ambient piano, scientific documentary, thoughtful, calm orchestral",
      volume: 0.12,
    },
  },

  "impact-story": {
    id: "impact-story",
    name: "Impact Story",
    description: "Bold, emotional storytelling with fast cuts, strong colors, and driving music",
    preset: "impact-story",
    fps: 30,
    width: 1920,
    height: 1080,
    transitions: {
      default: "cinematic-wipe",
      intro: "zoom-in",
      outro: "fade",
    },
    timing: {
      introDurationSec: 3,
      outroDurationSec: 5,
      transitionDurationSec: 0.6,
      minSlideDurationSec: 4,
      paddingAfterNarrationSec: 0.5,
    },
    style: {
      backgroundColor: "#0f172a",
      textColor: "#f1f5f9",
      accentColor: "#ef4444",
      fontFamily: "'Inter', sans-serif",
      overlayOpacity: 0.5,
    },
    voice: {
      provider: "elevenlabs",
      voiceId: "eryn",
      speed: 1.05,
      model: "eleven_multilingual_v2",
    },
    music: {
      provider: "custom",
      style: "epic cinematic, emotional, driving percussion, inspiring crescendo",
      volume: 0.25,
    },
  },
};

export function getTemplate(preset: AnimationPreset): TemplateConfig {
  return TEMPLATES[preset];
}

export function listTemplates(): Array<{ id: string; name: string; description: string }> {
  return Object.values(TEMPLATES).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}
