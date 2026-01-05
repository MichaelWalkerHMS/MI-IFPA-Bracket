import { createClient } from '@/lib/supabase/server';
import { calculateBracketScore } from './calculateScore';
import { Pick, Result, ScoringConfig } from '../types';

interface BracketWithPicks {
  id: string;
  final_winner_games: number | null;
  final_loser_games: number | null;
  picks: Pick[];
}

/**
 * Recalculate scores for all brackets in a tournament.
 * Call this after any result is saved, deleted, or cleared.
 *
 * @param tournamentId - The tournament to recalculate scores for
 * @returns Object with success status and count of updated brackets
 */
export async function recalculateScores(
  tournamentId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  const supabase = await createClient();

  // 1. Fetch tournament's scoring config
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('scoring_config')
    .eq('id', tournamentId)
    .single();

  if (tournamentError || !tournament) {
    console.error('Error fetching tournament:', tournamentError);
    return { success: false, error: 'Tournament not found' };
  }

  const scoringConfig = tournament.scoring_config as ScoringConfig;

  // 2. Fetch all results for the tournament
  const { data: results, error: resultsError } = await supabase
    .from('results')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (resultsError) {
    console.error('Error fetching results:', resultsError);
    return { success: false, error: 'Failed to fetch results' };
  }

  // 3. Fetch all brackets with their picks
  const { data: brackets, error: bracketsError } = await supabase
    .from('brackets')
    .select(`
      id,
      final_winner_games,
      final_loser_games,
      picks (*)
    `)
    .eq('tournament_id', tournamentId);

  if (bracketsError) {
    console.error('Error fetching brackets:', bracketsError);
    return { success: false, error: 'Failed to fetch brackets' };
  }

  if (!brackets || brackets.length === 0) {
    return { success: true, count: 0 };
  }

  // 4. Calculate scores for each bracket and prepare updates
  const updates: Array<{
    id: string;
    score: number;
    correct_champion: boolean | null;
    game_score_diff: number | null;
    total_correct: number;
  }> = [];

  for (const bracket of brackets as unknown as BracketWithPicks[]) {
    const scoringResult = calculateBracketScore(
      bracket.picks || [],
      results as Result[],
      scoringConfig,
      {
        winnerGames: bracket.final_winner_games,
        loserGames: bracket.final_loser_games,
      }
    );

    updates.push({
      id: bracket.id,
      score: scoringResult.score,
      correct_champion: scoringResult.correctChampion,
      game_score_diff: scoringResult.gameScoreDiff,
      total_correct: scoringResult.totalCorrect,
    });
  }

  // 5. Batch update all brackets
  // Supabase doesn't support batch updates natively, so we use Promise.all
  const updatePromises = updates.map((update) =>
    supabase
      .from('brackets')
      .update({
        score: update.score,
        correct_champion: update.correct_champion,
        game_score_diff: update.game_score_diff,
        total_correct: update.total_correct,
      })
      .eq('id', update.id)
  );

  const updateResults = await Promise.all(updatePromises);

  // Check for any errors
  const errors = updateResults.filter((r) => r.error);
  if (errors.length > 0) {
    console.error('Errors updating brackets:', errors);
    return { success: false, error: `Failed to update ${errors.length} brackets` };
  }

  return { success: true, count: updates.length };
}
