# Amendment 0010 — CAS-011: History / Archive Page

**Date:** 2026-07-30
**Story:** CAS-011 — History / Archive Page
**Status:** Complete

## What was built

- `app/history/page.tsx` — server component that fetches all past picks
  - Renders empty state when no picks exist
  - Passes data to HistoryControls for client-side sort/filter/search
- `components/MovieCard.tsx` — reusable movie card for the history grid
  - Poster, title, year, genres, average score (with badge color), review count
  - "Hot Takes" badge when variance > 4 and review count >= 5
  - Picker name + month/year
  - Entire card links to `/movies/[id]`
- `components/HistoryControls.tsx` — client component for sort/filter/search/pagination
  - Search by title (case-insensitive)
  - Sort by: newest, year, average score, genre, picker, most divisive
  - Filter by genre and picker
  - Reset button to clear all filters
  - "Load more" pagination (page size 12)
  - Empty state when no results match
- `lib/supabase/getHistory.ts` — data fetcher
  - Fetches all picks with movies, joined with members and reviews
  - Calculates average score and variance per pick
  - Returns entries, unique pickers, and unique genres for filters
- `types/history.ts` — shared types and constants
  - HistoryEntry, HistoryData types
  - DIVISIVE_MIN_REVIEWS constant
  - Separated from getHistory.ts to avoid importing server client in client components

## Tests

- `tests/unit/components/MovieCard.test.tsx` — 10 tests
  (title/year, picker, score, review count, genres, link, empty state, hot takes badge)
- `tests/unit/components/HistoryControls.test.tsx` — 11 tests
  (search, sort, genre filter, picker filter, empty state, reset)

## Decisions

- Sort/filter/search happen client-side after initial server fetch — simpler than
  building Supabase query params, and the dataset is small (movie club, not Netflix)
- Pagination via "Load more" button rather than infinite scroll — no intersection
  observer needed, simpler and more accessible
- Types and constants moved to `types/history.ts` to avoid a server-only import
  (`lib/supabase/server`) from being pulled into client components via MovieCard
- History link was already in the navbar from a previous story
- "Most divisive" sort requires >= 5 reviews (DIVISIVE_MIN_REVIEWS) to be meaningful
