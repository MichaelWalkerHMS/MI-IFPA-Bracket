import { Pick, Result, ScoringConfig } from '../types';

export interface ScoringResult {
  score: number;
  correctChampion: boolean | null;
  gameScoreDiff: number | null;
  totalCorrect: number;
}

export interface BracketFinalGames {
  winnerGames: number | null;
  loserGames: number | null;
}

/**
 * Get the point value for a given round based on scoring config.
 * Round encoding: 0=opening, 1=round of 16, 2=quarters, 3=semis, 4=finals, 5=consolation
 */
function getPointsForRound(round: number, config: ScoringConfig): number {
  switch (round) {
    case 0: return config.opening;
    case 1: return config.round_of_16;
    case 2: return config.quarters;
    case 3: return config.semis;
    case 4: return config.finals;
    case 5: return config.semis; // Consolation match = same as semis
    default: return 0;
  }
}

/**
 * Calculate the score for a bracket based on picks and results.
 *
 * @param picks - The user's predictions for each match
 * @param results - The actual results entered by admin
 * @param scoringConfig - Point values for each round
 * @param bracketFinalGames - User's predicted game score for the finals
 * @returns ScoringResult with score, tiebreaker values
 */
export function calculateBracketScore(
  picks: Pick[],
  results: Result[],
  scoringConfig: ScoringConfig,
  bracketFinalGames: BracketFinalGames
): ScoringResult {
  let score = 0;
  let totalCorrect = 0;
  let correctChampion: boolean | null = null;
  let gameScoreDiff: number | null = null;

  // Create a map of results by round-position for quick lookup
  const resultMap = new Map<string, Result>();
  for (const result of results) {
    const key = `${result.round}-${result.match_position}`;
    resultMap.set(key, result);
  }

  // Calculate score for each pick
  for (const pick of picks) {
    const key = `${pick.round}-${pick.match_position}`;
    const result = resultMap.get(key);

    if (result && pick.winner_seed === result.winner_seed) {
      const points = getPointsForRound(pick.round, scoringConfig);
      score += points;
      totalCorrect++;
    }
  }

  // Check for finals result (round 4, position 0) for champion tiebreaker
  const finalsResult = resultMap.get('4-0');
  if (finalsResult) {
    // Find the user's pick for finals
    const finalsPick = picks.find(p => p.round === 4 && p.match_position === 0);
    if (finalsPick) {
      correctChampion = finalsPick.winner_seed === finalsResult.winner_seed;
    } else {
      // No finals pick = didn't predict champion correctly
      correctChampion = false;
    }

    // Calculate game score difference for tiebreaker 2
    if (bracketFinalGames.winnerGames !== null && bracketFinalGames.loserGames !== null) {
      const winnerDiff = Math.abs(bracketFinalGames.winnerGames - finalsResult.winner_games);
      const loserDiff = Math.abs(bracketFinalGames.loserGames - finalsResult.loser_games);
      gameScoreDiff = winnerDiff + loserDiff;
    }
    // If user didn't predict game scores, gameScoreDiff stays null
  }

  return {
    score,
    correctChampion,
    gameScoreDiff,
    totalCorrect,
  };
}
