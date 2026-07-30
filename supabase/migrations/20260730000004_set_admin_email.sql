-- Set the admin email for the CinemaAndSins app.
-- This user will be auto-approved and granted admin on signup.

INSERT INTO app_config (key, value) VALUES ('admin_email', 'jpmatt100@gmail.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
