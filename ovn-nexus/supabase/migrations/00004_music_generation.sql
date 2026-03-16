-- OVN Nexus: AI Music Generation Workflow (Suno Integration)
-- Tables for music request → prompt → job → upload → review → publish pipeline

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE music_use_case AS ENUM (
  'podcast', 'research_video', 'brand_theme', 'social_media', 'background_music', 'presentation', 'other'
);

CREATE TYPE music_tempo AS ENUM ('slow', 'medium', 'fast');

CREATE TYPE music_voice_type AS ENUM ('male', 'female', 'instrumental');

CREATE TYPE music_lyrics_mode AS ENUM ('auto', 'manual', 'none');

CREATE TYPE music_job_status AS ENUM (
  'draft', 'queued', 'generating', 'generated', 'review', 'approved', 'published', 'rejected'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Music generation requests
CREATE TABLE music_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  use_case music_use_case NOT NULL DEFAULT 'background_music',
  mood TEXT NOT NULL,
  genre TEXT NOT NULL,
  tempo music_tempo NOT NULL DEFAULT 'medium',
  instrumentation TEXT,
  voice_type music_voice_type NOT NULL DEFAULT 'instrumental',
  lyrics_mode music_lyrics_mode NOT NULL DEFAULT 'none',
  lyrics_text TEXT,
  prompt_notes TEXT,
  duration_seconds INTEGER CHECK (duration_seconds > 0 AND duration_seconds <= 600),
  -- System-generated Suno prompts (up to 3)
  generated_prompts JSONB NOT NULL DEFAULT '[]',
  -- Job tracking
  status music_job_status NOT NULL DEFAULT 'draft',
  assigned_operator_id UUID REFERENCES profiles(id),
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Music versions (uploaded results from Suno)
CREATE TABLE music_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES music_requests(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  -- File references
  audio_url TEXT NOT NULL,
  audio_format TEXT NOT NULL DEFAULT 'mp3' CHECK (audio_format IN ('mp3', 'wav', 'flac', 'ogg')),
  audio_size_bytes BIGINT,
  duration_seconds NUMERIC(8,2),
  -- Optional extras
  stems_url TEXT,
  cover_image_url TEXT,
  waveform_data JSONB,
  -- Which Suno prompt was used
  prompt_used TEXT,
  suno_generation_id TEXT,
  -- Review
  is_selected BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, version_number)
);

-- Music comments (review thread)
CREATE TABLE music_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES music_requests(id) ON DELETE CASCADE,
  version_id UUID REFERENCES music_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  timestamp_seconds NUMERIC(8,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Published music (final approved tracks available for embedding)
CREATE TABLE music_published (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES music_requests(id),
  version_id UUID NOT NULL REFERENCES music_versions(id),
  title TEXT NOT NULL,
  description TEXT,
  -- Usage rights
  license_type TEXT NOT NULL DEFAULT 'internal' CHECK (license_type IN ('internal', 'creative_commons', 'commercial', 'custom')),
  -- Embedding targets
  attached_to_type TEXT CHECK (attached_to_type IN ('presentation', 'podcast', 'research_video', 'page', 'other')),
  attached_to_id UUID,
  -- Public metadata
  cover_image_url TEXT,
  genre TEXT,
  mood TEXT,
  tags TEXT[] DEFAULT '{}',
  play_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  published_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_music_requests_user ON music_requests(user_id);
CREATE INDEX idx_music_requests_status ON music_requests(status);
CREATE INDEX idx_music_requests_project ON music_requests(project_id);
CREATE INDEX idx_music_requests_created ON music_requests(created_at DESC);
CREATE INDEX idx_music_versions_request ON music_versions(request_id);
CREATE INDEX idx_music_comments_request ON music_comments(request_id);
CREATE INDEX idx_music_comments_version ON music_comments(version_id);
CREATE INDEX idx_music_published_request ON music_published(request_id);
CREATE INDEX idx_music_published_attached ON music_published(attached_to_type, attached_to_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE music_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_published ENABLE ROW LEVEL SECURITY;

-- Music requests: users can read own + admin/pi can read all
CREATE POLICY "music_requests_read" ON music_requests FOR SELECT
  USING (
    user_id = auth.uid()
    OR assigned_operator_id = auth.uid()
    OR get_user_role(auth.uid()) IN ('admin', 'pi')
  );
CREATE POLICY "music_requests_insert" ON music_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "music_requests_update" ON music_requests FOR UPDATE
  USING (
    user_id = auth.uid()
    OR assigned_operator_id = auth.uid()
    OR get_user_role(auth.uid()) IN ('admin', 'pi')
  );

-- Music versions: same access as parent request
CREATE POLICY "music_versions_read" ON music_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM music_requests mr WHERE mr.id = music_versions.request_id
      AND (mr.user_id = auth.uid() OR mr.assigned_operator_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'pi'))
    )
  );
CREATE POLICY "music_versions_insert" ON music_versions FOR INSERT
  WITH CHECK (uploaded_by = auth.uid() AND get_user_role(auth.uid()) IN ('admin', 'pi'));
CREATE POLICY "music_versions_update" ON music_versions FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR get_user_role(auth.uid()) IN ('admin', 'pi')
  );

-- Comments: authenticated users can read/write on requests they have access to
CREATE POLICY "music_comments_read" ON music_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM music_requests mr WHERE mr.id = music_comments.request_id
      AND (mr.user_id = auth.uid() OR mr.assigned_operator_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'pi'))
    )
  );
CREATE POLICY "music_comments_insert" ON music_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Published: public read, admin/pi manage
CREATE POLICY "music_published_read" ON music_published FOR SELECT USING (true);
CREATE POLICY "music_published_manage" ON music_published FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi'));
