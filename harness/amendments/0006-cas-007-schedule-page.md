# Amendment 0006 — CAS-007: Schedule Page

**Date:** 2026-07-30
**Story:** CAS-007 — Schedule Page
**Status:** Complete

## What was built

- `app/schedule/page.tsx` — server component schedule page
  - Shows upcoming months as a timeline
  - Shows past months in a history section with count
  - Passes current user ID for "Pick a movie" link logic
- `components/ScheduleTimeline.tsx` — schedule timeline component
  - Each slot shows: poster (if picked), month/year, picker name or movie title, status badge
  - Status badges: "Not picked yet" (gray), "Movie selected" (accent), "Locked" (red)
  - "Pick a movie →" link shown when it's the current user's slot and no pick exists
  - Picker note shown as italic quote when available
  - Empty state when no rotation set up
- `lib/supabase/getSchedule.ts` — server-side data fetcher
  - Fetches rotation, members, picks, and movies in parallel
  - Builds ScheduleSlot[] for upcoming and past months
  - Uses getAssignedPicker to determine picker for each month
  - Shows max(12, rotationSize) upcoming months

## Tests

- `tests/unit/components/ScheduleTimeline.test.tsx` — 12 tests
  (month/year display, picker name, status badges, movie title, poster, pick link visibility, past slots, empty state)

## Decisions

- ScheduleTimeline is a server component (no interactivity needed beyond Link)
- Poster thumbnails use the existing PosterImage component with custom sizing
- Past months are shown in a separate section with a count header, not collapsed behind a toggle
- The timeline shows a full rotation cycle (or 12 months minimum) so users can see when their next turn is
- Reuses getAssignedPicker from CAS-005 for rotation logic

## What changed from plan

- `lib/supabase/getRotation.ts` was replaced by `lib/supabase/getSchedule.ts` which fetches the full schedule data (rotation + members + picks + movies) in one call
- Past months are shown as a list (not collapsed behind a toggle) — simpler and more useful for a small club
