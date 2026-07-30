-- Seed data for local development
-- This runs after migrations when you call `supabase db reset`.
-- It creates test auth users, member profiles, movies, picks, reviews, and rotation.

-- Note: We insert directly into auth.users first (bypassing the signup API),
-- which triggers handle_new_user to create the member row. Then we update
-- the member rows to set is_admin and is_approved flags.

-- ============ Create auth users ============
-- The trigger will create member rows with is_approved = FALSE.
-- Use ON CONFLICT (id) since email uniqueness is a partial index (is_sso_user = false).

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
SELECT
  uuid,
  email,
  crypt('password123', gen_salt('bf')),
  NOW(),
  jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
  jsonb_build_object('name', name)
FROM (VALUES
  ('00000000-0000-0000-0000-000000000001'::UUID, 'justin@example.com', 'Justin'),
  ('00000000-0000-0000-0000-000000000002'::UUID, 'sarah@example.com', 'Sarah'),
  ('00000000-0000-0000-0000-000000000003'::UUID, 'mike@example.com', 'Mike'),
  ('00000000-0000-0000-0000-000000000004'::UUID, 'emma@example.com', 'Emma'),
  ('00000000-0000-0000-0000-000000000005'::UUID, 'alex@example.com', 'Alex'),
  ('00000000-0000-0000-0000-000000000006'::UUID, 'pending@example.com', 'Pending User')
) AS t(uuid, email, name)
ON CONFLICT (id) DO NOTHING;

-- ============ Update member profiles ============
-- The trigger created rows with is_approved = FALSE. Flip the approved ones
-- and set Justin as admin.
UPDATE members SET is_admin = TRUE, is_approved = TRUE WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE members SET is_approved = TRUE WHERE id IN (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005'
);
-- The 6th user (pending@example.com) stays is_approved = FALSE

-- ============ Movies ============
INSERT INTO movies (id, tmdb_id, title, year, director, runtime, poster_url, synopsis, genres) VALUES
  ('00000000-0000-0000-0001-000000000001', 155, 'The Dark Knight', 2008, 'Christopher Nolan', 152, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911Z6o7U0OoOTZ.jpg', 'Batman raises the stakes in his war on crime.', ARRAY['Action', 'Crime', 'Drama']),
  ('00000000-0000-0000-0001-000000000002', 13, 'Forrest Gump', 1994, 'Robert Zemeckis', 142, 'https://image.tmdb.org/t/p/w500/saHP97rTPS5yhQgBwE3e3Y6sPEY.jpg', 'The presidencies of Kennedy and Johnson, the Vietnam War, and more through the eyes of an Alabama man.', ARRAY['Comedy', 'Drama', 'Romance']),
  ('00000000-0000-0000-0001-000000000003', 27205, 'Inception', 2010, 'Christopher Nolan', 148, 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 'A thief who steals corporate secrets through dream-sharing technology.', ARRAY['Action', 'Science Fiction', 'Thriller']),
  ('00000000-0000-0000-0001-000000000004', 238, 'The Godfather', 1972, 'Francis Ford Coppola', 175, 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.', ARRAY['Crime', 'Drama']),
  ('00000000-0000-0000-0001-000000000005', 680, 'Pulp Fiction', 1994, 'Quentin Tarantino', 154, 'https://image.tmdb.org/t/p/w500/d5iIlpz5Q0yNo5avHnYk2oM3AYM.jpg', 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.', ARRAY['Crime', 'Thriller'])
ON CONFLICT (tmdb_id) DO NOTHING;

-- ============ Picks ============
INSERT INTO picks (id, movie_id, picker_member_id, month, year, watch_date, picker_note, status) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000002', 5, 2026, '2026-05-15', 'Best superhero movie ever made, fight me.', 'locked'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000003', 6, 2026, '2026-06-19', 'A classic that holds up.', 'locked'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000004', 7, 2026, '2026-07-17', 'Mind-bending and rewatchable.', 'current')
ON CONFLICT DO NOTHING;

-- ============ Reviews ============
INSERT INTO reviews (pick_id, member_id, score, review_text, tags) VALUES
  -- Dark Knight reviews
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 9.5, 'Heath Ledger is unreal. The pacing drags in the third act but the set pieces are incredible.', ARRAY['rewatch']),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002', 10.0, 'Perfect. No notes.', ARRAY[]::TEXT[]),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000003', 8.0, 'Great but overhyped. The ferry scene is heavy-handed.', ARRAY[]::TEXT[]),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000004', 9.0, 'Ledger alone makes this worth it. The score is iconic.', ARRAY[]::TEXT[]),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000005', 7.5, 'Good action movie but I prefer Begins.', ARRAY[]::TEXT[]),
  -- Forrest Gump reviews
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 8.0, 'Emotional but some of the CGI has not aged well.', ARRAY[]::TEXT[]),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002', 7.0, 'A bit saccharine for me. Hanks is great though.', ARRAY[]::TEXT[]),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000003', 9.0, 'Grew up watching this. Holds a special place.', ARRAY['rewatch']),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000004', 8.5, 'The soundtrack is perfect. The story meanders but in a good way.', ARRAY[]::TEXT[]),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000005', 6.5, 'Too long and too sentimental. Feels like Oscar bait.', ARRAY[]::TEXT[])
ON CONFLICT (pick_id, member_id) DO NOTHING;

-- ============ Rotation ============
-- Order: Justin, Sarah, Mike, Emma, Alex
INSERT INTO rotation (order_index, member_id, is_active) VALUES
  (0, '00000000-0000-0000-0000-000000000001', TRUE),
  (1, '00000000-0000-0000-0000-000000000002', TRUE),
  (2, '00000000-0000-0000-0000-000000000003', TRUE),
  (3, '00000000-0000-0000-0000-000000000004', TRUE),
  (4, '00000000-0000-0000-0000-000000000005', TRUE)
ON CONFLICT (member_id) DO NOTHING;
