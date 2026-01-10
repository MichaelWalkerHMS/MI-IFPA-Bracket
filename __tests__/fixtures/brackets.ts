import type { Bracket, Pick } from '@/lib/types'

export const mockBracket: Bracket = {
  id: 'test-bracket-1',
  user_id: 'test-user-id',
  tournament_id: 'test-tournament-1',
  name: 'My Test Bracket',
  is_public: true,
  final_winner_games: null,
  final_loser_games: null,
  score: 0,
  correct_champion: null,
  game_score_diff: null,
  total_correct: 0,
  created_at: '2026-01-04T00:00:00Z',
  updated_at: '2026-01-04T00:00:00Z',
}

export const mockPrivateBracket: Bracket = {
  ...mockBracket,
  id: 'test-bracket-private',
  name: 'Private Bracket',
  is_public: false,
}

// Sample picks for a partially completed bracket
export const mockPicks: Pick[] = [
  // Opening round picks (seeds 9-24 compete, lower seed often wins)
  { id: 'pick-1', bracket_id: 'test-bracket-1', round: 0, match_position: 0, winner_seed: 9, is_correct: null, created_at: '2026-01-04T00:00:00Z' },
  { id: 'pick-2', bracket_id: 'test-bracket-1', round: 0, match_position: 1, winner_seed: 10, is_correct: null, created_at: '2026-01-04T00:00:00Z' },
  { id: 'pick-3', bracket_id: 'test-bracket-1', round: 0, match_position: 7, winner_seed: 16, is_correct: null, created_at: '2026-01-04T00:00:00Z' },
]

// Helper to create a picks Map from Pick array
export function createPicksMap(picks: Pick[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const pick of picks) {
    map.set(`${pick.round}-${pick.match_position}`, pick.winner_seed)
  }
  return map
}
