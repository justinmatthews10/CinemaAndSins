-- Enable Row Level Security on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotation ENABLE ROW LEVEL SECURITY;

-- Grant table access to the anon and authenticated roles.
-- Supabase's new default (2026+) does NOT auto-expose new tables to Data API
-- roles, so we must explicitly grant SELECT/INSERT/UPDATE/DELETE as needed.
-- The RLS policies below still gate which rows each role can actually touch.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON movies, picks, reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON members, rotation TO authenticated;

-- Helper function: is the current user an approved member?
CREATE OR REPLACE FUNCTION public.is_approved_member()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE id = auth.uid() AND is_approved = TRUE
  );
$$;

-- Helper function: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$;

-- ============ members ============

-- Public can see limited member info (name, avatar — not email)
CREATE POLICY "members_public_read" ON members
  FOR SELECT USING (true);

-- Members can update their own profile (name, avatar_url only)
CREATE POLICY "members_self_update" ON members
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything (approve, remove, set admin)
CREATE POLICY "members_admin_all" ON members
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ movies ============

-- Public can read
CREATE POLICY "movies_public_read" ON movies
  FOR SELECT USING (true);

-- Approved members can insert
CREATE POLICY "movies_member_insert" ON movies
  FOR INSERT TO authenticated WITH CHECK (public.is_approved_member());

-- Admins can do everything
CREATE POLICY "movies_admin_all" ON movies
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ picks ============

-- Public can read
CREATE POLICY "picks_public_read" ON picks
  FOR SELECT USING (true);

-- Approved members can insert picks (must be the assigned picker)
CREATE POLICY "picks_member_insert" ON picks
  FOR INSERT TO authenticated
  WITH CHECK (picker_member_id = auth.uid() AND public.is_approved_member());

-- Members can update their own picks
CREATE POLICY "picks_member_update" ON picks
  FOR UPDATE USING (picker_member_id = auth.uid());

-- Admins can do everything (lock months, edit/delete)
CREATE POLICY "picks_admin_all" ON picks
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ reviews ============

-- Public can read
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);

-- Approved members can insert their own reviews
CREATE POLICY "reviews_member_insert" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (member_id = auth.uid() AND public.is_approved_member());

-- Members can update their own reviews (only if pick is not locked)
CREATE POLICY "reviews_member_update" ON reviews
  FOR UPDATE USING (
    member_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM picks p
      WHERE p.id = pick_id AND p.status != 'locked'
    )
  );

-- Admins can do everything
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ rotation ============

-- Public can read
CREATE POLICY "rotation_public_read" ON rotation
  FOR SELECT USING (true);

-- Only admins can modify rotation
CREATE POLICY "rotation_admin_all" ON rotation
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
