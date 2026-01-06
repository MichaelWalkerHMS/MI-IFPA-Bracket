-- Add is_correct column to picks table for cached match scoring
-- This field is updated by recalculateScores() when results change
ALTER TABLE picks ADD COLUMN is_correct boolean;

COMMENT ON COLUMN picks.is_correct IS 'Cached: whether pick matches result (null = no result yet)';
