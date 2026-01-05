-- Add scoring columns to brackets table for cached leaderboard scores
-- These columns store calculated scores that are updated when results change

ALTER TABLE brackets
ADD COLUMN score integer DEFAULT 0,
ADD COLUMN correct_champion boolean,
ADD COLUMN game_score_diff integer,
ADD COLUMN total_correct integer DEFAULT 0;

-- Add comment explaining the columns
COMMENT ON COLUMN brackets.score IS 'Total points earned from correct predictions';
COMMENT ON COLUMN brackets.correct_champion IS 'Whether user correctly predicted the finals winner (tiebreaker 1)';
COMMENT ON COLUMN brackets.game_score_diff IS 'Sum of |predicted - actual| for final game scores (tiebreaker 2, lower is better)';
COMMENT ON COLUMN brackets.total_correct IS 'Count of correct predictions (tiebreaker 3)';
