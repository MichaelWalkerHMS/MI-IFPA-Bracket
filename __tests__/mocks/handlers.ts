import { http, HttpResponse } from 'msw'

// Base URL for Supabase REST API (dev environment)
const SUPABASE_URL = 'https://nsmositomvtlhxkghchr.supabase.co'

export const handlers = [
  // Tournaments
  http.get(`${SUPABASE_URL}/rest/v1/tournaments*`, () => {
    return HttpResponse.json([
      {
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
      },
    ])
  }),

  // Players
  http.get(`${SUPABASE_URL}/rest/v1/players*`, () => {
    // Generate 24 test players
    const players = Array.from({ length: 24 }, (_, i) => ({
      id: `player-${i + 1}`,
      tournament_id: 'test-tournament-1',
      name: `Player ${i + 1}`,
      seed: i + 1,
      ifpa_id: 10000 + i,
      matchplay_id: null,
      created_at: '2026-01-01T00:00:00Z',
    }))
    return HttpResponse.json(players)
  }),

  // Brackets - GET
  http.get(`${SUPABASE_URL}/rest/v1/brackets*`, () => {
    return HttpResponse.json([])
  }),

  // Brackets - POST (create)
  http.post(`${SUPABASE_URL}/rest/v1/brackets`, () => {
    return HttpResponse.json(
      {
        id: 'new-bracket-id',
        user_id: 'test-user-id',
        tournament_id: 'test-tournament-1',
        name: 'My Bracket',
        is_public: true,
        final_winner_games: null,
        final_loser_games: null,
        created_at: '2026-01-04T00:00:00Z',
        updated_at: '2026-01-04T00:00:00Z',
      },
      { status: 201 }
    )
  }),

  // Brackets - PATCH (update)
  http.patch(`${SUPABASE_URL}/rest/v1/brackets*`, () => {
    return HttpResponse.json({}, { status: 200 })
  }),

  // Picks - GET
  http.get(`${SUPABASE_URL}/rest/v1/picks*`, () => {
    return HttpResponse.json([])
  }),

  // Picks - POST (create)
  http.post(`${SUPABASE_URL}/rest/v1/picks`, () => {
    return HttpResponse.json({}, { status: 201 })
  }),

  // Picks - DELETE
  http.delete(`${SUPABASE_URL}/rest/v1/picks*`, () => {
    return HttpResponse.json({}, { status: 200 })
  }),

  // Profiles
  http.get(`${SUPABASE_URL}/rest/v1/profiles*`, () => {
    return HttpResponse.json([
      {
        id: 'test-user-id',
        display_name: 'Test User',
        email: 'test@example.com',
        is_admin: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ])
  }),
]
