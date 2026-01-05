/**
 * Test utilities for common testing patterns.
 * Import these helpers to reduce boilerplate in test files.
 */

import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

// Re-export everything from testing-library for convenience
export * from '@testing-library/react'
export { userEvent }

/**
 * Custom render function that sets up userEvent automatically.
 * Returns both the render result and a configured user instance.
 *
 * @example
 * const { user, getByRole } = renderWithUser(<MyComponent />)
 * await user.click(getByRole('button'))
 */
export function renderWithUser(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  }
}

/**
 * Create a mock function that tracks calls and can be asserted on.
 * Wrapper around vi.fn() for convenience.
 */
import { vi, expect } from 'vitest'
export { vi, expect }

/**
 * Wait for a condition to be true, with timeout.
 * Useful for async state updates.
 *
 * @example
 * await waitForCondition(() => screen.queryByText('Loaded') !== null)
 */
export async function waitForCondition(
  condition: () => boolean,
  { timeout = 1000, interval = 50 } = {}
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`)
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

/**
 * Create a deferred promise for testing async flows.
 * Useful when you need to control when a promise resolves.
 *
 * @example
 * const deferred = createDeferred<string>()
 * mockFn.mockReturnValue(deferred.promise)
 * // ... trigger the async action ...
 * deferred.resolve('result')
 */
export function createDeferred<T>() {
  let resolve: (value: T) => void = () => {}
  let reject: (reason?: unknown) => void = () => {}

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

/**
 * Helper to create a picks Map from an array of [round, position, seed] tuples.
 *
 * @example
 * const picks = createPicksFromArray([
 *   [0, 0, 9],  // Opening round, position 0, seed 9 wins
 *   [0, 1, 10], // Opening round, position 1, seed 10 wins
 * ])
 */
export function createPicksFromArray(
  picksArray: Array<[round: number, position: number, winnerSeed: number]>
): Map<string, number> {
  const picks = new Map<string, number>()
  for (const [round, position, winnerSeed] of picksArray) {
    picks.set(`${round}-${position}`, winnerSeed)
  }
  return picks
}

/**
 * Assert that an element has specific CSS classes.
 * More readable than multiple toHaveClass calls.
 *
 * @example
 * expectClasses(button, ['bg-blue-600', 'text-white'])
 */
export function expectClasses(
  element: HTMLElement,
  expectedClasses: string[]
): void {
  for (const className of expectedClasses) {
    expect(element).toHaveClass(className)
  }
}

/**
 * Assert that an element does NOT have specific CSS classes.
 *
 * @example
 * expectNotClasses(button, ['bg-gray-300', 'cursor-not-allowed'])
 */
export function expectNotClasses(
  element: HTMLElement,
  unexpectedClasses: string[]
): void {
  for (const className of unexpectedClasses) {
    expect(element).not.toHaveClass(className)
  }
}
