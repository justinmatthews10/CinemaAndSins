# CinemaAndSins — Movie Club

A members-only web app for our movie club. Every month one of us picks a movie, we all watch it, review it on a scale of 1–10, and then talk about it.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- **Backend/Auth/DB:** Supabase (Postgres + email auth + row-level security)
- **Movie data:** TMDB API (posters, synopsis, metadata)
- **Hosting:** Vercel
- **Testing:** Vitest (unit/integration) + Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/justinmatthews10/CinemaAndSins.git
cd CinemaAndSins
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `TMDB_API_KEY` | TMDB Bearer token (server only) |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Unit/integration tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint
npm run typecheck    # TypeScript check
```

## Project Structure

This project uses a documentation harness for AI-assisted development. See:

- `AGENTS.md` — Agent rules and conventions
- `harness/README.md` — Harness developer guide
- `harness/cinemaandins-harness.md` — Architecture and data model
- `DESIGN.md` — Full design document
- `ideation/raw-stories.md` — Story breakdown with acceptance criteria

## License

MIT
