# Amendment 0005 — CAS-006: Home / Current Movie of the Month

**Date:** 2026-07-30
**Story:** CAS-006 — Home / Current Movie of the Month
**Status:** Complete

## What was built

- `app/page.tsx` — server component home page
  - Shows current month's pick with MovieHero component
  - Empty state shows whose turn it is to pick (assigned picker) even when no movie picked yet
  - "Pick a Movie" button shown when logged-in user is the assigned picker
  - "No rotation set up" message if no active rotation exists
- `components/MovieHero.tsx` — reusable hero banner component
  - Poster, title, year, director, runtime, genres
  - "Picked by [name]" badge with picker note
  - Watch-by date with countdown
  - Synopsis
  - Review stats (N of M reviewed)
  - User review status (haven't reviewed → link, or score display)
  - Next picker teaser
- `lib/supabase/getCurrentPick.ts` — server-side data fetcher
  - Always returns assignedPicker, month, year (even when no pick exists)
  - Returns pick/movie/picker as nullable
  - Fetches current month's pick with movie, picker, reviews, rotation, members
  - Calculates review stats and user's review
  - Determines next month's assigned picker

## Additional changes during CAS-006

### Add-movie page restructured as persistent picker page

- `app/add-movie/page.tsx` rewritten from a one-shot form to a persistent picker page
  - Shows existing pick (poster, details, note, watch date) with Change/Remove buttons
  - "Change Movie" opens search form to swap the movie (updates pick in place)
  - "Remove Pick" with confirm/cancel flow
  - After submitting, stays on page showing the picked movie
  - Auto-detects assigned month (finds next month where user is the assigned picker)
  - Search range: max(12, activeRotationCount \* 2) to support 12+ member clubs
- `lib/supabase/picks.ts` — added `updatePick` and `deletePick` helpers
- Removed delete button from MovieHero and home page (moved to picker page)
- Added unique index on picks(month, year) to enforce one pick per month

### Rotation algorithm fix

- `getAssignedPicker` rewritten to use month-based offset instead of pick count
- Old algorithm broke when months were skipped (gaps in picks)
- New algorithm uses earliest pick as anchor, calculates months elapsed to advance rotation
- Handles negative offsets (querying before anchor) with proper modulo
- Handles anchor picker no longer in active rotation

### Code quality refactor

- `lib/ui.ts` — shared CSS class constants (inputClass, primaryButtonClass, navLinkClass, secondaryLinkClass)
- `components/PosterImage.tsx` — reusable poster+fallback component
- `lib/rotation.ts` — extracted `getActiveRotation` helper (eliminates duplicate filter+sort in 4 functions)
- `lib/supabase/picks.ts` — extracted `findOrCreateMovie` helper (eliminates duplicate movie lookup/creation)
- `components/Navbar.tsx` — centralized links into NAV_LINKS config array
- `formatDate` from `lib/utils.ts` used consistently (was duplicated inline in 3 files)
- Removed unused `Member` import from `lib/supabase/auth.ts`
- Net reduction: 63 lines across 12 files

## Tests

- `tests/unit/components/MovieHero.test.tsx` — 11 tests
- `tests/unit/lib/picks.test.ts` — 10 tests (added gap advancement and negative offset tests)
- All 90 unit tests pass

## Decisions

- MovieHero is a client component (`"use client"`) because it uses `Link` for the review link
- getCurrentPick is a server-side function using the server Supabase client
- The home page is a server component that fetches data and passes to MovieHero
- Review stats count all reviews for the pick; total is the count of approved members
- Next picker is determined using the same getAssignedPicker logic from CAS-005
- One pick per month enforced at DB level (unique index)
- Picker page finds assigned month even if a pick already exists (for change/remove flow)

## What changed from plan

- `MemberBadge.tsx` was not created as a separate component — the badge is simple enough to inline in MovieHero
- `lib/supabase/getPicks.ts` and `lib/supabase/getReviews.ts` were consolidated into a single `lib/supabase/getCurrentPick.ts` that fetches everything needed in parallel
- Add-movie page evolved from a one-shot form to a persistent picker page with change/remove capabilities
- Delete functionality moved from home page to picker page
