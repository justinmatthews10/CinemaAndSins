# CinemaAndSins — Integration Harness

> **Status:** Initialization — harness and skills scaffolded, no stories implemented yet
> **Last Updated:** 2026-07-29
> **Purpose:** Single source of truth for architecture, data model, page inventory, and implementation state.

---

## 1. Executive Summary

- **Project:** CinemaAndSins Movie Club
- **Repo:** `CinemaAndSins`
- **Type:** Next.js 16 web application (App Router, TypeScript, Tailwind CSS 4)
- **Backend/Auth/DB:** Supabase (Postgres + email auth + row-level security)
- **Movie data:** TMDB API (free) for posters, synopsis, year, director, runtime, genre
- **Hosting:** Vercel (auto-deploys from GitHub on every push to `main`)
- **Goal:** Members-only web app for scheduling monthly movie picks, recording 1–10 scores and written reviews, and archiving club history

---

## 2. Architecture & Design Decisions

### 2.1 Core Components

- **Auth Layer:** Supabase email authentication. Members sign up with email + password. Admin approves pending signups. Only approved emails get member access.
- **Data Layer:** Supabase Postgres with row-level security (RLS). Public can read approved content; only authenticated members can write. Admin has elevated privileges.
- **Movie Data Layer:** TMDB API integration via server-side API routes. Search, fetch metadata, posters. API key never exposed to client.
- **Rotation System:** Admin-managed ordered list of member IDs. Cycles through all members for monthly picks. Handles absences (skip + bump).
- **Scoring System:** 1–10 scale (whole numbers or decimals — TBD, see Open Questions in DESIGN.md). Straight mean average across all reviewers. Minimum review count for all-time rankings.
- **UI Layer:** Next.js App Router. Server Components by default. Client Components only for interactive forms (review submission, movie search, admin actions).

### 2.2 Data Flow & Storage

- **Storage:** Supabase Postgres. All persistent data lives in Supabase.
- **Public reads:** RLS policy allows `SELECT` on `movies`, `picks`, `reviews`, and `members` (limited columns) for all users.
- **Member writes:** RLS policy allows `INSERT`/`UPDATE` on `reviews` where `auth.uid() = member_id`. Allows `INSERT` on `picks` where the member is the assigned picker.
- **Admin writes:** RLS policy allows all operations for admin-flagged members.
- **TMDB cache:** Movie metadata fetched from TMDB is stored in the `movies` table to avoid repeated API calls. Posters are referenced by TMDB image URL.

### 2.3 Security & Authentication

- **Authentication:** Supabase email auth. Email + password.
- **Authorization:** Supabase RLS policies. No application-level authorization logic.
- **Secrets Management:** TMDB API key and Supabase keys in environment variables. `.env.local` for development, Vercel env vars for production.
- **Client-side Supabase:** Only the anon key is used client-side. Service role key is server-side only.
- **TMDB API:** All TMDB calls go through server-side API routes (`app/api/tmdb/`). API key never sent to the browser.

### 2.4 Design Decisions

- **Next.js App Router** over Pages Router — modern, server components, streaming
- **Supabase** over custom backend — free tier, built-in auth, RLS, Postgres
- **TMDB API** over manual movie entry — auto-fills posters and metadata, reduces friction
- **Vercel** over other hosting — zero-config Next.js deployment, auto-deploys from GitHub
- **Tailwind CSS** over styled-components — fast, consistent, easy dark theme

---

## 3. Data Model

### `members`

| Column      | Type        | Notes                              |
| ----------- | ----------- | ---------------------------------- |
| id          | uuid        | PK, references `auth.users`        |
| email       | text        | unique                             |
| name        | text        | display name                       |
| avatar_url  | text        | nullable                           |
| is_admin    | boolean     | default false                      |
| is_approved | boolean     | default false (admin must approve) |
| created_at  | timestamptz | default now()                      |

### `movies`

