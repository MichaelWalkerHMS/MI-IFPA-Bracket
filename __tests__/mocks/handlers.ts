import { http, HttpResponse } from 'msw'
import { mockTournament } from '../fixtures/tournaments'
import { createMockPlayers } from '../fixtures/players'

// Base URL for Supabase REST API (dev environment)
const SUPABASE_URL = 'https://nsmositomvtlhxkghchr.supabase.co'

// ============================================================================
// Handler Factories - Create customizable handlers for specific test scenarios
// ============================================================================

/**
 * Create a tournament GET handler with custom data
 */
export function createTournamentHandler(tournaments = [mockTournament]) {
  return http.get(`${SUPABASE_URL}/rest/v1/tournaments*`, () => {
    return HttpResponse.json(tournaments)
  })
}

/**
 * Create a players GET handler with custom data
 */
export function createPlayersHandler(tournamentId = 'test-tournament-1', count = 24) {
  return http.get(`${SUPABASE_URL}/rest/v1/players*`, () => {
    return HttpResponse.json(createMockPlayers(tournamentId).slice(0, count))
  })
}

/**
 * Create a brackets GET handler with custom data
 */
export function createBracketsHandler(brackets: unknown[] = []) {
  return http.get(`${SUPABASE_URL}/rest/v1/brackets*`, () => {
    return HttpResponse.json(brackets)
  })
}

/**
 * Create a picks GET handler with custom data
 */
export function createPicksHandler(picks: unknown[] = []) {
  return http.get(`${SUPABASE_URL}/rest/v1/picks*`, () => {
    return HttpResponse.json(picks)
  })
}

// ============================================================================
// Error Handlers - Use with server.use() to simulate error conditions
// ============================================================================

export const errorHandlers = {
  /** Simulate database connection error */
  databaseError: http.all(`${SUPABASE_URL}/rest/v1/*`, () => {
    return HttpResponse.json(
      { message: 'Database connection error', code: 'PGRST301' },
      { status: 503 }
    )
  }),

  /** Simulate unauthorized access */
  unauthorized: http.all(`${SUPABASE_URL}/rest/v1/*`, () => {
    return HttpResponse.json(
      { message: 'JWT expired', code: 'PGRST301' },
      { status: 401 }
    )
  }),

  /** Simulate forbidden (RLS policy violation) */
  forbidden: http.all(`${SUPABASE_URL}/rest/v1/*`, () => {
    return HttpResponse.json(
      { message: 'new row violates row-level security policy', code: '42501' },
      { status: 403 }
    )
  }),

  /** Simulate bracket save failure */
  bracketSaveFailed: http.post(`${SUPABASE_URL}/rest/v1/brackets`, () => {
    return HttpResponse.json(
      { message: 'Failed to save bracket' },
      { status: 500 }
    )
  }),

  /** Simulate tournament not found */
  tournamentNotFound: http.get(`${SUPABASE_URL}/rest/v1/tournaments*`, () => {
    return HttpResponse.json([])
  }),

  /** Simulate network timeout */
  networkTimeout: http.all(`${SUPABASE_URL}/rest/v1/*`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 30000))
    return HttpResponse.json({})
  }),
}

// ============================================================================
// Default Handlers - Used for most tests (happy path)
// ============================================================================

export const handlers = [
  // Tournaments
  http.get(`${SUPABASE_URL}/rest/v1/tournaments*`, () => {
    return HttpResponse.json([mockTournament])
  }),

  // Players
  http.get(`${SUPABASE_URL}/rest/v1/players*`, () => {
    return HttpResponse.json(createMockPlayers())
  }),

  // Brackets - GET
  http.get(`${SUPABASE_URL}/rest/v1/brackets*`, () => {
    return HttpResponse.json([])
  }),

  // Brackets - POST (create)
  http.post(`${SUPABASE_URL}/rest/v1/brackets`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(
      {
        id: 'new-bracket-id',
        user_id: 'test-user-id',
        tournament_id: body.tournament_id || 'test-tournament-1',
        name: body.name || 'My Bracket',
        is_public: body.is_public ?? true,
        final_winner_games: body.final_winner_games || null,
        final_loser_games: body.final_loser_games || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  // Brackets - PATCH (update)
  http.patch(`${SUPABASE_URL}/rest/v1/brackets*`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(body, { status: 200 })
  }),

  // Picks - GET
  http.get(`${SUPABASE_URL}/rest/v1/picks*`, () => {
    return HttpResponse.json([])
  }),

  // Picks - POST (create)
  http.post(`${SUPABASE_URL}/rest/v1/picks`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(body, { status: 201 })
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

  // Results - GET (for future use)
  http.get(`${SUPABASE_URL}/rest/v1/results*`, () => {
    return HttpResponse.json([])
  }),

  // Results - POST (for future use)
  http.post(`${SUPABASE_URL}/rest/v1/results`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(body, { status: 201 })
  }),

  // Leaderboard entries (join query)
  http.get(`${SUPABASE_URL}/rest/v1/leaderboard*`, () => {
    return HttpResponse.json([])
  }),
]
