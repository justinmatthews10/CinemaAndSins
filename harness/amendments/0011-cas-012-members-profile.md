# Amendment 0011 — CAS-012: Members Page + Member Profile

**Date:** 2026-07-30
**Story:** CAS-012 — Members Page + Member Profile
**Status:** Complete

## What was built

- `app/members/page.tsx` — server component, grid of all approved members
- `components/MemberCard.tsx` — member card with avatar, avg score, top/worst movies, badge
- `app/profile/[memberId]/page.tsx` — server component, full member profile
- `components/ProfileHeader.tsx` — avatar, name, member since, avg score, harsh/easy badge
- `components/ProfileStats.tsx` — stats grid (reviews, avg, vs club, most-rated genre)
- `components/ProfilePickHistory.tsx` — list of movies the member has picked
- `components/ProfileReviewHistory.tsx` — sortable review history (client component)
- `lib/stats.ts` — pure stat functions (calculateAverage, harshEasyGrader, mostRatedGenre, topAndWorstMovies)
- `lib/supabase/getMembers.ts` — fetches all members with stats and top/worst movies
- `lib/supabase/getProfile.ts` — fetches single member profile with picks and reviews
- `types/member-summary.ts` — shared types (MemberSummary, ProfileData)

## Navigation changes

- Navbar: replaced "Stats" link with "Members"
- ReviewCard: member name links to `/profile/[memberId]`
- MovieCard: picker name links to `/profile/[memberId]` (card restructured to avoid nested links)
- ScheduleTimeline: picker name links to `/profile/[memberId]`

## Tests

- `tests/unit/lib/stats.test.ts` — 13 tests (calculateAverage, harshEasyGrader, mostRatedGenre, topAndWorstMovies)
- `tests/unit/components/MemberCard.test.tsx` — 10 tests (name, score, reviews, top/worst, badges, link, empty state)

## Decisions

- Avatar uses first initial in colored circle (no image upload yet)
- "Harsh critic" = avg 1+ points below club average; "Easy grader" = 1+ above
- Top/worst movies on member cards show poster thumbnail + title + score
- MovieCard restructured from single Link to div with separate links for movie and picker profile
- Profile review history sorts by date (default) or score
- Types and constants in `types/member-summary.ts` to avoid server-only imports in client components
