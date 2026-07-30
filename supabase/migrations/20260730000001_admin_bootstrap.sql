-- Admin bootstrap: auto-approve and set admin for the configured admin email.
--
-- Set the admin email via the app.admin_email config setting in Supabase:
--   Project Settings → Database → Session configuration → app.admin_email
--   OR: ALTER DATABASE postgres SET app.admin_email = 'you@example.com';
--
-- When a new user signs up with that email, they are automatically approved
-- and granted admin privileges. All other signups follow the default
-- behavior (unapproved, non-admin).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_email TEXT;
BEGIN
  -- Read the configured admin email (returns empty string if not set)
  admin_email := COALESCE(current_setting('app.admin_email', true), '');

  INSERT INTO public.members (id, email, name, is_admin, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    -- Auto-admin if email matches the configured admin email
    CASE WHEN admin_email <> '' AND LOWER(NEW.email) = LOWER(admin_email) THEN TRUE ELSE FALSE END,
    -- Auto-approve if email matches the configured admin email
    CASE WHEN admin_email <> '' AND LOWER(NEW.email) = LOWER(admin_email) THEN TRUE ELSE FALSE END
  );
  RETURN NEW;
END;
$$;
