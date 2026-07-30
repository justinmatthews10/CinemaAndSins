# Amendment 0005 — CAS-006: Home / Current Movie of the Month

**Date:** 2026-07-30
**Story:** CAS-006 — Home / Current Movie of the Month
**Status:** Complete

## What was built

- `app/page.tsx` — server component home page
  - Shows current month's pick with MovieHero component
  - Empty state when no pick exists for current month
  - "Add a Pick" link shown when user is logged in and no pick exists
- `components/MovieHero.tsx` — reusable hero banner component
  - Poster, title, year, director, runtime, genres
  - "Picked by [name]" badge with picker note
  - Watch-by date with countdown
  - Synopsis
  - Review stats (N of M reviewed)
  - User review status (haven't reviewed → link, or score display)
  - Next picker teaser
- `lib/supabase/getCurrentPick.ts` — server-side data fetcher
  - Fetches current month's pick with movie, picker, reviews, rotation, members
  - Calculates review stats and user's review
  - Determines next month's assigned picker

## Tests

- `tests/unit/components/MovieHero.test.tsx` — 11 tests (title, year, director, runtime, picker badge, synopsis, review stats, review prompt, user score, countdown, next picker, poster, no-poster placeholder)

## Decisions

- MovieHero is a client component (`"use client"`) because it uses `Link` for the review link
- getCurrentPick is a server-side function using the server Supabase client
- The home page is a server component that fetches data and passes to MovieHero
- Review stats count all reviews for the pick; total is the count of approved members
- Next picker is determined using the same getAssignedPicker logic from CAS-005

## What changed from plan

- `MemberBadge.tsx` was not created as a separate component — the badge is simple enough to inline in MovieHero
- `lib/supabase/getPicks.ts` and `lib/supabase/getReviews.ts` were consolidated into a single `lib/supabase/getCurrentPick.ts` that fetches everything needed in parallel
