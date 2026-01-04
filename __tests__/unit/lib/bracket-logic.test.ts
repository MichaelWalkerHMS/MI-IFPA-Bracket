import { describe, it, expect } from 'vitest'
import {
  getMatchWinner,
  getMatchLoser,
  getMatchParticipants,
  clearDownstreamPicks,
  applyPick,
} from '@/lib/bracket/logic'
import { ROUNDS, getPickKey } from '@/lib/bracket/constants'

describe('getMatchWinner', () => {
  it('returns null for empty picks', () => {
    const picks = new Map<string, number>()
    expect(getMatchWinner(picks, ROUNDS.OPENING, 0)).toBeNull()
  })

  it('returns the winner seed when pick exists', () => {
    const picks = new Map<string, number>()
    picks.set(getPickKey(ROUNDS.OPENING, 0), 9)
    expect(getMatchWinner(picks, ROUNDS.OPENING, 0)).toBe(9)
  })

  it('returns null for different position', () => {
    const picks = new Map<string, number>()
    picks.set(getPickKey(ROUNDS.OPENING, 0), 9)
    expect(getMatchWinner(picks, ROUNDS.OPENING, 1)).toBeNull()
  })
})

describe('getMatchParticipants', () => {
  describe('Opening Round', () => {
    it('returns correct seeds for position 0 (9 vs 24)', () => {
      const picks = new Map<string, number>()
      const result = getMatchParticipants(picks, ROUNDS.OPENING, 0)
      expect(result).toEqual({ topSeed: 9, bottomSeed: 24 })
    })

    it('returns correct seeds for position 7 (16 vs 17)', () => {
      const picks = new Map<string, number>()
      const result = getMatchParticipants(picks, ROUNDS.OPENING, 7)
      expect(result).toEqual({ topSeed: 16, bottomSeed: 17 })
    })

    it('does not depend on picks for opening round', () => {
      // Opening round participants are fixed by seeding
      const picks = new Map<string, number>()
      picks.set(getPickKey(ROUNDS.OPENING, 0), 9) // Even with a pick, participants are the same
      const result = getMatchParticipants(picks, ROUNDS.OPENING, 0)
      expect(result).toEqual({ topSeed: 9, bottomSeed: 24 })
    })
  })

  describe('Round of 16', () => {
    it('returns bye seed and null when opening winner not picked', () => {
      const picks = new Map<string, number>()
      // R16 position 0: seed 1 vs winner of opening position 7 (16/17)
      const result = getMatchParticipants(picks, ROUNDS.ROUND_OF_16, 0)
      expect(result).toEqual({ topSeed: 1, bottomSeed: null })
    })

    it('returns bye seed and opening winner when picked', () => {
      const picks = new Map<string, number>()
      // Pick seed 16 to win opening position 7
      picks.set(getPickKey(ROUNDS.OPENING, 7), 16)

      const result = getMatchParticipants(picks, ROUNDS.ROUND_OF_16, 0)
      expect(result).toEqual({ topSeed: 1, bottomSeed: 16 })
    })

    it('maps all bye seeds correctly', () => {
      const picks = new Map<string, number>()
      // Expected bye seeds at each R16 position (from constants)
      const expectedByeSeeds = [1, 8, 4, 5, 2, 7, 3, 6]

      for (let pos = 0; pos < 8; pos++) {
        const result = getMatchParticipants(picks, ROUNDS.ROUND_OF_16, pos)
        expect(result.topSeed).toBe(expectedByeSeeds[pos])
      }
    })
  })

  describe('Quarterfinals', () => {
    it('returns null participants when R16 winners not picked', () => {
      const picks = new Map<string, number>()
      const result = getMatchParticipants(picks, ROUNDS.QUARTERS, 0)
      expect(result).toEqual({ topSeed: null, bottomSeed: null })
    })

    it('returns R16 winners as participants', () => {
      const picks = new Map<string, number>()
      // QF position 0 takes winners from R16 positions 0 and 1
      picks.set(getPickKey(ROUNDS.ROUND_OF_16, 0), 1)
      picks.set(getPickKey(ROUNDS.ROUND_OF_16, 1), 8)

      const result = getMatchParticipants(picks, ROUNDS.QUARTERS, 0)
      expect(result).toEqual({ topSeed: 1, bottomSeed: 8 })
    })
  })

  describe('Semifinals', () => {
    it('returns QF winners as participants', () => {
      const picks = new Map<string, number>()
      // SF position 0 takes winners from QF positions 0 and 1
      picks.set(getPickKey(ROUNDS.QUARTERS, 0), 1)
      picks.set(getPickKey(ROUNDS.QUARTERS, 1), 4)

      const result = getMatchParticipants(picks, ROUNDS.SEMIS, 0)
      expect(result).toEqual({ topSeed: 1, bottomSeed: 4 })
    })
  })

  describe('Finals', () => {
    it('returns SF winners as participants', () => {
      const picks = new Map<string, number>()
      picks.set(getPickKey(ROUNDS.SEMIS, 0), 1)
      picks.set(getPickKey(ROUNDS.SEMIS, 1), 2)

      const result = getMatchParticipants(picks, ROUNDS.FINALS, 0)
      expect(result).toEqual({ topSeed: 1, bottomSeed: 2 })
    })
  })

  describe('Consolation (3rd Place)', () => {
    it('returns null when SF matches not complete', () => {
      const picks = new Map<string, number>()
      const result = getMatchParticipants(picks, ROUNDS.CONSOLATION, 0)
      expect(result).toEqual({ topSeed: null, bottomSeed: null })
    })

    it('returns SF losers as participants', () => {
      const picks = new Map<string, number>()
      // Need to set up the full bracket path to determine losers
      // SF 0: seed 1 vs seed 4, winner is 1 (so loser is 4)
      // SF 1: seed 2 vs seed 3, winner is 2 (so loser is 3)

      // Set up QF winners to determine SF participants
      picks.set(getPickKey(ROUNDS.QUARTERS, 0), 1)
      picks.set(getPickKey(ROUNDS.QUARTERS, 1), 4)
      picks.set(getPickKey(ROUNDS.QUARTERS, 2), 2)
      picks.set(getPickKey(ROUNDS.QUARTERS, 3), 3)

      // Set SF winners
      picks.set(getPickKey(ROUNDS.SEMIS, 0), 1) // 1 beats 4
      picks.set(getPickKey(ROUNDS.SEMIS, 1), 2) // 2 beats 3

      const result = getMatchParticipants(picks, ROUNDS.CONSOLATION, 0)
      expect(result).toEqual({ topSeed: 4, bottomSeed: 3 })
    })
  })

  describe('Invalid round', () => {
    it('returns null for invalid round', () => {
      const picks = new Map<string, number>()
      const result = getMatchParticipants(picks, 99, 0)
      expect(result).toEqual({ topSeed: null, bottomSeed: null })
    })
  })
})

