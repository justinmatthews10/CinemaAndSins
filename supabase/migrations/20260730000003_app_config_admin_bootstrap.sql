-- Admin bootstrap: auto-approve and set admin for the configured admin email.
--
-- Uses an app_config table instead of ALTER DATABASE (which requires superuser
-- privileges not available in the Supabase SQL Editor).
--
-- To set your admin email, run this in the Supabase SQL Editor:
--   INSERT INTO app_config (key, value) VALUES ('admin_email', 'you@example.com')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
--
-- When a new user signs up with that email, they are automatically approved
-- and granted admin privileges. All other signups follow the default
-- behavior (unapproved, non-admin).

-- Config table for app-level settings (admin email, etc.)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow anyone to read config (needed by the trigger function)
-- but only authenticated admins can write
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_config_read" ON app_config FOR SELECT USING (true);
CREATE POLICY "app_config_admin_write" ON app_config
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Grant access to roles
GRANT SELECT ON app_config TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON app_config TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_email TEXT;
BEGIN
  -- Read the configured admin email from app_config table
  SELECT value INTO admin_email FROM public.app_config WHERE key = 'admin_email';

  INSERT INTO public.members (id, email, name, is_admin, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    -- Auto-admin if email matches the configured admin email
    CASE WHEN admin_email IS NOT NULL AND LOWER(NEW.email) = LOWER(admin_email) THEN TRUE ELSE FALSE END,
    -- Auto-approve if email matches the configured admin email
    CASE WHEN admin_email IS NOT NULL AND LOWER(NEW.email) = LOWER(admin_email) THEN TRUE ELSE FALSE END
  );
  RETURN NEW;
END;
$$;
