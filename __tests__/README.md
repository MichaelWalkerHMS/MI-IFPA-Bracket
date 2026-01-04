# Testing Guide

This project uses **Vitest** with **React Testing Library** and **MSW** for testing.

## Quick Start

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode (re-runs on file changes)
npm run test:ui       # Open Vitest UI in browser
npm run test:coverage # Run tests with coverage report
```

## Folder Structure

```
__tests__/
├── setup.ts              # Global test setup (MSW, matchers)
├── test-utils.tsx        # Common test utilities and helpers
├── README.md             # This file
├── mocks/
│   ├── handlers.ts       # MSW request handlers for Supabase
│   └── server.ts         # MSW server configuration
├── fixtures/
│   ├── index.ts          # Central export for all fixtures
│   ├── tournaments.ts    # Sample tournament data
│   ├── players.ts        # Sample player data
│   └── brackets.ts       # Sample bracket data
└── unit/
    ├── lib/              # Pure function tests
    └── components/       # Component tests
```

## Writing Tests

### Unit Tests (Pure Functions)

For pure functions that don't touch the network:

```typescript
import { describe, it, expect } from 'vitest'
import { getPickKey, parsePickKey } from '@/lib/bracket/constants'

describe('getPickKey', () => {
  it('creates correct key format', () => {
    expect(getPickKey(0, 5)).toBe('0-5')
  })
})
```

### Component Tests

For React components with user interactions:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerSlot } from '@/components/bracket/PlayerSlot'

describe('PlayerSlot', () => {
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<PlayerSlot player={mockPlayer} onClick={handleClick} />)

    await user.click(screen.getByText('Player Name'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Tests with Supabase Calls

MSW intercepts HTTP requests automatically. Default handlers return success responses:

```typescript
import { describe, it, expect } from 'vitest'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('saveBracket', () => {
  it('handles save success', async () => {
    // Uses default handler - returns success
    const result = await saveBracket(data)
    expect(result.success).toBe(true)
  })

  it('handles save failure', async () => {
    // Override handler for this test
    server.use(
      http.post('*/rest/v1/brackets', () => {
        return HttpResponse.json({ error: 'Database error' }, { status: 500 })
      })
    )

    const result = await saveBracket(data)
    expect(result.error).toBeDefined()
  })
})
```

## Using Fixtures

Import from the central index for cleaner imports:

```typescript
import {
  mockTournament,
  mockPlayers,
  mockBracket,
  createPicksMap,
} from '../fixtures'

// Use in tests
const picks = createPicksMap(mockPicks)
expect(picks.get('0-0')).toBe(9)
```

## Test Utilities

Import helpers from `test-utils.tsx`:

```typescript
import {
  renderWithUser,    // Render + userEvent.setup() in one call
  createPicksFromArray,
  expectClasses,
  waitForCondition,
} from '../test-utils'

// Example: renderWithUser
const { user, getByRole } = renderWithUser(<MyComponent />)
await user.click(getByRole('button'))

// Example: createPicksFromArray
const picks = createPicksFromArray([
  [0, 0, 9],   // Opening round, position 0, seed 9 wins
  [0, 1, 10],  // Opening round, position 1, seed 10 wins
])

// Example: expectClasses
expectClasses(button, ['bg-blue-600', 'text-white'])
```

## MSW Handlers

Default handlers are defined in `__tests__/mocks/handlers.ts`. They mock:

- `GET /rest/v1/tournaments` - Returns mock tournament list
- `GET /rest/v1/players` - Returns 24 mock players
- `GET/POST/PATCH /rest/v1/brackets` - CRUD operations
- `GET/POST/DELETE /rest/v1/picks` - Pick operations
- `GET /rest/v1/profiles` - User profile

### Overriding Handlers

Use `server.use()` to override for specific tests:

```typescript
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// In your test
server.use(
  http.get('*/rest/v1/tournaments*', () => {
    return HttpResponse.json([]) // Empty list
  })
)
```

Handlers reset after each test automatically.

### Pre-built Error Handlers

Use `errorHandlers` for common error scenarios:

```typescript
import { server } from '../mocks/server'
import { errorHandlers } from '../mocks/handlers'

// Simulate database error
server.use(errorHandlers.databaseError)

// Simulate unauthorized (JWT expired)
server.use(errorHandlers.unauthorized)

// Simulate RLS policy violation
server.use(errorHandlers.forbidden)

// Simulate bracket save failure
server.use(errorHandlers.bracketSaveFailed)

// Simulate tournament not found
server.use(errorHandlers.tournamentNotFound)
```

### Handler Factories

Create custom handlers with specific data:

```typescript
import {
  createTournamentHandler,
  createPlayersHandler,
  createBracketsHandler,
} from '../mocks/handlers'

// Return specific tournaments
server.use(createTournamentHandler([myCustomTournament]))

// Return 16 players instead of 24
server.use(createPlayersHandler('tournament-id', 16))

// Return existing brackets
server.use(createBracketsHandler([existingBracket]))
```

## Coverage

Run `npm run test:coverage` to generate a coverage report. View the HTML report in `coverage/index.html`.

Current coverage targets (not enforced):
- Statements: 70%+
- Branches: 60%+
- Functions: 70%+
- Lines: 70%+

## Tips

1. **Test behavior, not implementation** - Focus on what the user sees/does
2. **Use fixtures** - Avoid repeating test data setup
3. **One assertion per test** - When possible, test one thing at a time
4. **Name tests descriptively** - `it('shows error when save fails')` not `it('test error')`
5. **Keep tests fast** - MSW keeps tests fast by avoiding real network calls
