import type { Player } from '@/lib/types'

// Generate 24 test players for a tournament
export function createMockPlayers(tournamentId: string = 'test-tournament-1'): Player[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `player-${i + 1}`,
    tournament_id: tournamentId,
    name: `Player ${i + 1}`,
    seed: i + 1,
    ifpa_id: 10000 + i,
    matchplay_id: null,
    created_at: '2026-01-01T00:00:00Z',
  }))
}

// Pre-generated players for quick access
export const mockPlayers = createMockPlayers()

// Player map for component testing (seed -> Player)
export const mockPlayerMap = new Map(
  mockPlayers.map((player) => [player.seed, player])
)
