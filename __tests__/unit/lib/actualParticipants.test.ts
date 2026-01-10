import { describe, it, expect } from 'vitest'
import {
  buildResultMap,
  computeAllActualParticipants,
  getActualMatchParticipants,
  getMatchResultInfo,
} from '@/lib/bracket/actualParticipants'
import { Result } from '@/lib/types'
import { ROUNDS } from '@/lib/bracket/constants'

// Helper to create a result
function createResult(
  round: number,
  matchPosition: number,
  winnerSeed: number,
  loserSeed: number
): Result {
  return {
    id: `result-${round}-${matchPosition}`,
    tournament_id: 'test-tournament',
    round,
    match_position: matchPosition,
    winner_seed: winnerSeed,
    loser_seed: loserSeed,
    winner_games: 4,
    loser_games: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

describe('buildResultMap', () => {
  it('builds map keyed by round-position', () => {
    const results: Result[] = [
      createResult(0, 0, 9, 24),
      createResult(0, 1, 10, 23),
    ]
    const map = buildResultMap(results)

    expect(map.get('0-0')?.winner_seed).toBe(9)
    expect(map.get('0-1')?.winner_seed).toBe(10)
    expect(map.get('0-2')).toBeUndefined()
  })
})

describe('getActualMatchParticipants', () => {
  describe('24-player tournament', () => {
    it('returns fixed seeds for opening round', () => {
      const resultMap = buildResultMap([])

      // Opening round match 0: 9 vs 24
      const participants = getActualMatchParticipants(resultMap, ROUNDS.OPENING, 0, 24)
      expect(participants.actualTop).toBe(9)
      expect(participants.actualBottom).toBe(24)
    })

    it('returns bye seed and null for R16 when no opening result', () => {
      const resultMap = buildResultMap([])

      // R16 match 0: 1 vs winner of opening match 7 (16/17)
      const participants = getActualMatchParticipants(resultMap, ROUNDS.ROUND_OF_16, 0, 24)
      expect(participants.actualTop).toBe(1) // Bye seed is fixed
      expect(participants.actualBottom).toBeNull() // No opening result yet
    })

    it('returns actual winner for R16 when opening result exists', () => {
      const results: Result[] = [
        createResult(ROUNDS.OPENING, 7, 16, 17), // Seed 16 beat seed 17
      ]
      const resultMap = buildResultMap(results)

      // R16 match 0: 1 vs winner of opening match 7
      const participants = getActualMatchParticipants(resultMap, ROUNDS.ROUND_OF_16, 0, 24)
      expect(participants.actualTop).toBe(1)
      expect(participants.actualBottom).toBe(16) // Winner from opening
    })

    it('cascades through multiple rounds', () => {
      const results: Result[] = [
        // Opening round results
        createResult(ROUNDS.OPENING, 7, 16, 17),
        createResult(ROUNDS.OPENING, 0, 9, 24),
        // R16 results
        createResult(ROUNDS.ROUND_OF_16, 0, 1, 16), // 1 beat 16
        createResult(ROUNDS.ROUND_OF_16, 1, 8, 9),  // 8 beat 9
      ]
      const resultMap = buildResultMap(results)

      // Quarters match 0: winner of R16 match 0 vs winner of R16 match 1
      const participants = getActualMatchParticipants(resultMap, ROUNDS.QUARTERS, 0, 24)
      expect(participants.actualTop).toBe(1)    // Winner of R16 match 0
      expect(participants.actualBottom).toBe(8) // Winner of R16 match 1
    })

    it('returns null for quarters when R16 results missing', () => {
      const results: Result[] = [
        createResult(ROUNDS.OPENING, 7, 16, 17),
      ]
      const resultMap = buildResultMap(results)

      const participants = getActualMatchParticipants(resultMap, ROUNDS.QUARTERS, 0, 24)
      expect(participants.actualTop).toBeNull()
      expect(participants.actualBottom).toBeNull()
    })

    it('computes consolation participants from semi losers', () => {
      const results: Result[] = [
        // Full results through semis
        createResult(ROUNDS.OPENING, 7, 16, 17),
        createResult(ROUNDS.OPENING, 0, 9, 24),
        createResult(ROUNDS.OPENING, 3, 12, 21),
        createResult(ROUNDS.OPENING, 4, 13, 20),
        createResult(ROUNDS.OPENING, 6, 15, 18),
        createResult(ROUNDS.OPENING, 1, 10, 23),
        createResult(ROUNDS.OPENING, 2, 11, 22),
        createResult(ROUNDS.OPENING, 5, 14, 19),
        createResult(ROUNDS.ROUND_OF_16, 0, 1, 16),
        createResult(ROUNDS.ROUND_OF_16, 1, 8, 9),
        createResult(ROUNDS.ROUND_OF_16, 2, 4, 12),
        createResult(ROUNDS.ROUND_OF_16, 3, 5, 13),
        createResult(ROUNDS.ROUND_OF_16, 4, 2, 15),
        createResult(ROUNDS.ROUND_OF_16, 5, 7, 10),
        createResult(ROUNDS.ROUND_OF_16, 6, 3, 11),
        createResult(ROUNDS.ROUND_OF_16, 7, 6, 14),
        createResult(ROUNDS.QUARTERS, 0, 1, 8),
        createResult(ROUNDS.QUARTERS, 1, 4, 5),
        createResult(ROUNDS.QUARTERS, 2, 2, 7),
        createResult(ROUNDS.QUARTERS, 3, 3, 6),
        createResult(ROUNDS.SEMIS, 0, 1, 4), // 1 beat 4 -> 4 goes to consolation
        createResult(ROUNDS.SEMIS, 1, 2, 3), // 2 beat 3 -> 3 goes to consolation
      ]
      const resultMap = buildResultMap(results)

      const participants = getActualMatchParticipants(resultMap, ROUNDS.CONSOLATION, 0, 24)
      expect(participants.actualTop).toBe(4)  // Loser of semi 0
      expect(participants.actualBottom).toBe(3) // Loser of semi 1
    })
  })

  describe('16-player tournament', () => {
    it('returns fixed seeds for R16 (first round)', () => {
      const resultMap = buildResultMap([])

      // R16 match 0: 1 vs 16
      const participants = getActualMatchParticipants(resultMap, ROUNDS.ROUND_OF_16, 0, 16)
      expect(participants.actualTop).toBe(1)
      expect(participants.actualBottom).toBe(16)
    })

    it('returns null for opening round (no opening in 16-player)', () => {
      const resultMap = buildResultMap([])

      const participants = getActualMatchParticipants(resultMap, ROUNDS.OPENING, 0, 16)
      expect(participants.actualTop).toBeNull()
      expect(participants.actualBottom).toBeNull()
    })
  })
})

describe('computeAllActualParticipants', () => {
  it('computes participants for all matches', () => {
    const results: Result[] = [
      createResult(ROUNDS.OPENING, 7, 16, 17),
    ]

    const map = computeAllActualParticipants(results, 24)

    // Opening match 0 has fixed participants
    expect(map.get('0-0')?.actualTop).toBe(9)
    expect(map.get('0-0')?.actualBottom).toBe(24)

    // R16 match 0 has bye seed + winner from opening 7
    expect(map.get('1-0')?.actualTop).toBe(1)
    expect(map.get('1-0')?.actualBottom).toBe(16)

    // Quarters match 0 should have null (no R16 results)
    expect(map.get('2-0')?.actualTop).toBeNull()
    expect(map.get('2-0')?.actualBottom).toBeNull()
  })

  it('skips opening round for 16-player tournaments', () => {
    const results: Result[] = []
    const map = computeAllActualParticipants(results, 16)

    // Should not have any opening round entries
    expect(map.has('0-0')).toBe(false)

    // Should have R16 entries with fixed seeds
    expect(map.get('1-0')?.actualTop).toBe(1)
    expect(map.get('1-0')?.actualBottom).toBe(16)
  })
})

describe('getMatchResultInfo', () => {
  it('returns null when no result exists', () => {
    const resultMap = buildResultMap([])
    expect(getMatchResultInfo(resultMap, 0, 0)).toBeNull()
  })

  it('returns winner and loser when result exists', () => {
    const results: Result[] = [
      createResult(0, 0, 9, 24),
    ]
    const resultMap = buildResultMap(results)

    const info = getMatchResultInfo(resultMap, 0, 0)
    expect(info?.winnerSeed).toBe(9)
    expect(info?.loserSeed).toBe(24)
  })
})
