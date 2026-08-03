# Amendment 0018 — CAS-019: Forgot Password (Password Reset Flow)

**Date:** 2026-07-30
**Story:** CAS-019 — Forgot Password
**Status:** Complete

## What was built

- `app/forgot-password/page.tsx` — email entry form, calls `supabase.auth.resetPasswordForEmail()` with redirect to `/reset-password`, shows success message after submit
- `app/reset-password/page.tsx` — new password + confirm password form, calls `supabase.auth.updateUser()`, redirects to `/login` on success
- `lib/supabase/auth.ts` — added `validateResetPasswordForm` helper and rate limit error mapping in `mapAuthError`
- `app/login/page.tsx` — added "Forgot password?" text link below the Log In button

## Tests

- `tests/unit/lib/auth.test.ts` — 5 new tests for `validateResetPasswordForm`
- `tests/unit/components/ForgotPasswordPage.test.tsx` — 8 tests (rendering, validation, API call, success state, error handling, loading)
- `tests/unit/components/ResetPasswordPage.test.tsx` — 8 tests (rendering, validation, API call, redirect, error handling, loading)
- `tests/unit/components/LoginPageForgotLink.test.tsx` — 2 tests (link exists, link placement)
- Total: 23 new tests, 247 unit tests passing

## Planning decisions

- Post-reset: redirect to `/login` with success (not auto-login)
- Password rules: min 6 chars (consistent with signup)
- Email sent UX: success message on same page, form hidden
- Link placement: text link below the Log In button on `/login`

## Supabase config required

Password reset redirect URL must be in Supabase → Authentication → URL Configuration → Redirect URLs:
- `https://cinema-and-sins.vercel.app/reset-password`

## Harness sections updated

- `harness/cinemaandins-harness.md` Section 4 (page inventory), Section 6 (story status)
