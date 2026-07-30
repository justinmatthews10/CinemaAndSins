# Amendment 0012 — CAS-013: Stats / Insights Page

**Date:** 2026-07-30
**Story:** CAS-013 — Stats / Insights Page
**Status:** Complete

## What was built

- `app/stats/page.tsx` — server component, club-wide analytics
- `components/StatsLeaderboard.tsx` — highest/lowest rated movies (two columns)
- `components/StatsDivisive.tsx` — most divisive movies by score variance
- `components/StatsGenreBreakdown.tsx` — genre bars with count + avg score
- `components/StatsTrendChart.tsx` — club average over time (bar chart)
- `lib/stats-aggregate.ts` — pure aggregation functions (leaderboard, mostDivisive, genreBreakdown, averageOverTime)
- `lib/supabase/getStats.ts` — fetches all picks/movies/reviews for stats

## Navigation changes

- Navbar: added "Stats" link back (after Members)

## Tests

- `tests/unit/lib/stats-aggregate.test.ts` — 13 tests (leaderboard, mostDivisive, genreBreakdown, averageOverTime)

## Decisions

- Min 3 reviews required for leaderboard and divisive rankings
- Genre breakdown counts movies (not reviews) and averages all review scores across movies in that genre
- Trend chart shows bar heights relative to min/max averages in the dataset
- All stat components are server components (no client interactivity needed)
- Stats link added to navbar after Members
