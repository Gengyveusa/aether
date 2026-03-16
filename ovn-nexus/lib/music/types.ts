// ── Music Generation Types ──────────────────────────────────

export type MusicUseCase =
  | "podcast"
  | "research_video"
  | "brand_theme"
  | "social_media"
  | "background_music"
  | "presentation"
  | "other";

export type MusicTempo = "slow" | "medium" | "fast";

export type MusicVoiceType = "male" | "female" | "instrumental";

export type MusicLyricsMode = "auto" | "manual" | "none";

export type MusicJobStatus =
  | "draft"
  | "queued"
  | "generating"
  | "generated"
  | "review"
  | "approved"
  | "published"
  | "rejected";

export interface MusicRequest {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  use_case: MusicUseCase;
  mood: string;
  genre: string;
  tempo: MusicTempo;
  instrumentation: string | null;
  voice_type: MusicVoiceType;
  lyrics_mode: MusicLyricsMode;
  lyrics_text: string | null;
  prompt_notes: string | null;
  duration_seconds: number | null;
  generated_prompts: SunoPrompt[];
  status: MusicJobStatus;
  assigned_operator_id: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SunoPrompt {
  id: number;
  prompt: string;
  style_tags: string[];
  description: string;
}

export interface MusicVersion {
  id: string;
  request_id: string;
  version_number: number;
  audio_url: string;
  audio_format: string;
  audio_size_bytes: number | null;
  duration_seconds: number | null;
  stems_url: string | null;
  cover_image_url: string | null;
  waveform_data: number[] | null;
  prompt_used: string | null;
  suno_generation_id: string | null;
  is_selected: boolean;
  rating: number | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface MusicComment {
  id: string;
  request_id: string;
  version_id: string | null;
  user_id: string;
  content: string;
  timestamp_seconds: number | null;
  created_at: string;
}

export interface MusicPublished {
  id: string;
  request_id: string;
  version_id: string;
  title: string;
  description: string | null;
  license_type: "internal" | "creative_commons" | "commercial" | "custom";
  attached_to_type: string | null;
  attached_to_id: string | null;
  cover_image_url: string | null;
  genre: string | null;
  mood: string | null;
  tags: string[];
  play_count: number;
  download_count: number;
  published_by: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

// ── Form / Input Types ──────────────────────────────────────

export interface MusicRequestInput {
  title: string;
  project_id?: string;
  use_case: MusicUseCase;
  mood: string;
  genre: string;
  tempo: MusicTempo;
  instrumentation?: string;
  voice_type: MusicVoiceType;
  lyrics_mode: MusicLyricsMode;
  lyrics_text?: string;
  prompt_notes?: string;
  duration_seconds?: number;
  tags?: string[];
}
