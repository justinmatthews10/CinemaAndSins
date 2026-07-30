# Amendment: CAS-002 Supabase Setup

> **Date:** 2026-07-29
> **Issue:** CAS-002 — Supabase Setup

## What Changed

- Installed Supabase CLI v2.110.0 and initialized local Supabase project (`supabase init`).
- Created 6 migration files:
  - `20260729000001_create_members.sql` — members table with FK to `auth.users`, auto-creates member row on signup via `handle_new_user()` trigger
  - `20260729000002_create_movies.sql` — movies table with tmdb_id unique constraint, title/year indexes
  - `20260729000003_create_picks.sql` — picks table with partial unique index (only one `current` pick), per-member/month/year unique index, schedule/status indexes
  - `20260729000004_create_reviews.sql` — reviews table with `numeric(3,1)` score (full decimals), `updated_at` auto-trigger, pick/member indexes
  - `20260729000005_create_rotation.sql` — rotation table with per-member unique constraint, active-only order index
  - `20260729000006_rls_policies.sql` — RLS enabled on all tables, `is_approved_member()` and `is_admin()` helper functions, public-read/member-write/admin-all policies, explicit GRANT statements for anon and authenticated roles
- Created `supabase/seed.sql` with 6 test members (1 admin, 4 approved, 1 pending), 5 movies, 3 picks (2 locked, 1 current), 10 reviews, and 5 rotation entries.
- Created `tests/unit/lib/supabase.test.ts` (8 integration tests) verifying:
  - Connection to local Supabase
  - Public read access on all tables via anon key
  - Public write rejection via anon key
  - Score CHECK constraint enforcement
- Updated `tests/setup.ts` to load `.env.local` for integration tests (Vitest doesn't load it automatically).
- Updated `.prettierignore` to exclude SQL files (no built-in parser) and `supabase/.temp/`.
- Updated `eslint.config.mjs` to ignore `supabase/.temp/` (generated minified code).
- Created `.env.local` with local Supabase credentials (gitignored).

## Why

Three non-obvious issues were discovered and fixed during implementation:

1. **`auth.users` email uniqueness is a partial index** (`WHERE is_sso_user = false`), so `ON CONFLICT (email)` fails. Fixed by using `ON CONFLICT (id)` since `id` is the primary key.

2. **Supabase's new default (2026+) does NOT auto-expose new tables** to the `anon` and `authenticated` Data API roles. Without explicit `GRANT` statements, RLS policies are useless — the roles can't even attempt SELECT. Added `GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon/authenticated` and write grants for authenticated.

3. **Vitest does not load `.env.local`** (unlike Next.js). Integration tests that need Supabase credentials fail with "supabaseUrl is required". Fixed by manually parsing `.env.local` in `tests/setup.ts` — no new dependency needed.

## Harness Sections Updated

- `harness/cinemaandins-harness.md` Section 6 (Story Status Matrix: CAS-002 → Complete)
- `ideation/raw-stories.md` (CAS-002 AC ticked, status → Complete)
- `ideation/issue-tracker.md` (CAS-002 → Complete)

## Known Follow-Ups

- Cloud Supabase project will be created at deploy time (CAS-015).
- The `is_approved` column in the members table was already in `api-contracts.md` but missing from the original `CREATE TABLE` draft — the migration includes it.
- The `handle_new_user()` trigger auto-creates member rows on signup with `is_approved = FALSE`. An admin must approve via the admin dashboard (CAS-014).
