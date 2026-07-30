# Amendment 0015 — CAS-016: Historical Data Entry

**Date:** 2026-07-30
**Story:** CAS-016 — Historical Data Entry
**Status:** Complete

## What was built

- `components/PastPickForm.tsx` — admin form for creating past picks
- `app/admin/page.tsx` — new "Past Pick" tab
- `lib/supabase/picks.ts` — `createMovieAndPick` now accepts optional `status` param

## Features

### Past Pick tab (new)

- TMDB search to find the movie
- Picker dropdown (approved members only)
- Month/year selectors (any past month, last 10 years)
- Watch date input
- Picker note textarea
- Creates pick with status "current" so members can review
- After creation, switches to Picks tab and shows success message

### Workflow

1. Admin creates past pick via Past Pick tab
2. Members review it via the normal review page (pick is "current")
3. Admin locks the pick via Picks tab when all reviews are in

## Changes to existing code

- `createMovieAndPick` now accepts `status?: "upcoming" | "current" | "locked"` (defaults to "upcoming" for backward compatibility)

## Tests

- `tests/unit/components/PastPickForm.test.tsx` — 8 tests
- All 233 unit tests pass, build succeeds
