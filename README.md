# Tennis Scorigami

Explore unique and never-before-seen scorelines in professional tennis history. Tennis Scorigami visualizes every possible score sequence as an interactive graph, revealing which results have occurred and which remain theoretical.

Inspired by [Jon Bois' NFL Scorigami](https://nflscorigami.com/), this project applies the same concept to tennis — where the branching nature of game/set/match scoring creates an enormous tree of possible outcomes.

## Features

- **Interactive 2D Graph** — SigmaJS-powered visualization of the tennis score tree with pan, zoom, and click-to-explore
- **3D Force Graph** — Three.js-based 3D exploration for deeper pattern discovery
- **Match Search** — Find specific matches, players, and tournaments with fuzzy search
- **Advanced Filtering** — Filter by gender, tournament, year, and match format
- **Match Details** — Click any node to see every match that produced that scoreline

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS, Shadcn/Radix UI |
| State | Jotai, React Query |
| Visualization | SigmaJS (2D), 3D Force Graph (Three.js) |
| Database | PostgreSQL on Neon, Drizzle ORM |
| Data Pipeline | Python, SQLAlchemy, Alembic |
| Analytics | PostHog, Vercel Analytics |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/johnlarkin1/tennis-scorigami.git
cd tennis-scorigami

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in DATABASE_URL and any other required values

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Development

```bash
npm run lint          # ESLint
npm run format        # Prettier
npm run typecheck     # TypeScript check
npm test              # Unit tests
npm run test:e2e      # Playwright E2E tests
npm run db:studio     # Drizzle Studio (database UI)
```

## Data Sources

Historical match data comes primarily from [Jeff Sackmann's open-source tennis databases](https://github.com/JeffSackmann/tennis_atp) covering ATP and WTA tours from 1968 onwards.

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change. Run `npm run lint && npm run typecheck` before submitting a PR.

## License

MIT
