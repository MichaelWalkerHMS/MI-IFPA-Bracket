import { describe, it, expect } from 'vitest'
import {
  ROUNDS,
  ROUND_NAMES,
  MATCHES_PER_ROUND,
  OPENING_ROUND_MATCHES,
  ROUND_OF_16_MATCHES,
  QUARTERS_MATCHES,
  SEMIS_MATCHES,
  FINALS_MATCH,
  CONSOLATION_MATCH,
  BYE_SEEDS,
  TOTAL_PREDICTIONS,
  OPENING_DISPLAY_ORDER,
  getPickKey,
  parsePickKey,
} from '@/lib/bracket/constants'

describe('getPickKey', () => {
  it('creates correct key format from round and position', () => {
    expect(getPickKey(0, 0)).toBe('0-0')
    expect(getPickKey(1, 5)).toBe('1-5')
    expect(getPickKey(4, 0)).toBe('4-0')
  })

  it('handles all rounds correctly', () => {
    expect(getPickKey(ROUNDS.OPENING, 7)).toBe('0-7')
    expect(getPickKey(ROUNDS.ROUND_OF_16, 3)).toBe('1-3')
    expect(getPickKey(ROUNDS.QUARTERS, 2)).toBe('2-2')
    expect(getPickKey(ROUNDS.SEMIS, 1)).toBe('3-1')
    expect(getPickKey(ROUNDS.FINALS, 0)).toBe('4-0')
    expect(getPickKey(ROUNDS.CONSOLATION, 0)).toBe('5-0')
  })
})

describe('parsePickKey', () => {
  it('parses key back to round and position', () => {
    expect(parsePickKey('0-0')).toEqual({ round: 0, position: 0 })
    expect(parsePickKey('1-5')).toEqual({ round: 1, position: 5 })
    expect(parsePickKey('4-0')).toEqual({ round: 4, position: 0 })
  })

  it('is inverse of getPickKey', () => {
    // Any key created by getPickKey should parse back to the same values
    for (let round = 0; round <= 5; round++) {
      for (let position = 0; position < 8; position++) {
        const key = getPickKey(round, position)
        const parsed = parsePickKey(key)
        expect(parsed.round).toBe(round)
        expect(parsed.position).toBe(position)
      }
    }
  })
})

describe('ROUNDS constants', () => {
  it('has correct round identifiers', () => {
    expect(ROUNDS.OPENING).toBe(0)
    expect(ROUNDS.ROUND_OF_16).toBe(1)
    expect(ROUNDS.QUARTERS).toBe(2)
    expect(ROUNDS.SEMIS).toBe(3)
    expect(ROUNDS.FINALS).toBe(4)
    expect(ROUNDS.CONSOLATION).toBe(5)
  })
})

describe('ROUND_NAMES', () => {
  it('has names for all rounds', () => {
    expect(ROUND_NAMES[ROUNDS.OPENING]).toBe('Opening Round')
    expect(ROUND_NAMES[ROUNDS.ROUND_OF_16]).toBe('Round of 16')
    expect(ROUND_NAMES[ROUNDS.QUARTERS]).toBe('Quarterfinals')
    expect(ROUND_NAMES[ROUNDS.SEMIS]).toBe('Semifinals')
    expect(ROUND_NAMES[ROUNDS.FINALS]).toBe('Finals')
    expect(ROUND_NAMES[ROUNDS.CONSOLATION]).toBe('3rd Place')
  })
})

describe('MATCHES_PER_ROUND', () => {
  it('has correct match counts', () => {
    expect(MATCHES_PER_ROUND[ROUNDS.OPENING]).toBe(8)
    expect(MATCHES_PER_ROUND[ROUNDS.ROUND_OF_16]).toBe(8)
    expect(MATCHES_PER_ROUND[ROUNDS.QUARTERS]).toBe(4)
    expect(MATCHES_PER_ROUND[ROUNDS.SEMIS]).toBe(2)
    expect(MATCHES_PER_ROUND[ROUNDS.FINALS]).toBe(1)
    expect(MATCHES_PER_ROUND[ROUNDS.CONSOLATION]).toBe(1)
  })

  it('totals to correct number of predictions', () => {
    const total = Object.values(MATCHES_PER_ROUND).reduce((sum, count) => sum + count, 0)
    expect(total).toBe(TOTAL_PREDICTIONS)
  })
})

