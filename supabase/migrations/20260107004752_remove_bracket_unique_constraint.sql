-- Remove the unique constraint on (user_id, tournament_id) to allow multiple brackets per user per tournament
ALTER TABLE brackets DROP CONSTRAINT IF EXISTS brackets_user_id_tournament_id_key;