describe('getMatchLoser', () => {
  it('returns null when no winner picked', () => {
    const picks = new Map<string, number>()
    expect(getMatchLoser(picks, ROUNDS.OPENING, 0)).toBeNull()
  })

  it('returns bottom seed when top seed wins', () => {
    const picks = new Map<string, number>()
    picks.set(getPickKey(ROUNDS.OPENING, 0), 9) // 9 beats 24
    expect(getMatchLoser(picks, ROUNDS.OPENING, 0)).toBe(24)
  })

  it('returns top seed when bottom seed wins', () => {
    const picks = new Map<string, number>()
    picks.set(getPickKey(ROUNDS.OPENING, 0), 24) // 24 beats 9 (upset!)
    expect(getMatchLoser(picks, ROUNDS.OPENING, 0)).toBe(9)
  })

  it('works for later rounds with proper setup', () => {
    const picks = new Map<string, number>()
    // Set up R16: seed 1 vs seed 16 (winner of 16/17)
    picks.set(getPickKey(ROUNDS.OPENING, 7), 16) // 16 wins opening
    picks.set(getPickKey(ROUNDS.ROUND_OF_16, 0), 1) // 1 beats 16

    expect(getMatchLoser(picks, ROUNDS.ROUND_OF_16, 0)).toBe(16)
  })
})

