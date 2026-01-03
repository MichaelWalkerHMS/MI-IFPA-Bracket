# IFPA Michigan Pinball Bracket Predictor

A web application that allows users to create and save bracket predictions for the IFPA Pinball State Championships (Michigan). Users can predict match outcomes, save their brackets, share them publicly, and compete on a leaderboard for prediction accuracy.

## Tech Stack

- **Frontend:** Next.js 16 with React 19
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript 5.9
- **Backend/Database:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Deployment:** Vercel
- **Domain:** TBD (using Vercel URL initially)

## Data Architecture

### TOURNAMENTS
| Field | Type | Purpose |
|-------|------|---------|
| `id` | uuid | Primary key |
| `name` | text | "2026 Michigan State Championship" |
| `state` | text | "MI" |
| `year` | integer | 2026 |
| `lock_date` | timestamp | When predictions lock |
| `start_date` | timestamp | When tournament begins |
| `end_date` | timestamp | When tournament concludes |
| `player_count` | integer | 16 or 24 |
| `status` | text | 'upcoming', 'in_progress', 'completed' |
| `is_active` | boolean | Show/hide from users |
| `timezone` | text | IANA format, e.g., 'America/New_York' |
| `scoring_config` | jsonb | Points per round, e.g., `{"opening": 1, "round_of_16": 2, "quarters": 3, "semis": 4, "finals": 5}` |
| `matchplay_id` | text | MatchPlay API tournament ID (nullable, for future integration) |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

### PLAYERS
| Field | Type | Purpose |
|-------|------|---------|
| `id` | uuid | Primary key |
| `tournament_id` | uuid | Foreign key to tournaments |
| `name` | text | Player display name |
| `seed` | integer | 1-24 |
| `ifpa_id` | integer | IFPA player ID (nullable, for future API) |
| `matchplay_id` | text | MatchPlay player ID (nullable, for future API) |
| `created_at` | timestamp | Auto-set |

### PROFILES
| Field | Type | Purpose |
|-------|------|---------|
| `id` | uuid | Same as Supabase auth user ID |
| `display_name` | text | Shown on leaderboard/brackets |
| `email` | text | From auth, for reference |
| `is_admin` | boolean | Can enter results |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-updated |

### BRACKETS
| Field | Type | Purpose |
|-------|------|---------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to profiles |
| `tournament_id` | uuid | Foreign key to tournaments |
| `name` | text | Optional bracket name ("My Bold Picks") |
| `is_public` | boolean | Default true |
| `final_winner_games` | integer | Predicted games for champion (1-4) |
| `final_loser_games` | integer | Predicted games for runner-up (0-3) |
| `created_at` | timestamp | When first saved |
| `updated_at` | timestamp | Last modification |

### PICKS
| Field | Type | Purpose |
|-------|------|---------|
| `id` | uuid | Primary key |
| `bracket_id` | uuid | Foreign key to brackets |
| `round` | integer | 0=opening, 1=round of 16, 2=quarters, 3=semis, 4=final, 5=consolation |
| `match_position` | integer | Position within round |
| `winner_seed` | integer | Seed number picked to win |
| `created_at` | timestamp | Auto-set |

### RESULTS
| Field | Type | Purpose |
|-------|------|---------|
| `id` | uuid | Primary key |
| `tournament_id` | uuid | Foreign key to tournaments |
| `round` | integer | Same encoding as picks |
| `match_position` | integer | Position within round |
| `winner_seed` | integer | Actual winner |
| `loser_seed` | integer | Actual loser |
| `winner_games` | integer | Games won |
| `loser_games` | integer | Games lost |
| `created_at` | timestamp | When entered |
| `updated_at` | timestamp | For corrections |

## Tournament Format (Michigan - 24 Players)

- **Opening Round:** Seeds 9-24 play (8 matches), seeds 1-8 get bye
- **Round of 16:** Seeds 1-8 + 8 opening round winners (8 matches)
- **Quarterfinals:** 8 → 4 (4 matches)
- **Semifinals:** 4 → 2 (2 matches)
- **Finals:** Championship match + 3rd/4th consolation match

Total predictions per bracket: 24 matches

### Bracket Pairings (24-player format)
- **Opening Round:** 9v24, 10v23, 11v22, 12v21, 13v20, 14v19, 15v18, 16v17
- **Round of 16:** 1v(16/17 winner), 2v(15/18 winner), 3v(14/19 winner), 4v(13/20 winner), 5v(12/21 winner), 6v(11/22 winner), 7v(10/23 winner), 8v(9/24 winner)
- Winners progress following standard bracket flow

## Scoring System

Points per correct prediction (escalating by round):
- Opening Round: 1 point each (8 max)
- Round of 16: 2 points each (16 max)
- Quarterfinals: 3 points each (12 max)
- Semifinals: 4 points each (8 max)
- Finals: 5 points each (10 max, includes consolation)

