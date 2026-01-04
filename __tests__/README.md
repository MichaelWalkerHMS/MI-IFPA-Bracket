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
├── README.md             # This file
├── mocks/
│   ├── handlers.ts       # MSW request handlers for Supabase
│   └── server.ts         # MSW server configuration
├── fixtures/
│   ├── tournaments.ts    # Sample tournament data
│   ├── players.ts        # Sample player data
│   └── brackets.ts       # Sample bracket data
└── unit/
    └── lib/
        └── bracket-constants.test.ts
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

```typescript
import { mockTournament, mockLockedTournament } from '../fixtures/tournaments'
import { mockPlayers, mockPlayerMap } from '../fixtures/players'
import { mockBracket, mockPicks, createPicksMap } from '../fixtures/brackets'

// Use in tests
const picks = createPicksMap(mockPicks)
expect(picks.get('0-0')).toBe(9)
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
