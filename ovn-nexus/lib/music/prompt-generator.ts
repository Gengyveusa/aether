import type { MusicRequestInput, SunoPrompt } from "./types";

// ── Suno Prompt Generator ───────────────────────────────────
// Generates 3 optimized Suno-ready prompts from a music request

const TEMPO_MAP: Record<string, string> = {
  slow: "60-80 BPM, slow and deliberate",
  medium: "90-120 BPM, moderate pace",
  fast: "130-160 BPM, energetic and driving",
};

const USE_CASE_HINTS: Record<string, string> = {
  podcast: "suitable for podcast intro/outro, clean mix with space for voice",
  research_video: "cinematic underscore, professional and authoritative",
  brand_theme: "memorable melodic hook, brand-identity sound",
  social_media: "catchy, attention-grabbing, punchy and modern",
  background_music: "ambient and non-intrusive, loopable",
  presentation: "professional, building momentum, corporate-suitable",
  other: "",
};

const VOICE_HINTS: Record<string, string> = {
  male: "male vocals",
  female: "female vocals",
  instrumental: "instrumental only, no vocals",
};

/**
 * Generate 3 distinct Suno-ready prompts from a music request.
 * Each prompt takes a different creative angle while honoring the user's parameters.
 */
export function generateSunoPrompts(input: MusicRequestInput): SunoPrompt[] {
  const base = buildBaseDescription(input);
  const styleTags = buildStyleTags(input);

  return [
    {
      id: 1,
      prompt: buildPromptVariant(input, base, "faithful"),
      style_tags: styleTags,
      description: "Faithful interpretation — closely matches your request parameters",
    },
    {
      id: 2,
      prompt: buildPromptVariant(input, base, "cinematic"),
      style_tags: [...styleTags, "cinematic", "layered"],
      description: "Cinematic variant — adds dramatic, film-score-inspired elements",
    },
    {
      id: 3,
      prompt: buildPromptVariant(input, base, "minimal"),
      style_tags: [...styleTags, "minimal", "clean"],
      description: "Minimal variant — stripped-down, focused arrangement",
    },
  ];
}

function buildBaseDescription(input: MusicRequestInput): string {
  const parts: string[] = [];

  parts.push(input.genre);
  parts.push(`${input.mood} mood`);
  parts.push(TEMPO_MAP[input.tempo] || "moderate tempo");
  parts.push(VOICE_HINTS[input.voice_type]);

  if (input.instrumentation) {
    parts.push(`featuring ${input.instrumentation}`);
  }

  const useCaseHint = USE_CASE_HINTS[input.use_case];
  if (useCaseHint) {
    parts.push(useCaseHint);
  }

  if (input.duration_seconds) {
    const mins = Math.floor(input.duration_seconds / 60);
    const secs = input.duration_seconds % 60;
    const dur = mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
    parts.push(`duration approximately ${dur}`);
  }

  return parts.filter(Boolean).join(", ");
}

function buildStyleTags(input: MusicRequestInput): string[] {
  const tags: string[] = [input.genre, input.mood];
  if (input.voice_type === "instrumental") tags.push("instrumental");
  if (input.tempo === "slow") tags.push("ambient");
  if (input.tempo === "fast") tags.push("energetic");
  return tags;
}

function buildPromptVariant(
  input: MusicRequestInput,
  base: string,
  variant: "faithful" | "cinematic" | "minimal"
): string {
  const userNotes = input.prompt_notes ? `. ${input.prompt_notes}` : "";

  switch (variant) {
    case "faithful":
      return `${base}${userNotes}`;

    case "cinematic":
      return `Cinematic ${input.genre}, ${input.mood} atmosphere, ${TEMPO_MAP[input.tempo]}, `
        + `${VOICE_HINTS[input.voice_type]}, orchestral layers, dramatic build, `
        + `${input.instrumentation ? `featuring ${input.instrumentation}, ` : ""}`
        + `film score quality, professional production`
        + `${userNotes}`;

    case "minimal":
      return `Minimal ${input.genre}, ${input.mood} feel, ${TEMPO_MAP[input.tempo]}, `
        + `${VOICE_HINTS[input.voice_type]}, sparse arrangement, clean production, `
        + `${input.instrumentation ? `${input.instrumentation} focus, ` : ""}`
        + `space and clarity`
        + `${userNotes}`;
  }
}

/**
 * Format a prompt for clipboard copy (operator workflow).
 */
export function formatPromptForClipboard(prompt: SunoPrompt): string {
  return [
    prompt.prompt,
    "",
    `Style: ${prompt.style_tags.join(", ")}`,
  ].join("\n");
}