**Maximum possible score: 54 points**

### Tiebreakers (in order)
1. Correctly predicted the champion
2. Predicted final match game score (winner_games, loser_games)
3. Total number of correct predictions

### Bracket Rules
- Each user may create only one bracket per tournament
- Brackets are public by default; private brackets are excluded from the leaderboard
- Predictions lock at tournament start time and cannot be modified afterward

## 2026 Michigan State Championship
- **Lock Date:** January 17, 2026, 12:00 PM EST
- **Tournament Dates:** January 17-18, 2026

## MVP Features (Target: January 17, 2026)

1. User authentication (signup, login, logout)
    Users should be able to sign up with an email address and password and log in/log out of the site.
2. View seeded bracket (24 players in proper positions)
    Users should be able to see the starting bracket with all 24 people seeded in their proper place, including those who have byes in the first round.
3. Make predictions (click player name to advance)
    For each game in the bracket, users should be able to click on the player who they believe will win that round - this will advance that player to the next game as the winner.
4. Predict final score (game count for championship match)
    For the final championship game only, users should additionally be able to predict the number of games each player will win - since it is a best of seven, the highest number for either player should be 4.
5. Save bracket to database
    Users should be able to save their bracket (whether complete or in progress) to their profile so it can be retrieved later.
6. View own bracket
    Users should be able to see their bracket once it is saved to their profile. If it is marked public, they should also be able to view it with a static link.
7. Public/private toggle (default public)
    Users should be able to set their bracket to either public or private (default public). If it is marked private, it will not appear in the public leaderboard nor will it be accessible via a link unless the owner is logged in.
8. Shareable link for any public bracket
    If the bracket is public, users should be able to provide a link to share it to friends.
9. Browse public brackets
    Users should be able to see all submitted public brackets on the leaderboard, even before the tournament begins.
10. Lock predictions at deadline (Jan 17, 12:00 EST)
    Users should no longer be able to change a submitted bracket nor submit a new bracket after the lock date for the tournament.
11. Admin: Enter match results
    As an administrator, I should have a very simple UI to quickly enter the winners of each match.
12. View actual vs predicted comparison
    Once actual results begin coming in, users should see real-time updates on their bracket, including their score.
13. Leaderboard with scoring and tiebreakers
    A public leaderboard should be visible tracking the scoring of all brackets marked as public, including tiebreaker logic.

## Stretch Goals

- Social media preview cards (Open Graph for Facebook)
- Real-time leaderboard updates
- Bracket export as image
- Email notifications for results
- MatchPlay API integration for seeds/results
- Custom SMTP for branded auth emails (sender name, from address)
- Lock out users after too many failed login attempts

## Project Phases

### Phase 1: Foundation (Days 1-3)
- Initialize Next.js project with Tailwind
- Set up Supabase project (database, auth)
- Create database tables with RLS policies
- Basic auth flow (signup/login/logout)
- Deploy skeleton to Vercel

### Phase 2: Bracket Core (Days 4-7)
- Build bracket visualization component
- Implement click-to-advance interaction
- Add final score prediction input
- Save/load bracket from database
- Public/private toggle

### Phase 3: Social Features (Days 8-10)
- Shareable bracket URLs
- Browse public brackets page
- Bracket lock logic (time-based)

### Phase 4: Results & Scoring (Days 11-14)
- Admin interface for entering results
- Scoring calculation logic
- Leaderboard with tiebreakers
- Actual vs predicted comparison view

### Phase 5: Polish & Launch (Days 15-17)
- Testing and bug fixes
- Mobile responsiveness
- Seed real player data
- Launch

## Security Considerations

| Concern | Approach |
|---------|----------|
| Unauthorized data access | Supabase Row Level Security |
| Late bracket submissions | Server-side lock enforcement via RLS |
| Admin-only functions | `is_admin` flag in profiles table |
| Secrets in code | Environment variables, `.gitignore` |
| XSS attacks | Input sanitization, React's built-in escaping |
| SQL injection | Supabase parameterized queries (automatic) |
| HTTPS | Vercel automatic SSL |

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Check code quality
npm run lint
```

## Environment Setup

### Supabase Projects
| Environment | Project | URL |
|-------------|---------|-----|
| **Development** | ifpa-bracket-dev | `https://nsmositomvtlhxkghchr.supabase.co` |
| **Production** | ifpa-bracket-predictor | `https://ynxmkbpdnucrbjyvovpq.supabase.co` |

### Local Development
- Uses `.env.local` pointing to DEV Supabase
- Run with `npm run dev`

### Vercel Environments
| Environment | Trigger | Database |
|-------------|---------|----------|
| **Production** | Push to `main` | Prod Supabase |
| **Preview** | Pull requests | Dev Supabase |

## Dev-to-Prod Workflow

