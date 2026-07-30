# Amendment 0016 — CAS-017: Vercel Deployment

**Date:** 2026-07-30
**Story:** CAS-017 — Vercel Deployment
**Status:** Complete

## What was built

- `supabase/migrations/20260730000001_admin_bootstrap.sql` — admin bootstrap migration
- `.env.example` — added `ADMIN_EMAIL` variable
- `README.md` — full rewrite with 9-step production deployment guide

## Admin Bootstrap

The migration updates `handle_new_user()` to check if the signup email matches the `app.admin_email` database config setting:

```sql
ALTER DATABASE postgres SET app.admin_email = 'your-email@example.com';
```

When a user signs up with that email:

- `is_admin = TRUE`
- `is_approved = TRUE`

All other signups follow the default behavior (unapproved, non-admin).

## README Setup Guide

The README now includes a full 9-step guide:

1. Create Supabase project
2. Get Supabase API keys
3. Run database migrations (CLI or SQL Editor)
4. Set admin email in Supabase
5. Get TMDB API key
6. Deploy to Vercel (import repo, set env vars)
7. Sign up as admin (auto-approved)
8. Invite members (approve via admin panel)
9. Add historical data (optional, via Past Pick tab)

## Tests

- No new tests (config + docs only)
- All 233 unit tests pass, build succeeds
