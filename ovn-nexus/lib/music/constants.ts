// ── Music Generation Constants ──────────────────────────────

export const MOODS = [
  "Uplifting",
  "Calm",
  "Dramatic",
  "Melancholic",
  "Energetic",
  "Mysterious",
  "Hopeful",
  "Dark",
  "Playful",
  "Inspirational",
  "Tense",
  "Relaxed",
  "Epic",
  "Nostalgic",
  "Futuristic",
] as const;

export const GENRES = [
  "Ambient",
  "Cinematic Orchestral",
  "Electronic",
  "Lo-Fi",
  "Hip Hop",
  "Jazz",
  "Classical",
  "Pop",
  "Rock",
  "R&B / Soul",
  "Folk / Acoustic",
  "EDM",
  "World Music",
  "Synthwave",
  "Chillhop",
  "Neoclassical",
  "Downtempo",
  "Corporate",
] as const;

export const INSTRUMENTATIONS = [
  "Piano",
  "Strings",
  "Guitar (acoustic)",
  "Guitar (electric)",
  "Synthesizer",
  "Orchestra",
  "Brass",
  "Woodwinds",
  "Percussion",
  "Bass",
  "Harp",
  "Choir",
  "Bells / Chimes",
  "Marimba",
  "Drums",
] as const;

export const USE_CASE_LABELS: Record<string, string> = {
  podcast: "Podcast",
  research_video: "Research Video",
  brand_theme: "Brand Theme",
  social_media: "Social Media",
  background_music: "Background Music",
  presentation: "Presentation",
  other: "Other",
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  draft: {
    label: "Draft",
    color: "bg-gray-100 text-gray-700",
    description: "Request saved but not submitted",
  },
  queued: {
    label: "Queued",
    color: "bg-blue-100 text-blue-700",
    description: "Waiting for operator to generate in Suno",
  },
  generating: {
    label: "Generating",
    color: "bg-yellow-100 text-yellow-700",
    description: "Operator is generating tracks in Suno",
  },
  generated: {
    label: "Generated",
    color: "bg-purple-100 text-purple-700",
    description: "Audio files uploaded, ready for review",
  },
  review: {
    label: "In Review",
    color: "bg-orange-100 text-orange-700",
    description: "User is reviewing generated tracks",
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700",
    description: "Track approved, ready to publish",
  },
  published: {
    label: "Published",
    color: "bg-emerald-100 text-emerald-700",
    description: "Track published and available",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
    description: "Track rejected, needs regeneration",
  },
};

export const SUNO_CREATE_URL = "https://suno.com/create";
