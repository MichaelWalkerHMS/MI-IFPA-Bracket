/**
 * Compute actual participants for each match based on tournament results.
 * Used for display: shows who actually made it to each match (cascading from feeder rounds).
 */

import { Result } from '../types';
import {
  ROUNDS,
  MATCHES_PER_ROUND,
  OPENING_ROUND_MATCHES,
  ROUND_OF_16_MATCHES,
  ROUND_OF_16_MATCHES_16P,
  QUARTERS_MATCHES,
  SEMIS_MATCHES,
  FINALS_MATCH,
  CONSOLATION_MATCH,
  getPickKey,
} from './constants';

export interface ActualParticipants {
  actualTop: number | null;
  actualBottom: number | null;
}

export interface MatchResult {
  winnerSeed: number;
  loserSeed: number;
}

/**
 * Build a lookup map of results by match key.
 */
export function buildResultMap(results: Result[]): Map<string, Result> {
  const map = new Map<string, Result>();
  for (const result of results) {
    map.set(getPickKey(result.round, result.match_position), result);
  }
  return map;
}

/**
 * Get the actual winner from a feeder match, if result exists.
 */
function getActualWinner(resultMap: Map<string, Result>, round: number, position: number): number | null {
  const result = resultMap.get(getPickKey(round, position));
  return result?.winner_seed ?? null;
}

/**
 * Get the actual loser from a feeder match, if result exists.
 */
function getActualLoser(resultMap: Map<string, Result>, round: number, position: number): number | null {
  const result = resultMap.get(getPickKey(round, position));
  return result?.loser_seed ?? null;
}

/**
 * Compute actual participants for a single match based on results from feeder matches.
 * Returns { actualTop, actualBottom } where null means TBD (no result yet in feeder).
 */
export function getActualMatchParticipants(
  resultMap: Map<string, Result>,
  round: number,
  position: number,
  playerCount: 16 | 24 = 24
): ActualParticipants {
  switch (round) {
    case ROUNDS.OPENING: {
      // Opening round participants are always fixed seeds
      if (playerCount === 16) {
        return { actualTop: null, actualBottom: null };
      }
      const match = OPENING_ROUND_MATCHES[position];
      return { actualTop: match.topSeed, actualBottom: match.bottomSeed };
    }

    case ROUNDS.ROUND_OF_16: {
      if (playerCount === 16) {
        // 16-player: direct seed pairings
        const match = ROUND_OF_16_MATCHES_16P[position];
        return { actualTop: match.topSeed, actualBottom: match.bottomSeed };
      }
      // 24-player: bye seed + opening round actual winner
      const match = ROUND_OF_16_MATCHES[position];
      const openingWinner = getActualWinner(resultMap, ROUNDS.OPENING, match.openingWinnerPosition);
      return { actualTop: match.byeSeed, actualBottom: openingWinner };
    }

    case ROUNDS.QUARTERS: {
      const match = QUARTERS_MATCHES[position];
      const topWinner = getActualWinner(resultMap, ROUNDS.ROUND_OF_16, match.topSourcePosition);
      const bottomWinner = getActualWinner(resultMap, ROUNDS.ROUND_OF_16, match.bottomSourcePosition);
      return { actualTop: topWinner, actualBottom: bottomWinner };
    }

    case ROUNDS.SEMIS: {
      const match = SEMIS_MATCHES[position];
      const topWinner = getActualWinner(resultMap, ROUNDS.QUARTERS, match.topSourcePosition);
      const bottomWinner = getActualWinner(resultMap, ROUNDS.QUARTERS, match.bottomSourcePosition);
      return { actualTop: topWinner, actualBottom: bottomWinner };
    }

    case ROUNDS.FINALS: {
      const topWinner = getActualWinner(resultMap, ROUNDS.SEMIS, FINALS_MATCH.topSourcePosition);
      const bottomWinner = getActualWinner(resultMap, ROUNDS.SEMIS, FINALS_MATCH.bottomSourcePosition);
      return { actualTop: topWinner, actualBottom: bottomWinner };
    }

    case ROUNDS.CONSOLATION: {
      // Consolation participants are losers of semifinals
      const topLoser = getActualLoser(resultMap, ROUNDS.SEMIS, CONSOLATION_MATCH.topSourcePosition);
      const bottomLoser = getActualLoser(resultMap, ROUNDS.SEMIS, CONSOLATION_MATCH.bottomSourcePosition);
      return { actualTop: topLoser, actualBottom: bottomLoser };
    }

    default:
      return { actualTop: null, actualBottom: null };
  }
}

/**
 * Compute actual participants for all matches in the tournament.
 * Returns a Map keyed by "round-position" with { actualTop, actualBottom }.
 */
export function computeAllActualParticipants(
  results: Result[],
  playerCount: 16 | 24 = 24
): Map<string, ActualParticipants> {
  const resultMap = buildResultMap(results);
  const participantsMap = new Map<string, ActualParticipants>();

  // Determine which rounds to process based on player count
  const startRound = playerCount === 16 ? ROUNDS.ROUND_OF_16 : ROUNDS.OPENING;

  for (let round = startRound; round <= ROUNDS.CONSOLATION; round++) {
    const matchCount = MATCHES_PER_ROUND[round];
    for (let position = 0; position < matchCount; position++) {
      const key = getPickKey(round, position);
      participantsMap.set(key, getActualMatchParticipants(resultMap, round, position, playerCount));
    }
  }

  return participantsMap;
}

/**
 * Get result info for a specific match.
 * Returns { winnerSeed, loserSeed } if result exists, null otherwise.
 */
export function getMatchResultInfo(
  resultMap: Map<string, Result>,
  round: number,
  position: number
): MatchResult | null {
  const result = resultMap.get(getPickKey(round, position));
  if (!result) return null;
  return {
    winnerSeed: result.winner_seed,
    loserSeed: result.loser_seed,
  };
}
