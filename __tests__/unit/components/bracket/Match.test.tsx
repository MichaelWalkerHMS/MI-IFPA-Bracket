import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Match from '@/components/bracket/Match'
import { mockPlayerMap } from '../../../fixtures'

describe('Match', () => {
  const defaultProps = {
    round: 0,
    position: 0,
    topSeed: 9,
    bottomSeed: 24,
    winnerSeed: null,
    playerMap: mockPlayerMap,
    onPick: vi.fn(),
    isLocked: false,
    isLoggedIn: true,
  }

  // Helper to get the match container (inner div with border classes)
  // Match structure: outer wrapper (flex flex-col) > match container (rounded-lg or rounded-t-lg, border) > player slots
  const getMatchContainer = (container: HTMLElement) => {
    // When no result bar: rounded-lg, when result bar present: rounded-t-lg
    return (container.querySelector('.rounded-lg') || container.querySelector('.rounded-t-lg')) as HTMLElement
  }

  describe('Affected Seeds Highlighting', () => {
    it('renders with normal border when no affected seeds', () => {
      const { container } = render(<Match {...defaultProps} />)

      const matchDiv = getMatchContainer(container)
      expect(matchDiv).toHaveClass('border-[rgb(var(--color-border-secondary))]')
      expect(matchDiv).not.toHaveClass('border-[rgb(var(--color-warning-border))]')
    })

    it('renders with normal border when affectedSeeds is empty', () => {
      const { container } = render(<Match {...defaultProps} affectedSeeds={[]} />)

      const matchDiv = getMatchContainer(container)
      expect(matchDiv).toHaveClass('border-[rgb(var(--color-border-secondary))]')
      expect(matchDiv).not.toHaveClass('border-[rgb(var(--color-warning-border))]')
    })

    it('renders with yellow border when topSeed is affected', () => {
      const { container } = render(
        <Match {...defaultProps} affectedSeeds={[9, 10, 11]} />
      )

      const matchDiv = getMatchContainer(container)
      expect(matchDiv).toHaveClass('border-[rgb(var(--color-warning-border))]')
      expect(matchDiv).toHaveClass('border-2')
      expect(matchDiv).not.toHaveClass('border-[rgb(var(--color-border-secondary))]')
    })

    it('renders with yellow border when bottomSeed is affected', () => {
      const { container } = render(
        <Match {...defaultProps} affectedSeeds={[22, 23, 24]} />
      )

      const matchDiv = getMatchContainer(container)
      expect(matchDiv).toHaveClass('border-[rgb(var(--color-warning-border))]')
      expect(matchDiv).toHaveClass('border-2')
    })

    it('renders with yellow border when both seeds are affected', () => {
      const { container } = render(
        <Match {...defaultProps} affectedSeeds={[9, 24]} />
      )

      const matchDiv = getMatchContainer(container)
      expect(matchDiv).toHaveClass('border-[rgb(var(--color-warning-border))]')
    })

    it('renders with normal border when affectedSeeds does not include match seeds', () => {
      const { container } = render(
        <Match {...defaultProps} affectedSeeds={[1, 2, 3]} />
      )

      const matchDiv = getMatchContainer(container)
      expect(matchDiv).toHaveClass('border-[rgb(var(--color-border-secondary))]')
      expect(matchDiv).not.toHaveClass('border-[rgb(var(--color-warning-border))]')
    })

    it('handles null seeds correctly with affectedSeeds', () => {
      const { container } = render(
        <Match
          {...defaultProps}
          topSeed={null}
          bottomSeed={null}
          affectedSeeds={[9, 24]}
        />
      )

      // Should not be affected when both seeds are null (TBD match)
      const matchDiv = getMatchContainer(container)
      expect(matchDiv).toHaveClass('border-[rgb(var(--color-border-secondary))]')
    })
  })

  describe('Rendering', () => {
    it('renders player names for both slots', () => {
      render(<Match {...defaultProps} />)

      expect(screen.getByText('Player 9')).toBeInTheDocument()
      expect(screen.getByText('Player 24')).toBeInTheDocument()
    })

    it('renders TBD when seed is null', () => {
      render(<Match {...defaultProps} topSeed={null} />)

      expect(screen.getByText('TBD')).toBeInTheDocument()
      expect(screen.getByText('Player 24')).toBeInTheDocument()
    })
  })
})