| Column     | Type        | Notes                          |
| ---------- | ----------- | ------------------------------ |
| id         | uuid        | PK                             |
| tmdb_id    | integer     | nullable (if entered manually) |
| title      | text        |                                |
| year       | integer     |                                |
| director   | text        |                                |
| runtime    | integer     | minutes                        |
| poster_url | text        |                                |
| synopsis   | text        |                                |
| genres     | text[]      |                                |
| created_at | timestamptz | default now()                  |

### `picks`

| Column           | Type        | Notes                             |
| ---------------- | ----------- | --------------------------------- |
| id               | uuid        | PK                                |
| movie_id         | uuid        | FK → movies                       |
| picker_member_id | uuid        | FK → members                      |
| month            | integer     | 1–12                              |
| year             | integer     |                                   |
| watch_date       | date        | meeting date                      |
| picker_note      | text        | "Why I picked this"               |
| status           | text        | `upcoming` / `current` / `locked` |
| created_at       | timestamptz | default now()                     |

### `reviews`

| Column      | Type         | Notes                                   |
| ----------- | ------------ | --------------------------------------- |
| id          | uuid         | PK                                      |
| pick_id     | uuid         | FK → picks                              |
| member_id   | uuid         | FK → members                            |
| score       | numeric(3,1) | 1.0–10.0                                |
| review_text | text         | markdown supported                      |
| tags        | text[]       | nullable (e.g. "rewatch", "first time") |
| created_at  | timestamptz  | default now()                           |
| updated_at  | timestamptz  | default now()                           |

### `rotation`

| Column      | Type        | Notes                |
| ----------- | ----------- | -------------------- |
| id          | uuid        | PK                   |
| order_index | integer     | position in rotation |
| member_id   | uuid        | FK → members         |
| is_active   | boolean     | default true         |
| updated_at  | timestamptz | default now()        |

### RLS Policies (summary)

| Table    | Public                                    | Member                                                      | Admin |
| -------- | ----------------------------------------- | ----------------------------------------------------------- | ----- |
| members  | SELECT (id, name, avatar_url, created_at) | SELECT (all own) + UPDATE (own profile)                     | ALL   |
| movies   | SELECT                                    | SELECT + INSERT (when assigned picker)                      | ALL   |
| picks    | SELECT                                    | SELECT + INSERT (when assigned picker) + UPDATE (own picks) | ALL   |
| reviews  | SELECT                                    | SELECT + INSERT/UPDATE (own reviews)                        | ALL   |
| rotation | SELECT                                    | SELECT                                                      | ALL   |

---

## 4. Page Inventory

| Route                 | Type             | Description                            |
| --------------------- | ---------------- | -------------------------------------- |
| `/`                   | Server Component | Home / Current Movie of the Month      |
| `/schedule`           | Server Component | Upcoming picks timeline                |
| `/history`            | Server Component | Archive grid with sort/filter/search   |
| `/movies/[id]`        | Server Component | Movie detail with reviews              |
| `/add-movie`          | Client Component | Member's pick submission (TMDB search) |
| `/review/[pickId]`    | Client Component | Submit/edit review                     |
| `/profile/[memberId]` | Server Component | Member profile with stats              |
| `/stats`              | Server Component | Club-wide insights                     |
| `/admin`              | Client Component | Admin dashboard                        |
| `/login`              | Client Component | Email + password login                 |
| `/signup`             | Client Component | Email + password signup                |
| `/api/tmdb/search`    | Route Handler    | TMDB movie search (server-side)        |
| `/api/tmdb/[id]`      | Route Handler    | TMDB movie details (server-side)       |

---

## 5. Feature Dependency Graph

```text
v1 Release
  ├── CAS-001: Project scaffolding (Next.js, Tailwind, ESLint, Vitest, Playwright)
  ├── CAS-002: Supabase setup (project, schema, migrations, RLS policies)
  │     ├── CAS-003: Auth (email signup/login, member approval flow)
  │     ├── CAS-004: TMDB integration (server-side search + fetch)
  │     │     └── CAS-005: Add Movie page (pick submission with TMDB search)
  │     ├── CAS-006: Home / Current Movie of the Month
  │     ├── CAS-007: Schedule page (rotation timeline)
  │     │     └── CAS-008: Rotation management (admin drag-to-reorder)
  │     ├── CAS-009: Submit Review page (score slider + markdown review)
  │     ├── CAS-010: Movie Detail page (metadata + score distribution + individual reviews)
  │     ├── CAS-011: History / Archive page (grid, sort, filter, search)
  │     ├── CAS-012: Member Profile page (stats, pick/review history)
  │     ├── CAS-013: Stats / Insights page (club-wide analytics)
  │     └── CAS-014: Admin Dashboard (member management, lock/unlock months)
  └── CAS-015: Vercel deployment + production env setup
```

