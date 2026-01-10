import type { Result } from '@/lib/types';
import { ROUNDS } from '@/lib/bracket/constants';

/**
 * Create a mock result
 */
export function createMockResult(
  overrides: Partial<Result> & { tournament_id: string; round: number; match_position: number; winner_seed: number; loser_seed: number }
): Result {
  return {
    id: `result-${overrides.round}-${overrides.match_position}`,
    winner_games: 4,
    loser_games: 2,
    created_at: '2026-01-15T12:00:00Z',
    updated_at: '2026-01-15T12:00:00Z',
    ...overrides,
  };
}

/**
 * Create mock results for a complete opening round
 * Returns results where higher seed always wins
 */
export function createOpeningRoundResults(tournamentId: string): Result[] {
  // Opening round: 9v24, 10v23, 11v22, 12v21, 13v20, 14v19, 15v18, 16v17
  // Higher seed (lower number) wins
  const matches = [
    { position: 0, winner: 9, loser: 24 },
    { position: 1, winner: 10, loser: 23 },
    { position: 2, winner: 11, loser: 22 },
    { position: 3, winner: 12, loser: 21 },
    { position: 4, winner: 13, loser: 20 },
    { position: 5, winner: 14, loser: 19 },
    { position: 6, winner: 15, loser: 18 },
    { position: 7, winner: 16, loser: 17 },
  ];

  return matches.map((m) =>
    createMockResult({
      tournament_id: tournamentId,
      round: ROUNDS.OPENING,
      match_position: m.position,
      winner_seed: m.winner,
      loser_seed: m.loser,
    })
  );
}

/**
 * Create mock results for round of 16
 * Assumes opening round is complete with higher seeds winning
 */
export function createRoundOf16Results(tournamentId: string): Result[] {
  // R16: bye seeds vs opening winners
  // Position 0: 1 vs winner of 16/17 (16) -> 1 wins
  // Position 1: 8 vs winner of 9/24 (9) -> 8 wins
  // etc.
  const matches = [
    { position: 0, winner: 1, loser: 16 },
    { position: 1, winner: 8, loser: 9 },
    { position: 2, winner: 4, loser: 13 },
    { position: 3, winner: 5, loser: 12 },
    { position: 4, winner: 2, loser: 15 },
    { position: 5, winner: 7, loser: 10 },
    { position: 6, winner: 3, loser: 14 },
    { position: 7, winner: 6, loser: 11 },
  ];

  return matches.map((m) =>
    createMockResult({
      tournament_id: tournamentId,
      round: ROUNDS.ROUND_OF_16,
      match_position: m.position,
      winner_seed: m.winner,
      loser_seed: m.loser,
    })
  );
}

/**
 * Create mock results for quarterfinals
 */
export function createQuartersResults(tournamentId: string): Result[] {
  // QF from R16 results above
  const matches = [
    { position: 0, winner: 1, loser: 8 },
    { position: 1, winner: 4, loser: 5 },
    { position: 2, winner: 2, loser: 7 },
    { position: 3, winner: 3, loser: 6 },
  ];

  return matches.map((m) =>
    createMockResult({
      tournament_id: tournamentId,
      round: ROUNDS.QUARTERS,
      match_position: m.position,
      winner_seed: m.winner,
      loser_seed: m.loser,
    })
  );
}

/**
 * Create mock results for semifinals
 */
export function createSemisResults(tournamentId: string): Result[] {
  const matches = [
    { position: 0, winner: 1, loser: 4 },
    { position: 1, winner: 2, loser: 3 },
  ];

  return matches.map((m) =>
    createMockResult({
      tournament_id: tournamentId,
      round: ROUNDS.SEMIS,
      match_position: m.position,
      winner_seed: m.winner,
      loser_seed: m.loser,
    })
  );
}

/**
 * Create mock results for finals
 */
export function createFinalsResult(tournamentId: string): Result {
  return createMockResult({
    tournament_id: tournamentId,
    round: ROUNDS.FINALS,
    match_position: 0,
    winner_seed: 1,
    loser_seed: 2,
    winner_games: 4,
    loser_games: 3,
  });
}

/**
 * Create mock results for consolation (3rd place)
 */
export function createConsolationResult(tournamentId: string): Result {
  return createMockResult({
    tournament_id: tournamentId,
    round: ROUNDS.CONSOLATION,
    match_position: 0,
    winner_seed: 3,
    loser_seed: 4,
  });
}

/**
 * Create a complete set of tournament results
 */
export function createCompleteTournamentResults(tournamentId: string): Result[] {
  return [
    ...createOpeningRoundResults(tournamentId),
    ...createRoundOf16Results(tournamentId),
    ...createQuartersResults(tournamentId),
    ...createSemisResults(tournamentId),
    createFinalsResult(tournamentId),
    createConsolationResult(tournamentId),
  ];
}

/**
 * Create partial results (through a specific round)
 */
export function createPartialResults(
  tournamentId: string,
  throughRound: number
): Result[] {
  const results: Result[] = [];

  if (throughRound >= ROUNDS.OPENING) {
    results.push(...createOpeningRoundResults(tournamentId));
  }
  if (throughRound >= ROUNDS.ROUND_OF_16) {
    results.push(...createRoundOf16Results(tournamentId));
  }
  if (throughRound >= ROUNDS.QUARTERS) {
    results.push(...createQuartersResults(tournamentId));
  }
  if (throughRound >= ROUNDS.SEMIS) {
    results.push(...createSemisResults(tournamentId));
  }
  if (throughRound >= ROUNDS.FINALS) {
    results.push(createFinalsResult(tournamentId));
  }
  if (throughRound >= ROUNDS.CONSOLATION) {
    results.push(createConsolationResult(tournamentId));
  }

  return results;
}
