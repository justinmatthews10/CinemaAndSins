# Amendment 0008 — CAS-009: Submit Review Page

**Date:** 2026-07-30
**Story:** CAS-009 — Submit Review Page
**Status:** Complete

## What was built

- `app/review/[pickId]/page.tsx` — client component review page
  - Fetches pick, movie, and existing review for the current user
  - Shows movie context (poster, title, year) above the form
  - Creates or updates review on submit (one per member per pick)
  - Redirects to home after successful save (1.5s delay for confirmation)
  - Locked state when pick status is "locked" (all inputs disabled)
  - Auth guard: redirects to login/pending for unauthenticated/unapproved users
- `components/ReviewForm.tsx` — review input form
  - Score slider 1–10 with 0.5 increments
  - Score badge with color that updates live (gold 9+, green 7-8, yellow 5-6, red 1-4)
  - Markdown-supported review textarea
  - Optional tags: "Rewatch", "First Time" (checkboxes)
  - Submit button text changes: "Submit Review" (new) vs "Update Review" (editing)
  - All inputs disabled when locked

## Tests

- `tests/unit/components/ReviewForm.test.tsx` — 11 tests
  (slider value, badge color updates, review text, tag checkboxes, submit callback,
  locked state, edit vs submit label, tag toggle)

## Decisions

- Score uses 0.5 increments (supports both whole numbers and half-points)
- Score badge colors reuse `scoreBadgeColor` from `lib/scoring.ts`
- Review page is a client component (needs interactivity for slider, form submission)
- Uses shared components: PageHeading, StatusBanner, LoadingState, PosterImage
- Tags stored as string array in the reviews table
- Markdown is supported in the textarea but rendering happens on the movie detail page (CAS-010)

## What changed from plan

- `components/ui/Slider.tsx` and `components/ui/Badge.tsx` were not created as separate
  primitives — the slider is a styled native `<input type="range">` and the badge is
  inline in ReviewForm. Both are simple enough not to warrant separate components.
