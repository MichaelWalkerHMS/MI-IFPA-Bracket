# IFPA Michigan Pinball Bracket Predictor

A web application that allows users to create and save bracket predictions for the IFPA Pinball State Championships (Michigan). Users can predict match outcomes, save their brackets, share them publicly, and compete on a leaderboard for prediction accuracy.

## Tech Stack

- **Frontend:** Next.js with React
- **Styling:** Tailwind CSS
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
2. View seeded bracket (24 players in proper positions)
3. Make predictions (click player name to advance)
4. Predict final score (game count for championship match)
5. Save bracket to database
6. View own bracket
7. Public/private toggle (default public)
8. Shareable link for any public bracket
9. Browse public brackets
10. Lock predictions at deadline (Jan 17, 12:00 EST)
11. Admin: Enter match results
12. View actual vs predicted comparison
13. Leaderboard with scoring and tiebreakers

## Stretch Goals

- Social media preview cards (Open Graph for Facebook)
- Real-time leaderboard updates
- Bracket export as image
- Email notifications for results
- MatchPlay API integration for seeds/results

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

Commands will be added once project is initialized:
```
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Code Conventions

- Prioritize readable, simple code over clever solutions
- Add comments only when the "why" isn't obvious from the code itself
- Keep components focused and single-purpose
- Use TypeScript for type safety

## Project Status

**Current Phase:** Planning complete, ready to begin Phase 1

Completed:
- Repository structure
- Architecture design
- Tech stack selection
- Data model design
- MVP feature list
- Project timeline

Next steps:
- Initialize Next.js project
- Set up Supabase

## Notes for Claude

- This is a learning project - explain reasoning, don't just implement
- Always wait for explicit approval before making changes
- Do NOT make any Git commits - the user will handle all version control operations
- When suggesting code, explain what it does and why
- Prioritize MVP features over stretch goals given timeline constraints
