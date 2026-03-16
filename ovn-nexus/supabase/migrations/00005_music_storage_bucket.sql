-- Create storage bucket for music uploads (audio files, cover images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music-uploads',
  'music-uploads',
  true,
  104857600, -- 100 MB max file size
  ARRAY['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/x-wav',
        'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload, public can read
CREATE POLICY "music_uploads_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'music-uploads');

CREATE POLICY "music_uploads_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'music-uploads'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "music_uploads_auth_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'music-uploads'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "music_uploads_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'music-uploads'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
