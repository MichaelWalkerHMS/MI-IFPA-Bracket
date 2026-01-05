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

### Scoring (54 points max)
## 24 Player Bracket
- Opening: 1pt | Round of 16: 2pt | Quarters: 3pt | Semis: 4pt | Finals: 5pt
## 16 Player Bracket
- Round of 16: 1pt | Quarters: 2pt | Semis: 3pt | Finals: 4pt

### Tiebreakers (in order)
1. Correctly predicted champion
2. Predicted final match game score
3. Total correct predictions

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

- **Stack:** Vitest + React Testing Library + MSW
- **Run tests:** `npm test` | `npm run test:watch` | `npm run test:coverage`
- **Structure:** `__tests__/unit/`, `__tests__/mocks/`, `__tests__/fixtures/`
- **Mocking:** MSW intercepts Supabase HTTP calls (see `__tests__/mocks/handlers.ts`)
- **Docs:** See `__tests__/README.md` for patterns and examples

## Current Status

**Phase 4: Admin Interface & Results** (in progress)
- ✅ Phase 4A-C: Admin interface (`/admin`) with tournament/player management
- ✅ Phase 4D: Results entry interface (PR #10 pending merge)
- 🔲 Phase 4E: Bracket warning banner for seeding changes

**Phase 4E Requirements:**
When viewing a bracket, if seeding changed after the bracket was created:
1. Query `seeding_change_log` for changes where `created_at > bracket.created_at`
2. If changes found, show warning banner: "Seeding changed on [date]. Review your picks."
3. Collect all `affected_seeds` from the log entries
4. Pass affected seeds to bracket components
5. Highlight matches involving affected seeds (yellow border or ⚠️ icon)

Key files:
- `src/components/bracket/Bracket.tsx` - main bracket component to update
- `src/app/bracket/[id]/page.tsx` - bracket view page
- `supabase/migrations/20260104100000_add_seeding_change_log.sql` - the log table

**Completed phases:**
- Phase 1: Core bracket UI
- Phase 2: Bracket persistence
- Phase 3: Social features (leaderboard, lock logic)

**Backlog:**
- Admin button on homepage (visible only to admins)
- Add single player UI in admin (without bulk import)
- Fix seed script URL output
- Accommodate 16 player tournaments
- Improve UI for selecting which tournament you want to create a bracket for
- User dashboard for the tournaments they have predicted
- Allow for multiple brackets per user
- Add ability to name/rename brackets during creation and editing
- Show "(private)" indicator next to user's private brackets in leaderboard

## Working with Me

- Always follow the Dev-to-Prod Workflow for every change
- This is a learning project — explain reasoning, don't just implement
- Plan before implementing; get approval before changes
- One small feature at a time; don't over-engineer or go down rabbit holes
- Testing required before each commit
- Security is an absolute priority - review your own code to ensure that it conforms to best practices
- Never commit/push/merge without explicit approval
- Prioritize MVP over stretch goals (deadline: Jan 17, 2026)