# Tennis Scorigami – Project Overview

## Project Purpose

**Tennis Scorigami** is a web application for exploring the unique and rare scorelines ("scorigami") in professional tennis matches. The project aims to provide interactive visualizations and deep insights into the history and distribution of tennis scores, leveraging both modern web technologies and robust backend data ingestion.

---

## Architecture & Tech Stack

### Frontend

- **Framework:** [Next.js](https://nextjs.org/) (React-based, full-stack web framework)
- **Styling:** Tailwind CSS, Shadcn UI, Radix UI
- **State Management:** Jotai, React Query
- **Data Visualization:** Planned integration with [SigmaJS](https://sigmajs.org/) for graph-based score tree visualizations and D3 for other data-driven visualizations.
- **Database Integration:** Planned use of [Drizzle ORM](https://orm.drizzle.team/) for type-safe, modern database access within the Next.js app.

### Backend

- **Language:** Python
- **Purpose:** Data ingestion, transformation, and database population from external tennis data sources.
- **ORM:** SQLAlchemy (with Alembic for migrations)
- **Database:** PostgreSQL (migrated from Supabase to Aiven for increased storage and flexibility)
- **Code Generation:** `sqlacodegen` for generating SQLAlchemy models from the database schema.

---

## Data Flow

1. **Ingestion:** Python scripts ingest and normalize tennis match data, then populate the PostgreSQL database.
2. **API Layer:** Next.js API routes (and potentially Python FastAPI endpoints) expose tennis data to the frontend.
3. **Frontend:** The Next.js app fetches, processes, and visualizes data, including interactive score trees and scorigami graphs (with SigmaJS).

---

## Key Technologies

- **Next.js:** The core of the web application, enabling SSR, API routes, and a modern developer experience.
- **SigmaJS:** (Planned) For rendering and interacting with large, complex score graphs in the browser.
- **Drizzle ORM:** (Planned) For type-safe, efficient database queries and mutations from the Next.js app.
- **Python Ingestion:** Handles all heavy data lifting, ETL, and ensures the database is always up-to-date with the latest tennis results.

---

## Development Notes

- The backend Python code is primarily for ingestion and database management; all user-facing features are built in Next.js.
- The project is in active development, with SigmaJS and Drizzle integration planned for upcoming releases.
- The database schema is designed for flexibility, supporting rich queries about matches, players, tournaments, and score permutations.

---

## Getting Started

- **Frontend:** `npm run dev` (Next.js)
- **Backend:** Python scripts in `backend/batch-ingestion/`
- **Database:** PostgreSQL (managed via Alembic migrations)

---

## Credits

- Tennis data sourced from Jeff Sackmann and other open datasets.
- Thanks to Aiven for generous database hosting.