describe('OPENING_ROUND_MATCHES', () => {
  it('has 8 matches', () => {
    expect(OPENING_ROUND_MATCHES).toHaveLength(8)
  })

  it('pairs seeds 9-24 correctly', () => {
    // Expected pairings: 9v24, 10v23, 11v22, 12v21, 13v20, 14v19, 15v18, 16v17
    expect(OPENING_ROUND_MATCHES[0]).toEqual({ position: 0, topSeed: 9, bottomSeed: 24 })
    expect(OPENING_ROUND_MATCHES[7]).toEqual({ position: 7, topSeed: 16, bottomSeed: 17 })
  })

  it('has each seed 9-24 appear exactly once', () => {
    const allSeeds = OPENING_ROUND_MATCHES.flatMap((m) => [m.topSeed, m.bottomSeed])
    const expectedSeeds = Array.from({ length: 16 }, (_, i) => i + 9) // 9-24
    expect(allSeeds.sort((a, b) => a - b)).toEqual(expectedSeeds)
  })

  it('pairs seeds symmetrically (sum to 33)', () => {
    // In a 24-player bracket, seeds are paired symmetrically: 9+24=33, 10+23=33, etc.
    for (const match of OPENING_ROUND_MATCHES) {
      expect(match.topSeed + match.bottomSeed).toBe(33)
    }
  })
})

describe('ROUND_OF_16_MATCHES', () => {
  it('has 8 matches', () => {
    expect(ROUND_OF_16_MATCHES).toHaveLength(8)
  })

  it('includes all bye seeds (1-8)', () => {
    const byeSeeds = ROUND_OF_16_MATCHES.map((m) => m.byeSeed).sort((a, b) => a - b)
    expect(byeSeeds).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('references all opening round positions', () => {
    const openingPositions = ROUND_OF_16_MATCHES.map((m) => m.openingWinnerPosition).sort(
      (a, b) => a - b
    )
    expect(openingPositions).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })
})

describe('QUARTERS_MATCHES', () => {
  it('has 4 matches', () => {
    expect(QUARTERS_MATCHES).toHaveLength(4)
  })

  it('takes winners from all R16 matches', () => {
    const allSources = QUARTERS_MATCHES.flatMap((m) => [
      m.topSourcePosition,
      m.bottomSourcePosition,
    ]).sort((a, b) => a - b)
    expect(allSources).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })
})

describe('SEMIS_MATCHES', () => {
  it('has 2 matches', () => {
    expect(SEMIS_MATCHES).toHaveLength(2)
  })

  it('takes winners from all QF matches', () => {
    const allSources = SEMIS_MATCHES.flatMap((m) => [
      m.topSourcePosition,
      m.bottomSourcePosition,
    ]).sort((a, b) => a - b)
    expect(allSources).toEqual([0, 1, 2, 3])
  })
})

describe('FINALS_MATCH', () => {
  it('takes winners from both semifinals', () => {
    expect(FINALS_MATCH.topSourcePosition).toBe(0)
    expect(FINALS_MATCH.bottomSourcePosition).toBe(1)
  })
})

describe('CONSOLATION_MATCH', () => {
  it('takes losers from both semifinals', () => {
    expect(CONSOLATION_MATCH.topSourcePosition).toBe(0)
    expect(CONSOLATION_MATCH.bottomSourcePosition).toBe(1)
  })
})

describe('BYE_SEEDS', () => {
  it('contains seeds 1-8', () => {
    expect(BYE_SEEDS).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})

describe('OPENING_DISPLAY_ORDER', () => {
  it('contains all 8 positions', () => {
    const sorted = [...OPENING_DISPLAY_ORDER].sort((a, b) => a - b)
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('places position 7 first (16v17 feeds into 1 vs winner)', () => {
    // Position 7 (16v17) should display first because it feeds into R16 position 0 (seed 1)
    expect(OPENING_DISPLAY_ORDER[0]).toBe(7)
  })
})

describe('TOTAL_PREDICTIONS', () => {
  it('equals 24', () => {
    expect(TOTAL_PREDICTIONS).toBe(24)
  })
})
