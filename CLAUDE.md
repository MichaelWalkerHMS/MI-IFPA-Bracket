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

## Current Status

**Phase 3: Social Features** (in progress)
- 🔄 Leaderboard with tiebreakers
- 🔄 Bracket lock logic (time-based)

**Next:** Phase 4 - Results & Scoring (admin interface)

**Backlog:**
- Admin UI for player seeding
- Fix seed script URL output
- Accommodate 16 player tournaments
- Improve UI for selecting which tournament you want to create a bracket for
- User dashboard for the tournaments they have predicted
- Allow for multiple brackets per user

## Working with Me

- This is a learning project — explain reasoning, don't just implement
- Plan before implementing; get approval before changes
- One small feature at a time; don't over-engineer or go down rabbit holes
- Testing required before each commit
- Security is an absolute priority - review your own code to ensure that it conforms to best practices
- Never commit/push/merge without explicit approval
- Prioritize MVP over stretch goals (deadline: Jan 17, 2026)