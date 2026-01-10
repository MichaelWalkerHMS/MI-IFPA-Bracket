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

  // Build a map of results by key for quick lookup
  const resultMap = new Map<string, Result>();
  for (const result of results || []) {
    resultMap.set(`${result.round}-${result.match_position}`, result as Result);
  }

  // 4. Calculate scores for each bracket and prepare updates
  const bracketUpdates: Array<{
    id: string;
    score: number;
    correct_champion: boolean | null;
    game_score_diff: number | null;
    total_correct: number;
  }> = [];

  // Track pick updates: { pickId, isCorrect, actualWinnerSeed, actualLoserSeed }
  const pickUpdates: Array<{
    id: string;
    is_correct: boolean | null;
    actual_winner_seed: number | null;
    actual_loser_seed: number | null;
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

    bracketUpdates.push({
      id: bracket.id,
      score: scoringResult.score,
      correct_champion: scoringResult.correctChampion,
      game_score_diff: scoringResult.gameScoreDiff,
      total_correct: scoringResult.totalCorrect,
    });

    // Build a map of pickResults for quick lookup
    const pickResultsMap = new Map<string, boolean>();
    for (const pr of scoringResult.pickResults) {
      pickResultsMap.set(`${pr.round}-${pr.matchPosition}`, pr.isCorrect);
    }

    // Update is_correct and actual result seeds for each pick
    for (const pick of bracket.picks || []) {
      const key = `${pick.round}-${pick.match_position}`;
      const result = resultMap.get(key);
      if (result) {
        // There's a result for this match - update all cached fields
        const isCorrect = pickResultsMap.get(key) ?? false;
        pickUpdates.push({
          id: pick.id,
          is_correct: isCorrect,
          actual_winner_seed: result.winner_seed,
          actual_loser_seed: result.loser_seed,
        });
      } else if (pick.is_correct !== null || pick.actual_winner_seed !== null) {
        // Result was deleted, reset all cached fields to null
        pickUpdates.push({
          id: pick.id,
          is_correct: null,
          actual_winner_seed: null,
          actual_loser_seed: null,
        });
      }
    }
  }

  // 5. Batch update all brackets
  // Supabase doesn't support batch updates natively, so we use Promise.all
  const bracketPromises = bracketUpdates.map((update) =>
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

  // 6. Batch update all picks with is_correct and actual result seeds
  const pickPromises = pickUpdates.map((update) =>
    supabase
      .from('picks')
      .update({
        is_correct: update.is_correct,
        actual_winner_seed: update.actual_winner_seed,
        actual_loser_seed: update.actual_loser_seed,
      })
      .eq('id', update.id)
  );

  const allResults = await Promise.all([...bracketPromises, ...pickPromises]);

  // Check for any errors
  const errors = allResults.filter((r) => r.error);
  if (errors.length > 0) {
    console.error('Errors updating records:', errors);
    return { success: false, error: `Failed to update ${errors.length} records` };
  }

  return { success: true, count: bracketUpdates.length };
}
