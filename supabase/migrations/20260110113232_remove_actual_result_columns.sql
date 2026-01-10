-- Remove redundant tournament-wide columns from picks table
-- This data should be fetched from results table at display time
-- The actual winner/loser is the same for all brackets, so storing it per-pick is redundant

ALTER TABLE picks
DROP COLUMN IF EXISTS actual_winner_seed,
DROP COLUMN IF EXISTS actual_loser_seed;
