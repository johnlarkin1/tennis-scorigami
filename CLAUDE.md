# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tennis Scorigami – Project Overview

**Tennis Scorigami** is a web application for exploring unique and rare scorelines ("scorigami") in professional tennis matches. The project provides interactive visualizations and insights into tennis score history through modern web technologies and robust data pipelines.

## Architecture & Tech Stack

### Frontend

- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS with custom tennis theming, Shadcn UI, Radix UI
- **State Management:** Jotai
- **Data Visualization:** SigmaJS for 2D graphs, 3D Force Graph for interactive exploration
- **Database Integration:** Drizzle ORM for type-safe PostgreSQL access
- **Testing:** Jest + React Testing Library (unit), Playwright (E2E), Storybook (components)

### Backend

- **Language:** Python
- **ORM:** SQLAlchemy with Alembic migrations
- **Database:** PostgreSQL on Neon (5GB, migrated from Supabase)
- **Data Sources:** Sackmann datasets, SportRadar API
- **Code Generation:** `sqlacodegen` for SQLAlchemy models

## Development Commands

### Common Development Tasks

```bash
# Development
npm run dev                 # Start Next.js dev server with Turbopack
npm run build              # Production build
npm start                  # Start production server

# Code Quality (run these before committing)
npm run lint               # ESLint check
npm run lint:fix           # Fix ESLint issues
npm run format             # Format with Prettier
npm run format:check       # Check Prettier formatting
npm run typecheck          # TypeScript compilation check

# Database Operations
npm run db:generate        # Generate Drizzle migrations
npm run db:push           # Push schema changes to database
npm run db:migrate        # Run pending migrations
npm run db:studio         # Open Drizzle Studio
npm run db:seed           # Seed database with sample data

# Testing
npm test                  # Run Jest unit tests
npm run test:watch        # Jest in watch mode
npm run test:coverage     # Generate test coverage report
npm run test:e2e          # Run Playwright E2E tests
npm run test:e2e:ui       # Run E2E tests with UI mode

# Development Tools
npm run storybook         # Start Storybook for component docs
npm run commit            # Conventional commits with Commitizen
```

## Application Structure

### App Router Pages

- `/` - Landing page with hero and unscored matches
- `/explore` - Main data exploration with graph visualizations
- `/search` - Search matches and players
- `/about` - Project information
- `/theory` - Scorigami concept explanation

### API Routes (`/src/app/api/v1/`)

- `/matches` - Match data with filtering
- `/scores` - Score sequence data
- `/graph` - Graph visualization data (nodes/edges)
- `/search` - Search functionality
- `/tournaments` - Tournament information
- `/filters` - Available filter options

### Key Directories

- `/src/components/` - React components organized by feature (landing, graph, search, layout, ui)
- `/src/db/` - Drizzle schema, migrations, and database utilities
- `/src/lib/` - Shared utilities and configurations
- `/src/types/` - TypeScript type definitions
- `/backend/` - Python data ingestion pipeline
- `/e2e/` - Playwright end-to-end tests

## Database Architecture

### Frontend (Drizzle ORM)

- Connection pooling for performance
- Materialized views for graph data optimization
- Type-safe schema definitions in `/src/db/schema/`
- Migrations managed via Drizzle Kit

### Backend (Python Pipeline)

- SQLAlchemy for data operations
- Batch processing for match ingestion
- Pydantic for data validation
- Alembic for schema migrations

### Key Schema Entities

- Players, matches, tournaments, countries
- Score sequences and match statistics
- Materialized views for performance optimization

## Data Flow

1. **Ingestion:** Python scripts process tennis data and populate PostgreSQL
2. **API Layer:** Next.js API routes serve data to frontend with caching
3. **Visualization:** Frontend renders interactive graphs using SigmaJS and 3D Force Graph
4. **Performance:** Materialized views and connection pooling optimize large dataset queries

## Key Configuration Files

- `next.config.mjs` - PostHog analytics, redirects, trailing slash config
- `tailwind.config.ts` - Tennis-themed colors, custom animations, dark mode
- `drizzle.config.ts` - PostgreSQL connection and migration settings
- `tsconfig.json` - Path aliases (`@/` for `/src/`)

## Testing Strategy

- **Unit Tests:** Components and utilities with Jest + RTL
- **E2E Tests:** User workflows with Playwright (multi-browser)
- **Component Docs:** Interactive examples with Storybook
- **CI/CD:** GitHub Actions for linting, testing, and builds

## Development Notes

- Database migrated from Supabase (500MB limit) to Neon PostgreSQL (5GB)
- SigmaJS integration completed for 2D graph visualization
- Drizzle ORM fully implemented with type-safe database operations
- Python backend handles heavy ETL, Next.js API routes serve real-time queries
- Tennis-themed design system with comprehensive Tailwind configuration
- Materialized views optimize performance for large graph datasets

## Credits

- Tennis data from Jeff Sackmann and open datasets
- Database hosting by Neon
