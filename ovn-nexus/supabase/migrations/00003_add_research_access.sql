-- Migration: Add research access gating
-- Adds research_access flag to profiles and a research_access_keys table for admin key management

-- Add research_access column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS research_access BOOLEAN NOT NULL DEFAULT false;

-- Create research access keys table
CREATE TABLE IF NOT EXISTS research_access_keys (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT        UNIQUE NOT NULL,
  created_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  used_by     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active   BOOLEAN     NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE research_access_keys ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admin full access to research keys"
  ON research_access_keys
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Any authenticated user can read active keys (needed to validate during redemption)
CREATE POLICY "Users can read active keys"
  ON research_access_keys
  FOR SELECT
  USING (is_active = true AND used_by IS NULL);

-- Users can update a key to mark it used (needed for redemption)
CREATE POLICY "Users can redeem keys"
  ON research_access_keys
  FOR UPDATE
  USING (is_active = true AND used_by IS NULL)
  WITH CHECK (used_by = auth.uid());
