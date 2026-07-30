-- Seed data for local development
-- This runs after migrations when you call `supabase db reset`.
--
-- IMPORTANT: This file only creates non-auth data (movies, picks, reviews, rotation).
-- Test users and member profiles are created by `supabase/seed-users.sh` which
-- uses the Supabase Auth signup API so that GoTrue manages password hashing.
--
-- Movies are fetched live from TMDB by `supabase/seed-movies.sh` so that
-- poster URLs and metadata are always up to date.
--
-- Run order:
--   1. supabase db reset  (applies migrations + this seed)
--   2. bash supabase/seed-users.sh  (creates auth users + member profiles)
--   3. bash supabase/seed-movies.sh  (fetches movie data from TMDB API)
--   4. bash supabase/seed-relations.sh  (links picks/reviews/rotation to the new member IDs)

-- Movies are now seeded by seed-movies.sh (fetches live data from TMDB API)