### Code Changes (no database changes)
1. Create feature branch from `main`
2. Develop and test locally (uses dev database)
3. Push branch to origin
4. Open PR via `gh pr create`
5. Vercel creates preview deployment (uses dev database)
6. **User reviews PR and tests on preview URL**
7. **User approves and requests merge**
8. Merge to `main` → auto-deploys to production

### Database Schema Changes
1. Make changes in DEV Supabase first (via Dashboard or SQL)
2. Test thoroughly with your code locally
3. Create a migration file:
   ```bash
   npx supabase migration new <descriptive_name>
   ```
4. Write SQL in the generated file (`supabase/migrations/`)
5. Commit migration file with your code
6. After PR merges, apply to production:
   ```bash
   npx supabase link --project-ref ynxmkbpdnucrbjyvovpq
   npx supabase db push
   ```

### Useful Supabase CLI Commands
```bash
# Link to a project
npx supabase link --project-ref <project-ref>

# Pull schema from remote (creates migration file)
npx supabase db pull

# Push migrations to remote
npx supabase db push

# Create new migration
npx supabase migration new <name>

# Check migration status
npx supabase migration list
```

## Code Conventions

- Prioritize readable, simple code over clever solutions
- Add comments only when the "why" isn't obvious from the code itself
- Keep components focused and single-purpose
- Use TypeScript for type safety

## Project Status

**Current Phase:** Phase 2 - Bracket Core (IN PROGRESS)

### Completed
- Repository structure
- Architecture design
- Tech stack selection
- Data model design
- MVP feature list
- Project timeline
- **Next.js project initialized** (manual setup with TypeScript, Tailwind CSS v4, ESLint)
- Basic homepage displaying at http://localhost:3000
- **Supabase project configured** with client utilities for browser and server
- **Database tables created** (tournaments, players, profiles, brackets, picks, results)
- **Row Level Security policies** implemented for all tables
- **Auth session handling** via proxy.ts (Next.js 16 convention)
- Connection tested and verified working
- **Auth flow implemented:**
  - Signup page (`/signup`)
  - Login page (`/login`) with email persistence on error
  - Forgot password page (`/forgot-password`)
  - Reset password page (`/reset-password`)
  - Auth callback route for secure code exchange (`/auth/callback`)
  - Logout functionality on homepage
  - Custom error messages for failed login attempts
- **Deployed to Vercel:**
  - Production URL: https://ifpa-bracket-predictor.vercel.app
  - GitHub integration enabled (auto-deploys on push to main)
  - Environment variables configured (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SITE_URL)
  - Supabase redirect URLs updated for production
- **Dev/Prod environment separation:**
  - Separate Supabase projects for dev and production
  - Local development uses dev database via `.env.local`
  - Vercel Preview deployments use dev database
  - Vercel Production uses production database
  - Supabase CLI configured for migration management
- **Phase 2: Bracket visualization:**
  - TypeScript types for Tournament, Player, Bracket, Pick (`src/lib/types/index.ts`)
  - Bracket structure constants with 24-player format pairings (`src/lib/bracket/constants.ts`)
  - Tournament page with bracket display (`src/app/tournament/[id]/page.tsx`)
  - Bracket components: Bracket, Round, Match, PlayerSlot (`src/components/bracket/`)
  - Click-to-advance interaction with cascade clearing
  - Toggle to deselect picks (click selected winner to clear)
  - Server actions for save/load bracket (`src/app/tournament/[id]/actions.ts`)
  - Public/private toggle for brackets
  - Lock detection (disables editing after tournament lock_date)
  - Seed script for dev database (`npm run seed`)
  - Real Michigan player data from IFPA standings
  - FinalScoreInput component for championship match game prediction (`src/components/bracket/FinalScoreInput.tsx`)

### In Progress
- Phase 3: Social Features

### Next Steps
- Shareable bracket URLs (public link to view any bracket)
- Browse public brackets page
- Phase 4: Results & Scoring (admin interface, leaderboard)

### Backlog
- Admin UI to dynamically update player seeding (add/remove/reorder players)
- Fix seed script output URL (currently shows localhost, should show appropriate URL based on env)
   

## Notes for Claude

- This is a learning project - explain reasoning, don't just implement
- Follow our dev-to-prod pipeline always
- Do not over-engineer or deviate from the initial request - we are only trying to solve one thing at a time
- Plan out everything you intend to do before actually implementing anything; provide that plan to the user for approval
- Testing is a priority - whether manual or code, testing must be completed before each commit
- Always wait for explicit approval before making changes
- Suggest when a commit is appropriate, but do not actually commit without the user's explicit approval
- Never push directly to `main` - always use feature branches and PRs
- Never merge PRs without explicit user approval - wait for user to review and approve first
- When suggesting code, explain what it does and why
- Prioritize MVP features over stretch goals given timeline constraints
- Focus on small features at a time, and stay focused on exactly what we're trying to do - don't go down rabbit holes or try to solve for endless edge cases.