---

## 6. Story Status Matrix

| ID      | Title                     | Status      | Agent Checkpoint                                                       |
| ------- | ------------------------- | ----------- | ---------------------------------------------------------------------- |
| CAS-001 | Project scaffolding       | Complete    | Tooling + test harness ready                                           |
| CAS-002 | Supabase setup            | Complete    | Local Supabase + migrations + RLS + seed + 8 integration tests         |
| CAS-003 | Auth (email signup/login) | Complete    | AuthProvider, login/signup/pending pages, proxy.ts, 11 unit tests      |
| CAS-004 | TMDB integration          | Complete    | lib/tmdb.ts, 2 API routes, 19 unit tests                               |
| CAS-005 | Add Movie page            | Complete    | /add-movie picker page, TmdbSearch, picks helpers, 18 unit tests       |
| CAS-006 | Home / Current Movie      | Complete    | / page, MovieHero, getCurrentPick, PosterImage, ui constants, 21 tests |
| CAS-007 | Schedule page             | Complete    | /schedule page, ScheduleTimeline, getSchedule helper, 12 unit tests    |
| CAS-008 | Rotation management       | Not Started | —                                                                      |
| CAS-009 | Submit Review page        | Not Started | —                                                                      |
| CAS-010 | Movie Detail page         | Not Started | —                                                                      |
| CAS-011 | History / Archive page    | Not Started | —                                                                      |
| CAS-012 | Member Profile page       | Not Started | —                                                                      |
| CAS-013 | Stats / Insights page     | Not Started | —                                                                      |
| CAS-014 | Admin Dashboard           | Not Started | —                                                                      |
| CAS-015 | Vercel deployment         | Not Started | —                                                                      |
| CAS-016 | CI pipeline (GH Actions)  | Not Started | Split out of CAS-001                                                   |

---

## 7. Current Agent Checkpoint

> Per-story checkpoints live in `harness/checkpoints/`. Each active story has its own `{ISSUE-KEY}.md` file.
> List that directory to see active work. Delete a story's checkpoint after merge; completed work remains in the Story Status Matrix, amendments, and GitHub Issues.

### Standing Conventions

- **Club name:** "Cinema and Sins" (with spaces). Repo: `CinemaAndSins`.
- **Scoring:** 1.0–10.0 with full decimal precision (0.1 step). DB column: `numeric(3,1)`.
- **Reviews visibility:** Visible to all immediately as submitted. No hiding mechanism.
- **Public visibility:** Non-members can read schedule, history, movie details, stats. Only members can write. Admin-only for management.
- **Minimum reviews for rankings:** 5 (configurable).

---

## 8. Reference Architecture Notes

### Supabase Integration

- Use `@supabase/supabase-js` for the client.
- Create two clients: one for the browser (anon key), one for server-side operations (service role key, server-only).
- Use `@supabase/ssr` for server-side auth in Next.js App Router.
- RLS is the primary authorization mechanism — do not duplicate in application code.

### TMDB Integration

- Base URL: `https://api.themoviedb.org/3`
- Auth: Bearer token in `Authorization` header (server-side only)
- Image base URL: `https://image.tmdb.org/t/p/w500` (posters)
- Endpoints used:
  - `GET /search/movie?query={query}` — search by title
  - `GET /movie/{id}` — full details (director, runtime, genres)
- Cache movie metadata in the `movies` table to avoid repeated API calls.

### Vercel Deployment

- Auto-deploys from `main` branch on push.
- Preview deployments for PRs.
- Environment variables configured in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TMDB_API_KEY`
