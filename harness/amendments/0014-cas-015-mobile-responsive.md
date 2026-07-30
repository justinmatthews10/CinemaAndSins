# Amendment 0014 — CAS-015: Mobile Responsive Design

**Date:** 2026-07-30
**Story:** CAS-015 — Mobile Responsive Design
**Status:** Complete

## What was built

- `components/MobileMenu.tsx` — hamburger menu with all nav links + user menu inside
- `components/Navbar.tsx` — refactored to show MobileMenu below `sm`, desktop nav above
- `tests/unit/components/MobileMenu.test.tsx` — 11 unit tests

## Changes

### Critical fixes

1. **Navbar** — hamburger menu below `sm` (640px), desktop nav hidden on mobile
   - All nav links (Home, Schedule, History, Members, Stats) in hamburger
   - User menu (My Pick, Admin, Profile, Log Out) also in hamburger
   - Outside-click to close, auto-close on link click
2. **HistoryControls** — search input `min-w-[200px]` → `min-w-[140px]`

### Tap target fixes (min 44px height)

3. **ReviewsSection** — sort buttons `py-1` → `py-2`
4. **ProfileReviewHistory** — sort buttons `py-1` → `py-2`
5. **RotationEditor** — action buttons `py-1` → `py-2`
6. **MemberManager** — action buttons `py-1.5` → `py-2`
7. **PickManager** — action buttons `py-1.5` → `py-2`
8. **ContentManager** — tab + delete buttons `py-1.5` → `py-2.5` / `py-2`
9. **ReviewForm** — checkbox labels got border + padding `px-3 py-2`
10. **Navbar** — user menu button `py-2` → `py-2.5`

### Minor layout fixes

11. **movies/[id]/page.tsx** — poster `w-48 h-72` → `w-32 h-56 sm:w-48 sm:h-72`
12. **review/[pickId]/page.tsx** — added `flex-wrap` to tag container
13. **StatsGenreBreakdown** — genre label `w-28` → `w-20 sm:w-28`
14. **ReviewForm** — tag container `flex gap-4` → `flex flex-wrap gap-3`

## Tests

- `tests/unit/components/MobileMenu.test.tsx` — 11 tests
- All 225 unit tests pass, build succeeds

## Decisions

- All nav links + user menu go inside the hamburger (single menu, not two)
- Unit tests only (no Playwright E2E mobile tests)
- Hamburger button is 44x44px (h-11 w-11)
- Menu panel is 256px wide (w-64), positioned right-aligned
- Desktop nav unchanged above `sm` breakpoint
