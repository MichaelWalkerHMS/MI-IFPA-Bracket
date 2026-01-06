import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FinalScoreInput from '@/components/bracket/FinalScoreInput'

describe('FinalScoreInput', () => {
  const defaultProps = {
    championName: 'Player 1',
    runnerUpName: 'Player 2',
    winnerGames: null,
    loserGames: null,
    onScoreChange: vi.fn(),
    isLocked: false,
    isLoggedIn: true,
  }

  describe('Rendering', () => {
    it('renders all four score options', () => {
      render(<FinalScoreInput {...defaultProps} />)

      expect(screen.getByRole('button', { name: '4-0' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '4-1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '4-2' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '4-3' })).toBeInTheDocument()
    })

    it('displays champion and runner-up names', () => {
      render(<FinalScoreInput {...defaultProps} />)

      expect(screen.getByText('Player 1 vs Player 2')).toBeInTheDocument()
    })

    it('shows "Predict final score" label', () => {
      render(<FinalScoreInput {...defaultProps} />)

      expect(screen.getByText('Predict final score (Best of 7)')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('calls onScoreChange when clicking a score button', async () => {
      const user = userEvent.setup()
      const onScoreChange = vi.fn()

      render(<FinalScoreInput {...defaultProps} onScoreChange={onScoreChange} />)

      await user.click(screen.getByRole('button', { name: '4-1' }))

      expect(onScoreChange).toHaveBeenCalledWith(4, 1)
    })

    it('calls onScoreChange with correct values for each option', async () => {
      const user = userEvent.setup()
      const onScoreChange = vi.fn()

      render(<FinalScoreInput {...defaultProps} onScoreChange={onScoreChange} />)

      await user.click(screen.getByRole('button', { name: '4-0' }))
      expect(onScoreChange).toHaveBeenCalledWith(4, 0)

      await user.click(screen.getByRole('button', { name: '4-2' }))
      expect(onScoreChange).toHaveBeenCalledWith(4, 2)

      await user.click(screen.getByRole('button', { name: '4-3' }))
      expect(onScoreChange).toHaveBeenCalledWith(4, 3)
    })

    it('highlights selected score option', () => {
      render(
        <FinalScoreInput
          {...defaultProps}
          winnerGames={4}
          loserGames={2}
        />
      )

      const selectedButton = screen.getByRole('button', { name: '4-2' })
      expect(selectedButton).toHaveClass('bg-[rgb(var(--color-accent-primary))]')
      expect(selectedButton).toHaveClass('text-white')
    })

    it('does not highlight unselected options', () => {
      render(
        <FinalScoreInput
          {...defaultProps}
          winnerGames={4}
          loserGames={2}
        />
      )

      const unselectedButton = screen.getByRole('button', { name: '4-0' })
      expect(unselectedButton).not.toHaveClass('bg-[rgb(var(--color-accent-primary))]')
    })
  })

  describe('Disabled state', () => {
    it('disables all buttons when isLocked is true', () => {
      render(<FinalScoreInput {...defaultProps} isLocked={true} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })

    it('disables all buttons when isLoggedIn is false', () => {
      render(<FinalScoreInput {...defaultProps} isLoggedIn={false} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })

    it('does not call onScoreChange when clicking disabled button', async () => {
      const user = userEvent.setup()
      const onScoreChange = vi.fn()

      render(
        <FinalScoreInput
          {...defaultProps}
          onScoreChange={onScoreChange}
          isLocked={true}
        />
      )

      await user.click(screen.getByRole('button', { name: '4-0' }))

      expect(onScoreChange).not.toHaveBeenCalled()
    })

    it('applies disabled styling when locked', () => {
      render(<FinalScoreInput {...defaultProps} isLocked={true} />)

      const button = screen.getByRole('button', { name: '4-0' })
      expect(button).toHaveClass('cursor-not-allowed')
      expect(button).toHaveClass('text-[rgb(var(--color-text-muted))]')
    })

    it('enables buttons when isLocked is false and isLoggedIn is true', () => {
      render(
        <FinalScoreInput
          {...defaultProps}
          isLocked={false}
          isLoggedIn={true}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Edge cases', () => {
    it('handles null winnerGames and loserGames (no selection)', () => {
      render(
        <FinalScoreInput
          {...defaultProps}
          winnerGames={null}
          loserGames={null}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        // None should have the selected styling
        expect(button).not.toHaveClass('bg-[rgb(var(--color-accent-primary))]')
      })
    })

    it('handles long player names', () => {
      render(
        <FinalScoreInput
          {...defaultProps}
          championName="Very Long Player Name That Might Overflow"
          runnerUpName="Another Long Name"
        />
      )

      expect(
        screen.getByText('Very Long Player Name That Might Overflow vs Another Long Name')
      ).toBeInTheDocument()
    })
  })
})
