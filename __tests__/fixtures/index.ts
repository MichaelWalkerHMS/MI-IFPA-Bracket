/**
 * Central export for all test fixtures.
 * Import from this file for cleaner imports.
 *
 * @example
 * import { mockTournament, mockPlayers, mockBracket } from '../fixtures'
 */

// Tournaments
export {
  mockTournament,
  mockLockedTournament,
  mockOpenTournament,
} from './tournaments'

// Players
export {
  createMockPlayers,
  mockPlayers,
  mockPlayerMap,
} from './players'

// Brackets
export {
  mockBracket,
  mockPrivateBracket,
  mockPicks,
  createPicksMap,
} from './brackets'

// Results
export {
  createMockResult,
  createOpeningRoundResults,
  createRoundOf16Results,
  createQuartersResults,
  createSemisResults,
  createFinalsResult,
  createConsolationResult,
  createCompleteTournamentResults,
  createPartialResults,
} from './results'
