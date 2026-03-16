import { z } from "zod";

export const musicRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  project_id: z.string().uuid().optional(),
  use_case: z.enum([
    "podcast", "research_video", "brand_theme", "social_media",
    "background_music", "presentation", "other",
  ]),
  mood: z.string().min(1, "Mood is required").max(100),
  genre: z.string().min(1, "Genre is required").max(100),
  tempo: z.enum(["slow", "medium", "fast"]),
  instrumentation: z.string().max(500).optional(),
  voice_type: z.enum(["male", "female", "instrumental"]),
  lyrics_mode: z.enum(["auto", "manual", "none"]),
  lyrics_text: z.string().max(5000).optional(),
  prompt_notes: z.string().max(1000).optional(),
  duration_seconds: z.number().int().min(10).max(600).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const musicVersionUploadSchema = z.object({
  request_id: z.string().uuid(),
  prompt_used: z.string().optional(),
  suno_generation_id: z.string().optional(),
});

export const musicCommentSchema = z.object({
  request_id: z.string().uuid(),
  version_id: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
  timestamp_seconds: z.number().min(0).optional(),
});

export const musicStatusUpdateSchema = z.object({
  status: z.enum([
    "draft", "queued", "generating", "generated", "review",
    "approved", "published", "rejected",
  ]),
});

export const musicReviewSchema = z.object({
  version_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5).optional(),
  review_notes: z.string().max(2000).optional(),
  is_selected: z.boolean().optional(),
});
