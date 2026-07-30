# Amendment 0009 — CAS-010: Movie Detail Page

**Date:** 2026-07-30
**Story:** CAS-010 — Movie Detail Page
**Status:** Complete

## What was built

- `app/movies/[id]/page.tsx` — server component movie detail page
  - Full poster + metadata (director, year, runtime, genres, synopsis)
  - "Picked by [member] in [month year]" attribution
  - Average score prominently displayed with badge color
  - "Hot Takes" indicator when score variance is high (>4)
  - Watch-by date if set
  - Empty state if no reviews
- `components/ScoreDistribution.tsx` — bar chart of score distribution
  - Only shows scores that have at least one review
  - Bar width proportional to count
  - Color-coded by score range (gold/green/yellow/red)
- `components/ReviewCard.tsx` — individual review display
  - Member name, score badge, written review
  - Tags shown as pills
  - "No written review" placeholder
- `components/ReviewsSection.tsx` — client component for reviews list
  - Sort by score or by name (toggle buttons)
  - Wraps ScoreDistribution + ReviewCard list
  - Empty state when no reviews
- `lib/supabase/getMovieDetail.ts` — data fetcher
  - Fetches movie, pick, picker, reviews, and all members in parallel
  - Joins reviews with member data
  - Calculates average score and variance
  - Returns null if movie or pick not found

## Tests

- `tests/unit/components/ScoreDistribution.test.tsx` — 4 tests
  (bars for each bucket, counts, empty state, only active scores)
- `tests/unit/components/ReviewCard.test.tsx` — 8 tests
  (member name, score badge, review text, placeholder, tags, badge colors)

## Decisions

- Page is a server component; only the reviews list (with sort controls) is a client component
- Score distribution uses horizontal bars (simple, no chart library needed)
- "Most divisive" threshold: variance > 4 (e.g., scores ranging from 3 to 10)
- Reviews are sorted by score by default (highest first)
- TMDB rating comparison deferred — not in current movie schema
