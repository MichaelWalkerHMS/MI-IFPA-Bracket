# Pinball Brackets

A free, community-driven bracket prediction app for IFPA Pinball State Championship tournaments. Think March Madness, but for competitive pinball.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://pinball-brackets.vercel.app)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet)](https://claude.ai)

## About

This is something I wanted for myself, and I figured there may be a few other pinball players that would like to make some brackets too.

Last year, I was frustrated when I couldn't find an easy, free way to fill out a prediction bracket while watching friends play in the IFPA State Championship.

This year, I had some time over Christmas break and decided to give Claude Code a try. This site is the result - I gave direction and iterated through bug fixes/design/etc., but **all code was created by Anthropic's Claude Code terminal/agent**. It's been fun.

## Features

- **Bracket Creation** - Predict winners for each match in a tournament bracket
- **Multiple Brackets** - Create as many brackets per tournament as you'd like
- **Public/Private Options** - Keep brackets private or show them on the leaderboard
- **Live Scoring** - Points awarded for correct predictions, with later rounds worth more
- **Leaderboards** - See how your predictions compare to others
- **Tiebreakers** - Champion prediction and game score accuracy break ties
- **Mobile Friendly** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/MichaelWalkerHMS/MI-IFPA-Bracket.git
   cd MI-IFPA-Bracket
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |

## Scoring

Points are awarded for each correct prediction:

**24-player tournaments (53 points max):**
- Opening Round: 1 point
- Round of 16: 2 points
- Quarterfinals: 3 points
- Semifinals: 4 points
- Finals: 5 points
- 3rd/4th Place: 4 points

**16-player tournaments (29 points max):**
- Round of 16: 1 point
- Quarterfinals: 2 points
- Semifinals: 3 points
- Finals: 4 points
- 3rd/4th Place: 3 points

## Contributing

This is a personal side project, but feedback and suggestions are welcome! Feel free to open an issue if you find bugs or have ideas for improvements.

## Author

**Michael Walker** - Pinball player from Michigan

## Acknowledgments

- [IFPA](https://www.ifpapinball.com) - International Flipper Pinball Association
- [Anthropic](https://anthropic.com) - Claude Code made this project possible
