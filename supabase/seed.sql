-- Seed data for local development
-- This runs after migrations when you call `supabase db reset`.
--
-- IMPORTANT: This file only creates non-auth data (movies, picks, reviews, rotation).
-- Test users and member profiles are created by `supabase/seed-users.sh` which
-- uses the Supabase Auth signup API so that GoTrue manages password hashing.
--
-- Run order:
--   1. supabase db reset  (applies migrations + this seed)
--   2. bash supabase/seed-users.sh  (creates auth users + member profiles)
--   3. bash supabase/seed-relations.sh  (links picks/reviews/rotation to the new member IDs)

-- ============ Movies ============
INSERT INTO movies (id, tmdb_id, title, year, director, runtime, poster_url, synopsis, genres) VALUES
  ('00000000-0000-0000-0001-000000000001', 155, 'The Dark Knight', 2008, 'Christopher Nolan', 152, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911Z6o7U0OoOTZ.jpg', 'Batman raises the stakes in his war on crime.', ARRAY['Action', 'Crime', 'Drama']),
  ('00000000-0000-0000-0001-000000000002', 13, 'Forrest Gump', 1994, 'Robert Zemeckis', 142, 'https://image.tmdb.org/t/p/w500/saHP97rTPS5yhQgBwE3e3Y6sPEY.jpg', 'The presidencies of Kennedy and Johnson, the Vietnam War, and more through the eyes of an Alabama man.', ARRAY['Comedy', 'Drama', 'Romance']),
  ('00000000-0000-0000-0001-000000000003', 27205, 'Inception', 2010, 'Christopher Nolan', 148, 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 'A thief who steals corporate secrets through dream-sharing technology.', ARRAY['Action', 'Science Fiction', 'Thriller']),
  ('00000000-0000-0000-0001-000000000004', 238, 'The Godfather', 1972, 'Francis Ford Coppola', 175, 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.', ARRAY['Crime', 'Drama']),
  ('00000000-0000-0000-0001-000000000005', 680, 'Pulp Fiction', 1994, 'Quentin Tarantino', 154, 'https://image.tmdb.org/t/p/w500/d5iIlpz5Q0yNo5avHnYk2oM3AYM.jpg', 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.', ARRAY['Crime', 'Thriller'])
ON CONFLICT (tmdb_id) DO NOTHING;