describe('clearDownstreamPicks', () => {
  it('returns same picks when seed not found downstream', () => {
    const picks = new Map<string, number>()
    picks.set(getPickKey(ROUNDS.OPENING, 0), 9)
    picks.set(getPickKey(ROUNDS.ROUND_OF_16, 1), 8)

    const result = clearDownstreamPicks(picks, ROUNDS.OPENING, 99)
    expect(result.size).toBe(2)
  })

  it('clears picks containing the specified seed', () => {
    const picks = new Map<string, number>()
    picks.set(getPickKey(ROUNDS.OPENING, 0), 9)
    picks.set(getPickKey(ROUNDS.ROUND_OF_16, 1), 9) // Seed 9 advanced
    picks.set(getPickKey(ROUNDS.QUARTERS, 0), 9) // Seed 9 advanced again
    picks.set(getPickKey(ROUNDS.ROUND_OF_16, 0), 1) // Different seed

    const result = clearDownstreamPicks(picks, ROUNDS.OPENING, 9)

    // Opening pick should remain (it's the source, not downstream)
    expect(result.get(getPickKey(ROUNDS.OPENING, 0))).toBe(9)
    // Downstream picks with seed 9 should be cleared
    expect(result.has(getPickKey(ROUNDS.ROUND_OF_16, 1))).toBe(false)
    expect(result.has(getPickKey(ROUNDS.QUARTERS, 0))).toBe(false)
    // Other picks should remain
    expect(result.get(getPickKey(ROUNDS.ROUND_OF_16, 0))).toBe(1)
  })

  it('only clears from the specified round onwards', () => {
    const picks = new Map<string, number>()
    picks.set(getPickKey(ROUNDS.ROUND_OF_16, 0), 9)
    picks.set(getPickKey(ROUNDS.QUARTERS, 0), 9)
    picks.set(getPickKey(ROUNDS.SEMIS, 0), 9)

    // Clear from QF onwards
    const result = clearDownstreamPicks(picks, ROUNDS.ROUND_OF_16, 9)

    // R16 pick should remain (not downstream of R16)
    expect(result.get(getPickKey(ROUNDS.ROUND_OF_16, 0))).toBe(9)
    // QF and later should be cleared
    expect(result.has(getPickKey(ROUNDS.QUARTERS, 0))).toBe(false)
    expect(result.has(getPickKey(ROUNDS.SEMIS, 0))).toBe(false)
  })

  it('does not mutate original picks', () => {
    const picks = new Map<string, number>()
    picks.set(getPickKey(ROUNDS.OPENING, 0), 9)
    picks.set(getPickKey(ROUNDS.ROUND_OF_16, 1), 9)

    clearDownstreamPicks(picks, ROUNDS.OPENING, 9)

    // Original should still have both picks
    expect(picks.size).toBe(2)
  })
})

