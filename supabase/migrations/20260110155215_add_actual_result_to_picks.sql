-- Add actual result columns to picks table for display purposes
-- These are populated by recalculateScores() when admin enters results

ALTER TABLE picks
ADD COLUMN actual_winner_seed integer,
ADD COLUMN actual_loser_seed integer;

-- Add comment explaining purpose
COMMENT ON COLUMN picks.actual_winner_seed IS 'Cached: actual winner seed from result (null if no result yet)';
COMMENT ON COLUMN picks.actual_loser_seed IS 'Cached: actual loser seed from result (null if no result yet)';
