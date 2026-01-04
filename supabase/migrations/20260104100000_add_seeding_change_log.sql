-- Migration: Add seeding_change_log table
-- Purpose: Track changes to player seeding for audit and bracket impact warnings

CREATE TABLE IF NOT EXISTS public.seeding_change_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  changed_by uuid NOT NULL REFERENCES profiles(id),
  change_type text NOT NULL CHECK (change_type IN ('reorder', 'add', 'delete', 'rename', 'bulk_import')),
  affected_seeds integer[] NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Index for querying changes by tournament
CREATE INDEX idx_seeding_change_log_tournament ON seeding_change_log(tournament_id);

-- Enable Row Level Security
ALTER TABLE seeding_change_log ENABLE ROW LEVEL SECURITY;

-- Anyone can view seeding change logs (for bracket warnings)
CREATE POLICY "Anyone can view seeding logs"
  ON seeding_change_log
  FOR SELECT
  USING (true);

-- Only admins can create seeding change logs
CREATE POLICY "Admins can create seeding logs"
  ON seeding_change_log
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Grant permissions to authenticated users
GRANT SELECT ON seeding_change_log TO authenticated;
GRANT INSERT ON seeding_change_log TO authenticated;
GRANT SELECT ON seeding_change_log TO anon;