describe('applyPick', () => {
  describe('Selecting a new winner', () => {
    it('adds pick to empty map', () => {
      const picks = new Map<string, number>()
      const result = applyPick(picks, ROUNDS.OPENING, 0, 9)

      expect(result.get(getPickKey(ROUNDS.OPENING, 0))).toBe(9)
    })

    it('replaces existing pick', () => {
      const picks = new Map<string, number>()
      picks.set(getPickKey(ROUNDS.OPENING, 0), 9)

      const result = applyPick(picks, ROUNDS.OPENING, 0, 24)

      expect(result.get(getPickKey(ROUNDS.OPENING, 0))).toBe(24)
    })

    it('clears downstream picks when changing winner', () => {
      const picks = new Map<string, number>()
      picks.set(getPickKey(ROUNDS.OPENING, 0), 9)
      picks.set(getPickKey(ROUNDS.ROUND_OF_16, 1), 9) // 9 advanced
      picks.set(getPickKey(ROUNDS.QUARTERS, 0), 9) // 9 advanced again

      // Change opening winner from 9 to 24
      const result = applyPick(picks, ROUNDS.OPENING, 0, 24)

      // New winner should be set
      expect(result.get(getPickKey(ROUNDS.OPENING, 0))).toBe(24)
      // Old winner's downstream picks should be cleared
      expect(result.has(getPickKey(ROUNDS.ROUND_OF_16, 1))).toBe(false)
      expect(result.has(getPickKey(ROUNDS.QUARTERS, 0))).toBe(false)
    })
  })

  describe('Toggle off (deselecting)', () => {
    it('removes pick when clicking same winner', () => {
      const picks = new Map<string, number>()
      picks.set(getPickKey(ROUNDS.OPENING, 0), 9)

      const result = applyPick(picks, ROUNDS.OPENING, 0, 9)

      expect(result.has(getPickKey(ROUNDS.OPENING, 0))).toBe(false)
    })

    it('clears downstream picks when toggling off', () => {
      const picks = new Map<string, number>()
      picks.set(getPickKey(ROUNDS.OPENING, 0), 9)
      picks.set(getPickKey(ROUNDS.ROUND_OF_16, 1), 9)
      picks.set(getPickKey(ROUNDS.QUARTERS, 0), 9)

      // Toggle off by clicking same winner
      const result = applyPick(picks, ROUNDS.OPENING, 0, 9)

      // All picks with seed 9 should be gone
      expect(result.has(getPickKey(ROUNDS.OPENING, 0))).toBe(false)
      expect(result.has(getPickKey(ROUNDS.ROUND_OF_16, 1))).toBe(false)
      expect(result.has(getPickKey(ROUNDS.QUARTERS, 0))).toBe(false)
    })
  })

  describe('Does not mutate original', () => {
    it('returns new Map without mutating input', () => {
      const picks = new Map<string, number>()
      picks.set(getPickKey(ROUNDS.OPENING, 0), 9)

      const result = applyPick(picks, ROUNDS.OPENING, 0, 24)

      // Original unchanged
      expect(picks.get(getPickKey(ROUNDS.OPENING, 0))).toBe(9)
      // Result has new value
      expect(result.get(getPickKey(ROUNDS.OPENING, 0))).toBe(24)
    })
  })
})

describe('Full bracket simulation', () => {
  it('correctly propagates a complete bracket', () => {
    const picks = new Map<string, number>()

    // Opening round: favorites win (lower seeds)
    for (let i = 0; i < 8; i++) {
      const topSeed = 9 + i
      picks.set(getPickKey(ROUNDS.OPENING, i), topSeed)
    }

    // Verify opening winners feed into R16 correctly
    // R16 position 0: seed 1 vs winner of opening position 7 (seed 16)
    const r16_0 = getMatchParticipants(picks, ROUNDS.ROUND_OF_16, 0)
    expect(r16_0.topSeed).toBe(1)
    expect(r16_0.bottomSeed).toBe(16) // Winner of 16v17

    // R16 position 1: seed 8 vs winner of opening position 0 (seed 9)
    const r16_1 = getMatchParticipants(picks, ROUNDS.ROUND_OF_16, 1)
    expect(r16_1.topSeed).toBe(8)
    expect(r16_1.bottomSeed).toBe(9)
  })

  it('handles cascade when changing early pick', () => {
    let picks = new Map<string, number>()

    // Build a bracket where seed 9 wins opening and advances
    picks = applyPick(picks, ROUNDS.OPENING, 0, 9)
    picks = applyPick(picks, ROUNDS.ROUND_OF_16, 1, 9) // 9 beats 8
    picks = applyPick(picks, ROUNDS.QUARTERS, 0, 9) // 9 advances

    expect(picks.size).toBe(3)

    // Now change opening pick to 24 (upset)
    picks = applyPick(picks, ROUNDS.OPENING, 0, 24)

    // Should only have the opening pick now
    expect(picks.size).toBe(1)
    expect(picks.get(getPickKey(ROUNDS.OPENING, 0))).toBe(24)
  })
})
