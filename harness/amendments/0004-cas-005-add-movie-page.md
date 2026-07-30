# Amendment 0004 — CAS-005: Add Movie Page

**Date:** 2026-07-30
**Story:** CAS-005 — Add Movie Page
**Status:** Complete

## What was built

- `app/add-movie/page.tsx` — client component page for submitting movie picks
  - Auth-gated: redirects to /login if not authenticated, /pending if not approved
  - Picker assignment check: only the assigned picker for the target month can submit
  - TMDB search with auto-fill of movie metadata (poster, title, year, director, runtime, genres)
  - Manual entry fallback for movies not on TMDB
  - Watch date and "Why I picked this" note fields
  - Month/year selector (defaults to current month)
  - Confirmation screen after successful submission
  - "Not your turn" screen if user is not the assigned picker
- `components/TmdbSearch.tsx` — reusable TMDB search component
  - Debounced search (400ms) calling /api/tmdb/search
  - Live results with poster, title, year
  - Loading, error, and no-results states
  - Calls onSelect callback when a result is clicked
- `lib/supabase/picks.ts` — picks helper functions
  - `getAssignedPicker(rotation, picks, month, year)` — determines who picks for a given month based on rotation order and past picks
  - `createMovieAndPick(supabase, params)` — creates movie record (if new) and pick record in a single operation

## Tests

- `tests/unit/components/TmdbSearch.test.tsx` — 8 tests (rendering, loading, results display, selection, no results, error, debouncing, clearing)
- `tests/unit/lib/picks.test.ts` — 8 tests (assigned picker logic: empty rotation, advancing, wrapping, inactive members, year boundary)

## Decisions

- Picker assignment is based on counting past picks and advancing through the active rotation. This is a simple approach that works for sequential monthly picks.
- TMDB search uses 400ms debounce to avoid excessive API calls
- Movie creation checks for existing tmdb_id before inserting to avoid duplicates
- Manual entry mode allows submitting movies not on TMDB (tmdb_id = null)
- The page uses shared FormField and ErrorBanner components from CAS-003 refactor

## What changed from plan

- `ReviewForm.tsx` mentioned in the plan was not needed — form patterns are handled by existing shared components (FormField, ErrorBanner)
- `lib/supabase/getPicks.ts` was renamed to `lib/supabase/picks.ts` to encompass both reading (getAssignedPicker) and writing (createMovieAndPick)
