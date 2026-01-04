import type { Tournament } from '@/lib/types'

export const mockTournament: Tournament = {
  id: 'test-tournament-1',
  name: 'Test Tournament 2026',
  state: 'MI',
  year: 2026,
  lock_date: '2026-01-15T12:00:00Z',
  start_date: '2026-01-17T09:00:00Z',
  end_date: '2026-01-17T18:00:00Z',
  player_count: 24,
  status: 'upcoming',
  is_active: true,
  timezone: 'America/Detroit',
  scoring_config: {
    opening: 1,
    round_of_16: 2,
    quarters: 3,
    semis: 4,
    finals: 5,
  },
  matchplay_id: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Tournament that is locked (lock_date in the past)
export const mockLockedTournament: Tournament = {
  ...mockTournament,
  id: 'test-tournament-locked',
  name: 'Locked Tournament',
  lock_date: '2020-01-01T00:00:00Z',
}

// Tournament that is still open (lock_date in the future)
export const mockOpenTournament: Tournament = {
  ...mockTournament,
  id: 'test-tournament-open',
  name: 'Open Tournament',
  lock_date: '2030-01-01T00:00:00Z',
}
