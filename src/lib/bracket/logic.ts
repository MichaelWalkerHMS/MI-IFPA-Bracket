/**
 * Pure bracket logic functions extracted for testability.
 * These functions take a picks Map as input rather than using React state.
 */

import {
  ROUNDS,
  MATCHES_PER_ROUND,
  OPENING_ROUND_MATCHES,
  ROUND_OF_16_MATCHES,
  QUARTERS_MATCHES,
  SEMIS_MATCHES,
  FINALS_MATCH,
  CONSOLATION_MATCH,
  getPickKey,
} from './constants';

/**
 * Get the winner of a specific match from the picks Map.
 */
export function getMatchWinner(
  picks: Map<string, number>,
  round: number,
  position: number
): number | null {
  return picks.get(getPickKey(round, position)) ?? null;
}

/**
 * Get the two participants for a match based on round and position.
 * For rounds after Opening, this looks up winners from previous rounds.
 */
export function getMatchParticipants(
  picks: Map<string, number>,
  round: number,
  position: number
): { topSeed: number | null; bottomSeed: number | null } {
  switch (round) {
    case ROUNDS.OPENING: {
      const match = OPENING_ROUND_MATCHES[position];
      return { topSeed: match.topSeed, bottomSeed: match.bottomSeed };
    }

    case ROUNDS.ROUND_OF_16: {
      const match = ROUND_OF_16_MATCHES[position];
      const openingWinner = getMatchWinner(
        picks,
        ROUNDS.OPENING,
        match.openingWinnerPosition
      );
      return { topSeed: match.byeSeed, bottomSeed: openingWinner };
    }

    case ROUNDS.QUARTERS: {
      const match = QUARTERS_MATCHES[position];
      const topWinner = getMatchWinner(
        picks,
        ROUNDS.ROUND_OF_16,
        match.topSourcePosition
      );
      const bottomWinner = getMatchWinner(
        picks,
        ROUNDS.ROUND_OF_16,
        match.bottomSourcePosition
      );
      return { topSeed: topWinner, bottomSeed: bottomWinner };
    }

    case ROUNDS.SEMIS: {
      const match = SEMIS_MATCHES[position];
      const topWinner = getMatchWinner(
        picks,
        ROUNDS.QUARTERS,
        match.topSourcePosition
      );
      const bottomWinner = getMatchWinner(
        picks,
        ROUNDS.QUARTERS,
        match.bottomSourcePosition
      );
      return { topSeed: topWinner, bottomSeed: bottomWinner };
    }

    case ROUNDS.FINALS: {
      const topWinner = getMatchWinner(
        picks,
        ROUNDS.SEMIS,
        FINALS_MATCH.topSourcePosition
      );
      const bottomWinner = getMatchWinner(
        picks,
        ROUNDS.SEMIS,
        FINALS_MATCH.bottomSourcePosition
      );
      return { topSeed: topWinner, bottomSeed: bottomWinner };
    }

    case ROUNDS.CONSOLATION: {
      const topLoser = getMatchLoser(
        picks,
        ROUNDS.SEMIS,
        CONSOLATION_MATCH.topSourcePosition
      );
      const bottomLoser = getMatchLoser(
        picks,
        ROUNDS.SEMIS,
        CONSOLATION_MATCH.bottomSourcePosition
      );
      return { topSeed: topLoser, bottomSeed: bottomLoser };
    }

    default:
      return { topSeed: null, bottomSeed: null };
  }
}

/**
 * Get the loser of a specific match (for consolation bracket).
 * Returns the participant who didn't win.
 */
export function getMatchLoser(
  picks: Map<string, number>,
  round: number,
  position: number
): number | null {
  const winner = getMatchWinner(picks, round, position);
  if (winner === null) return null;

  // Find who was in that match
  const participants = getMatchParticipants(picks, round, position);
  if (participants.topSeed === winner) return participants.bottomSeed;
  if (participants.bottomSeed === winner) return participants.topSeed;
  return null;
}

/**
 * Clear downstream picks that contain a specific seed.
 * Used when a pick is toggled off or changed.
 * Returns a new Map with the downstream picks removed.
 */
export function clearDownstreamPicks(
  picks: Map<string, number>,
  fromRound: number,
  seedToClear: number
): Map<string, number> {
  const newPicks = new Map(picks);

  for (let r = fromRound + 1; r <= ROUNDS.CONSOLATION; r++) {
    for (let p = 0; p < MATCHES_PER_ROUND[r]; p++) {
      const key = getPickKey(r, p);
      if (newPicks.get(key) === seedToClear) {
        newPicks.delete(key);
      }
    }
  }

  return newPicks;
}

/**
 * Apply a pick and handle cascade clearing.
 * If clicking the current winner, deselect them.
 * If selecting a new winner, clear old winner from downstream.
 * Returns the new picks Map.
 */
export function applyPick(
  picks: Map<string, number>,
  round: number,
  position: number,
  winnerSeed: number
): Map<string, number> {
  const key = getPickKey(round, position);
  const oldWinner = picks.get(key);

  let newPicks = new Map(picks);

  // If clicking the current winner, deselect them (toggle off)
  if (oldWinner === winnerSeed) {
    newPicks.delete(key);
    // Clear downstream picks that contained this winner
    newPicks = clearDownstreamPicks(newPicks, round, winnerSeed);
  } else {
    // Selecting a new winner
    newPicks.set(key, winnerSeed);

    // Clear downstream picks that contained the old winner
    if (oldWinner !== undefined) {
      newPicks = clearDownstreamPicks(newPicks, round, oldWinner);
    }
  }

  return newPicks;
}
