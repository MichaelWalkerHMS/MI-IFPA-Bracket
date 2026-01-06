# IFPA Michigan Pinball Bracket Predictor

Bracket prediction app for IFPA pinball tournaments.

## Domain Context

### Tournament Format (24 Players)
- **Opening Round:** Seeds 9-24 play (8 matches), seeds 1-8 get bye
- **Round of 16:** Seeds 1-8 + 8 opening round winners
- **Quarterfinals → Semifinals → Finals** (includes 3rd/4th consolation)

### Bracket Pairings (24 Players)
- **Opening Round:** 9v24, 10v23, 11v22, 12v21, 13v20, 14v19, 15v18, 16v17
- **Round of 16:** 1v(16/17 winner), 2v(15/18 winner), etc.

### Scoring
**24-player bracket (53 points max):**
- Opening: 1pt (8 matches = 8pts)
- Round of 16: 2pt (8 matches = 16pts)
- Quarters: 3pt (4 matches = 12pts)
- Semis: 4pt (2 matches = 8pts)
- Finals: 5pt (1 match = 5pts)
- Consolation: 4pt (1 match = 4pts) ← same as semis

**16-player bracket (35 points max):**
- Round of 16: 1pt (8 matches = 8pts)
- Quarters: 2pt (4 matches = 8pts)
- Semis: 3pt (2 matches = 6pts)
- Finals: 4pt (1 match = 4pts)
- Consolation: 3pt (1 match = 3pts) ← same as semis

### Tiebreakers (in order)
1. Correctly predicted champion (true > false)
2. Game score difference: sum of |predicted - actual| for winner_games + loser_games (lower is better)
3. Total correct predictions (higher is better)

### Data Encoding
- `round`: 0=opening, 1=round of 16, 2=quarters, 3=semis, 4=final, 5=consolation

## Architecture

- Next.js 16 on Vercel (auto-deploys from main)
- Supabase for auth + database with Row Level Security
- **Dev:** ifpa-bracket-dev (`nsmositomvtlhxkghchr`)
- **Prod:** ifpa-bracket-predictor (`ynxmkbpdnucrbjyvovpq`)
- Local + Vercel Preview → Dev Supabase; Production → Prod Supabase

## Dev-to-Prod Workflow

### Code changes
Feature branch → PR → Preview deployment (dev DB) → User reviews → Merge to main

### Database changes
1. Make changes in DEV Supabase first
2. Test locally
3. `npx supabase migration new <name>`
4. Commit migration file with code
5. After merge: `npx supabase link --project-ref ynxmkbpdnucrbjyvovpq && npx supabase db push`

## Development Notes

### Restarting Dev Server (Windows)
When starting the dev server, first kill any existing process on port 3000:
1. `netstat -ano | findstr :3000 | findstr LISTENING` (get PID)
2. `powershell -Command "Stop-Process -Id <PID> -Force"`
3. `npm run dev`

## Testing

### Unit Tests
- **Stack:** Vitest + React Testing Library + MSW
- **Run tests:** `npm test` | `npm run test:watch` | `npm run test:coverage`
- **Structure:** `__tests__/unit/`, `__tests__/mocks/`, `__tests__/fixtures/`
- **Mocking:** MSW intercepts Supabase HTTP calls (see `__tests__/mocks/handlers.ts`)
- **Docs:** See `__tests__/README.md` for patterns and examples

### E2E Tests
- **Stack:** Playwright (Chrome, Firefox, Safari + mobile emulation)
- **Location:** `e2e/` directory
- **Run:** `npm run test:e2e` | `npm run test:e2e:ui` (visual debugger)
- **CI:** Runs automatically on PRs via GitHub Actions
- **Docs:** See `feature-plans/e2e-tests/implementation-plan.md` for setup details

### E2E Test Requirements
- **New features:** Must include E2E test for the user journey
- **Bug fixes:** Add regression test if the bug was user-facing
- **UI changes:** Update affected E2E tests
- **When to skip E2E:** Pure refactoring, backend-only changes covered by unit tests, documentation updates

### E2E Test User
- Tests use dedicated `e2e-test@` user (credentials in `.env.test`)
- Never commit test credentials
- Tests clean up their own data (brackets, picks)

## Current Status

**Phase 5: Leaderboard Scoring** (in progress)
- Cached scores in `brackets` table (score, correct_champion, game_score_diff, total_correct)
- Auto-recalculates when admin saves/deletes/clears results
- Admin "Recalculate All Scores" button for emergency recovery
- Key files:
  - `src/lib/scoring/calculateScore.ts` - pure scoring logic
  - `src/lib/scoring/recalculateScores.ts` - batch update function
  - `src/app/admin/tournament/[id]/actions.ts` - result mutation triggers

**Completed phases:**
- Phase 1: Core bracket UI
- Phase 2: Bracket persistence
- Phase 3: Social features (leaderboard, lock logic)
- Phase 4: Admin interface & results (including seeding change warnings)

**Backlog:**
- Admin button on homepage (visible only to admins)
- Add single player UI in admin (without bulk import)
- Add rename/edit player function in admin (to change name without delete+reimport)
- Fix seed script URL output
- Accommodate 16 player tournaments
- Improve UI for selecting which tournament you want to create a bracket for
- User dashboard for the tournaments they have predicted
- Allow for multiple brackets per user
- Add ability to name/rename brackets during creation and editing
- Show "(private)" indicator next to user's private brackets in leaderboard
- Remove ability to manually add more than 4 wins on final match results page
- Add earned score indicator (✓/✗) for every match on bracket view
- Add round score subtotals to bracket UI (e.g., "Opening: 6/8")
- Improve Leaderboard UI - at minimum, Score needs better highlighting or visibility
- Review E2E setup for cloned repos (graceful handling when secrets/test user unavailable)

## PR Requirements

Code review checklist for maintaining code quality:

- **Results mutations**: Any PR touching result save/delete/clear must verify `recalculateScores()` is called

## Working with Me

- Always follow the Dev-to-Prod Workflow for every change
- This is a learning project — explain reasoning, don't just implement
- Plan before implementing; get approval before changes
- One small feature at a time; don't over-engineer or go down rabbit holes
- Testing required before each commit
- Security is an absolute priority - review your own code to ensure that it conforms to best practices
- Never commit/push/merge without explicit approval
- Prioritize MVP over stretch goals (deadline: Jan 17, 2026)