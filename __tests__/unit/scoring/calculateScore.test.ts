import { describe, it, expect } from 'vitest'
import { calculateBracketScore } from '@/lib/scoring/calculateScore'
import { Pick, Result, ScoringConfig } from '@/lib/types'

// Default 24-player scoring config
const defaultConfig: ScoringConfig = {
  opening: 1,
  round_of_16: 2,
  quarters: 3,
  semis: 4,
  finals: 5,
}

// Helper to create a pick
function createPick(round: number, matchPosition: number, winnerSeed: number): Pick {
  return {
    id: `pick-${round}-${matchPosition}`,
    bracket_id: 'test-bracket',
    round,
    match_position: matchPosition,
    winner_seed: winnerSeed,
    created_at: new Date().toISOString(),
  }
}

// Helper to create a result
function createResult(
  round: number,
  matchPosition: number,
  winnerSeed: number,
  loserSeed: number,
  winnerGames = 4,
  loserGames = 2
): Result {
  return {
    id: `result-${round}-${matchPosition}`,
    tournament_id: 'test-tournament',
    round,
    match_position: matchPosition,
    winner_seed: winnerSeed,
    loser_seed: loserSeed,
    winner_games: winnerGames,
    loser_games: loserGames,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

describe('calculateBracketScore', () => {
  describe('basic scoring', () => {
    it('returns 0 score for empty results', () => {
      const picks = [createPick(0, 0, 9)]
      const results: Result[] = []

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(0)
      expect(result.totalCorrect).toBe(0)
      expect(result.correctChampion).toBeNull()
      expect(result.gameScoreDiff).toBeNull()
    })

    it('returns 0 score for empty picks', () => {
      const picks: Pick[] = []
      const results = [createResult(0, 0, 9, 24)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(0)
      expect(result.totalCorrect).toBe(0)
    })

    it('awards 1 point for correct opening round pick', () => {
      const picks = [createPick(0, 0, 9)]
      const results = [createResult(0, 0, 9, 24)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(1)
      expect(result.totalCorrect).toBe(1)
    })

    it('awards 0 points for incorrect opening round pick', () => {
      const picks = [createPick(0, 0, 24)] // Predicted 24 to win
      const results = [createResult(0, 0, 9, 24)] // But 9 won

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(0)
      expect(result.totalCorrect).toBe(0)
    })

    it('awards 2 points for correct round of 16 pick', () => {
      const picks = [createPick(1, 0, 1)]
      const results = [createResult(1, 0, 1, 9)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(2)
      expect(result.totalCorrect).toBe(1)
    })

    it('awards 3 points for correct quarterfinal pick', () => {
      const picks = [createPick(2, 0, 1)]
      const results = [createResult(2, 0, 1, 4)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(3)
      expect(result.totalCorrect).toBe(1)
    })

    it('awards 4 points for correct semifinal pick', () => {
      const picks = [createPick(3, 0, 1)]
      const results = [createResult(3, 0, 1, 2)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(4)
      expect(result.totalCorrect).toBe(1)
    })

    it('awards 5 points for correct final pick', () => {
      const picks = [createPick(4, 0, 1)]
      const results = [createResult(4, 0, 1, 3)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(5)
      expect(result.totalCorrect).toBe(1)
    })

    it('awards same points as semis for consolation match (round 5)', () => {
      const picks = [createPick(5, 0, 2)]
      const results = [createResult(5, 0, 2, 4)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      // Consolation = semis points = 4
      expect(result.score).toBe(4)
      expect(result.totalCorrect).toBe(1)
    })
  })

  describe('multiple picks', () => {
    it('sums points for multiple correct picks', () => {
      const picks = [
        createPick(0, 0, 9),   // Opening: +1
        createPick(0, 1, 10),  // Opening: +1
        createPick(1, 0, 1),   // Ro16: +2
        createPick(2, 0, 1),   // Quarters: +3
      ]
      const results = [
        createResult(0, 0, 9, 24),   // Correct
        createResult(0, 1, 10, 23),  // Correct
        createResult(1, 0, 1, 9),    // Correct
        createResult(2, 0, 1, 4),    // Correct
      ]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(1 + 1 + 2 + 3)
      expect(result.totalCorrect).toBe(4)
    })

    it('only counts correct picks', () => {
      const picks = [
        createPick(0, 0, 9),   // Correct: +1
        createPick(0, 1, 23),  // Wrong: 0
        createPick(1, 0, 1),   // Correct: +2
      ]
      const results = [
        createResult(0, 0, 9, 24),   // Correct
        createResult(0, 1, 10, 23),  // Pick was 23, but 10 won
        createResult(1, 0, 1, 9),    // Correct
      ]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(1 + 2)
      expect(result.totalCorrect).toBe(2)
    })
  })

  describe('champion tiebreaker', () => {
    it('returns true for correct champion prediction', () => {
      const picks = [createPick(4, 0, 1)]
      const results = [createResult(4, 0, 1, 3)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.correctChampion).toBe(true)
    })

    it('returns false for incorrect champion prediction', () => {
      const picks = [createPick(4, 0, 3)] // Predicted 3 to win finals
      const results = [createResult(4, 0, 1, 3)] // But 1 won

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.correctChampion).toBe(false)
    })

    it('returns false when no finals pick exists', () => {
      const picks = [createPick(3, 0, 1)] // Only has semi pick
      const results = [createResult(4, 0, 1, 3)] // Finals played

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.correctChampion).toBe(false)
    })

    it('returns null when finals not played yet', () => {
      const picks = [createPick(4, 0, 1)]
      const results: Result[] = [] // No finals result

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.correctChampion).toBeNull()
    })
  })

  describe('game score difference tiebreaker', () => {
    it('calculates exact match as 0 difference', () => {
      const picks = [createPick(4, 0, 1)]
      const results = [createResult(4, 0, 1, 3, 4, 2)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: 4,
        loserGames: 2,
      })

      expect(result.gameScoreDiff).toBe(0)
    })

    it('calculates difference correctly', () => {
      const picks = [createPick(4, 0, 1)]
      const results = [createResult(4, 0, 1, 3, 4, 2)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: 4, // Correct
        loserGames: 0,  // Off by 2
      })

      // |4-4| + |0-2| = 0 + 2 = 2
      expect(result.gameScoreDiff).toBe(2)
    })

    it('handles both scores being wrong', () => {
      const picks = [createPick(4, 0, 1)]
      const results = [createResult(4, 0, 1, 3, 4, 2)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: 4, // Correct
        loserGames: 3,  // Off by 1
      })

      // |4-4| + |3-2| = 0 + 1 = 1
      expect(result.gameScoreDiff).toBe(1)
    })

    it('returns null when user did not predict game scores', () => {
      const picks = [createPick(4, 0, 1)]
      const results = [createResult(4, 0, 1, 3, 4, 2)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.gameScoreDiff).toBeNull()
    })

    it('returns null when only one game score is predicted', () => {
      const picks = [createPick(4, 0, 1)]
      const results = [createResult(4, 0, 1, 3, 4, 2)]

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: 4,
        loserGames: null,
      })

      expect(result.gameScoreDiff).toBeNull()
    })

    it('returns null when finals not played yet', () => {
      const picks = [createPick(4, 0, 1)]
      const results: Result[] = []

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: 4,
        loserGames: 2,
      })

      expect(result.gameScoreDiff).toBeNull()
    })
  })

  describe('16-player bracket scoring', () => {
    const config16: ScoringConfig = {
      opening: 0, // No opening round for 16-player
      round_of_16: 1,
      quarters: 2,
      semis: 3,
      finals: 4,
    }

    it('awards 1 point for round of 16 in 16-player bracket', () => {
      const picks = [createPick(1, 0, 1)]
      const results = [createResult(1, 0, 1, 16)]

      const result = calculateBracketScore(picks, results, config16, {
        winnerGames: null,
        loserGames: null,
      })

      expect(result.score).toBe(1)
    })

    it('awards 3 points for consolation in 16-player bracket (same as semis)', () => {
      const picks = [createPick(5, 0, 3)]
      const results = [createResult(5, 0, 3, 4)]

      const result = calculateBracketScore(picks, results, config16, {
        winnerGames: null,
        loserGames: null,
      })

      // Consolation = semis points = 3 for 16-player
      expect(result.score).toBe(3)
    })
  })

  describe('max score calculation', () => {
    it('calculates max score of 53 for perfect 24-player bracket', () => {
      // All 24 matches: 8 opening + 8 ro16 + 4 quarters + 2 semis + 1 final + 1 consolation
      const picks: Pick[] = []
      const results: Result[] = []

      // Opening: 8 matches (0-7)
      for (let i = 0; i < 8; i++) {
        picks.push(createPick(0, i, i + 9))
        results.push(createResult(0, i, i + 9, 24 - i))
      }

      // Round of 16: 8 matches
      for (let i = 0; i < 8; i++) {
        picks.push(createPick(1, i, i + 1))
        results.push(createResult(1, i, i + 1, i + 9))
      }

      // Quarters: 4 matches
      for (let i = 0; i < 4; i++) {
        picks.push(createPick(2, i, i + 1))
        results.push(createResult(2, i, i + 1, i + 5))
      }

      // Semis: 2 matches
      picks.push(createPick(3, 0, 1))
      picks.push(createPick(3, 1, 3))
      results.push(createResult(3, 0, 1, 2))
      results.push(createResult(3, 1, 3, 4))

      // Final: 1 match
      picks.push(createPick(4, 0, 1))
      results.push(createResult(4, 0, 1, 3))

      // Consolation: 1 match
      picks.push(createPick(5, 0, 2))
      results.push(createResult(5, 0, 2, 4))

      const result = calculateBracketScore(picks, results, defaultConfig, {
        winnerGames: 4,
        loserGames: 2,
      })

      // 8*1 + 8*2 + 4*3 + 2*4 + 1*5 + 1*4 = 8 + 16 + 12 + 8 + 5 + 4 = 53
      expect(result.score).toBe(53)
      expect(result.totalCorrect).toBe(24)
      expect(result.correctChampion).toBe(true)
      expect(result.gameScoreDiff).toBe(0)
    })
  })
})
