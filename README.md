# CinemaAndSins — Movie Club

A members-only web app for our movie club. Every month one of us picks a movie, we all watch it, review it on a scale of 1–10, and then talk about it.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Backend/Auth/DB:** Supabase (Postgres + email auth + row-level security)
- **Movie data:** TMDB API (posters, synopsis, metadata)
- **Hosting:** Vercel
- **Testing:** Vitest (unit/integration) + Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- A [TMDB](https://www.themoviedb.org/settings/api) API key (free)

### Installation (local dev)

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

| Variable                        | Description                                           |
| ------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for client)                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server only — keep secret) |
| `TMDB_API_KEY`                  | TMDB v3 API key (server only)                         |
| `ADMIN_EMAIL`                   | Your email — first signup with this auto-admins you   |

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
npm run verify       # Full gate: format + lint + typecheck + test + build
```

---

## Production Deployment Guide

This guide walks you through setting up Supabase, configuring the database, and deploying to Vercel.

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Name it (e.g. "CinemaAndSins")
4. Set a database password — save it somewhere safe
5. Choose a region close to you
6. Wait for the project to provision (~2 minutes)

### Step 2: Get Your Supabase API Keys

1. In your Supabase project, go to **Settings** (gear icon) → **API**
2. Copy these three values:

| Field                | Where                                   | Env var                         |
| -------------------- | --------------------------------------- | ------------------------------- |
| **Project URL**      | Top of the page                         | `NEXT_PUBLIC_SUPABASE_URL`      |
| **anon public** key  | Under "Project API keys"                | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** key | Under "Project API keys" (click Reveal) | `SUPABASE_SERVICE_ROLE_KEY`     |

> **Warning:** The service role key bypasses all RLS. Never expose it to the client or commit it to git.

### Step 3: Run Database Migrations

You need to apply the SQL migrations in `supabase/migrations/` to your cloud database. There are two ways:

#### Option A: Supabase CLI (recommended)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push all migrations
supabase db push
```

#### Option B: Supabase SQL Editor (manual)

1. In your Supabase project, go to **SQL Editor**
2. For each file in `supabase/migrations/` (in order by filename):
   - Open the file, copy its contents
   - Paste into SQL Editor
   - Click **Run**
3. Repeat until all migration files have been applied

### Step 4: Set the Admin Email in Supabase

This configures the database so that when you sign up with your email, you're automatically approved and granted admin privileges.

1. In Supabase, go to **SQL Editor**
2. Run this SQL (replace with your email):

```sql
INSERT INTO app_config (key, value) VALUES ('admin_email', 'your-email@example.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### Step 5: Get a TMDB API Key

1. Go to [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Click **Request API Key** → choose **Developer** key
3. Fill out the form (any description works)
4. Copy the **API Key (v3 auth)** value

### Step 6: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub login is easiest)
2. Click **Add New** → **Project**
3. Import the `CinemaAndSins` repository from GitHub
4. Vercel auto-detects Next.js — no framework config needed
5. Under **Environment Variables**, add each variable:

| Variable                        | Value                          |
| ------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Your Supabase service role key |
| `TMDB_API_KEY`                  | Your TMDB API key              |
| `ADMIN_EMAIL`                   | Your email (same as Step 4)    |

6. Click **Deploy**
7. Wait for the build to finish (~2 minutes)
8. Your site is live at your Vercel URL (e.g. `https://cinema-and-sins.vercel.app`)

### Step 7: Update Supabase Auth URLs

After deploying, update the auth redirect URLs so email confirmation links point to your live site instead of localhost:

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://cinema-and-sins.vercel.app`)
3. Under **Redirect URLs**, add `https://cinema-and-sins.vercel.app/**`
4. Keep `http://localhost:3000/**` in the list for local development
5. Click **Save**

### Step 8: Sign Up as Admin

1. Open your deployed site
2. Click **Login** → **Sign up**
3. Use the same email you set in `ADMIN_EMAIL` and Step 4
4. Check your email for the confirmation link — clicking it auto-logs you in
5. You're automatically approved and granted admin — no manual SQL needed

### Step 9: Invite Members

1. As admin, go to **Admin** → **Rotation** tab
2. Add members to the rotation (they need to sign up first)
3. New signups will appear as **Pending** in the **Members** tab
4. Approve them with the **Approve** button
5. Members can now pick movies, review, and participate

### Step 10: Add Historical Data (optional)

If your club has past meetings you want to record:

1. Go to **Admin** → **Past Pick** tab
2. Search for the movie on TMDB
3. Select who picked it and which month/year
4. Set the watch date and a picker note
5. Click **Create Past Pick**
6. Members review it via the review page
7. Lock the pick from the **Picks** tab when all reviews are in
8. Repeat for each past meeting

---

## Project Structure

This project uses a documentation harness for AI-assisted development. See:

- `AGENTS.md` — Agent rules and conventions
- `harness/README.md` — Harness developer guide
- `harness/cinemaandins-harness.md` — Architecture and data model
- `DESIGN.md` — Full design document
- `ideation/raw-stories.md` — Story breakdown with acceptance criteria

## License

MIT
