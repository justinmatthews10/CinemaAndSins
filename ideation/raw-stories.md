# Raw Stories

> All stories with acceptance criteria for CinemaAndSins v1.

---

## CAS-001: Project Scaffolding

**Status:** Complete
**Dependencies:** None

### Acceptance Criteria

- [x] Next.js 16 project initialized with App Router, TypeScript, Tailwind CSS 4
- [x] ESLint + Prettier configured
- [x] Vitest configured with React Testing Library
- [x] Playwright configured for E2E tests (browsers installed, smoke test passing)
- [x] `.env.example` created with all required env vars (see `harness/api-contracts.md`)
- [x] `.gitignore` includes `.env.local`, `node_modules`, `.next`, `.harness-ack`
- [x] `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` all pass
- [x] Project structure matches `harness/codebase-layout.md` (directories created)

### Files

- `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- `vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs`
- `.prettierrc.json`, `.prettierignore`
- `.env.example`, `.gitignore`
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `components/Navbar.tsx`
- `lib/scoring.ts`, `lib/rotation.ts`, `lib/utils.ts`, `lib/tmdb.ts`, `lib/supabase/{client,server}.ts`
- `types/{member,movie,pick,review,rotation}.ts`
- `tests/setup.ts`, `tests/unit/lib/{scoring,rotation,env}.test.ts`, `tests/e2e/smoke.spec.ts`
- Directory structure: `components/`, `lib/`, `types/`, `tests/`, `supabase/`

### Notes

- Tailwind 4 uses CSS-first configuration (`@theme` in `app/globals.css`); there is no
  `tailwind.config.ts`. The original file list incorrectly assumed Tailwind 3.
- Next.js resolved to 16.2.12, not 15. Docs were corrected to match the installed version.
- `npm run verify` runs the full gate: format:check, lint, typecheck, test, build.

---

## CAS-002: Supabase Setup

**Status:** Complete
**Dependencies:** CAS-001

### Acceptance Criteria

- [x] Supabase project created (local dev via CLI + Docker; production at deploy time)
- [x] Database migrations created for all tables (members, movies, picks, reviews, rotation)
- [x] RLS policies created for all tables (see `harness/api-contracts.md`)
- [x] Supabase client libraries installed (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] `lib/supabase/client.ts` (browser client, anon key) created
- [x] `lib/supabase/server.ts` (server client, service role key) created
- [x] Seed data script created for local dev (`supabase/seed.sql`)
- [x] Tests for RLS policies pass (8 integration tests against local Supabase)

### Files

- `supabase/migrations/001_create_members.sql` through `006_rls_policies.sql`
- `supabase/seed.sql`
- `lib/supabase/client.ts`, `lib/supabase/server.ts`
- `types/member.ts`, `types/movie.ts`, `types/pick.ts`, `types/review.ts`, `types/rotation.ts`

---

## CAS-003: Auth (Email Signup/Login)

**Status:** Complete
**Dependencies:** CAS-002

### Acceptance Criteria

- [ ] Signup page (`/signup`) with email + password form
- [ ] Login page (`/login`) with email + password form
- [ ] Logout functionality in navbar
- [ ] `AuthProvider` context wrapping the app
- [ ] Member approval flow: new signups have `is_approved = false` until admin approves
- [ ] Unapproved members see a "pending approval" screen, cannot access member features
- [ ] Auth state persists across page navigations
- [ ] Redirect to home after login/signup
- [ ] Form validation (email format, password length)
- [ ] Error messages for invalid credentials, existing email
- [ ] Tests for auth flow (unit + E2E)

### Files

- `app/login/page.tsx`, `app/signup/page.tsx`
- `components/AuthProvider.tsx`, `components/Navbar.tsx`
- `lib/supabase/auth.ts`
- `tests/unit/components/AuthProvider.test.tsx`
- `tests/e2e/auth.spec.ts`

---

## CAS-004: TMDB Integration

**Status:** Complete
**Dependencies:** CAS-002

### Acceptance Criteria

- [ ] `lib/tmdb.ts` client created (server-side only, uses `TMDB_API_KEY`)
- [ ] `GET /api/tmdb/search?query={query}` route handler — searches TMDB, returns normalized results
- [ ] `GET /api/tmdb/{id}` route handler — fetches movie details, returns normalized data
- [ ] TMDB API key never exposed to client (server-side only)
- [ ] Error handling for TMDB API failures (rate limits, not found, network errors)
- [ ] Response types defined in `types/movie.ts`
- [ ] Tests for both API routes (mocked TMDB responses)

### Files

- `lib/tmdb.ts`
- `app/api/tmdb/search/route.ts`, `app/api/tmdb/[id]/route.ts`
- `tests/unit/api/tmdb.test.ts`

---

## CAS-005: Add Movie Page

**Status:** Complete
**Dependencies:** CAS-003, CAS-004

### Acceptance Criteria

- [ ] `/add-movie` page (client component, members only)
- [ ] TMDB search input with live results (poster, title, year)
- [ ] Selecting a movie auto-fills metadata from TMDB
- [ ] Manual entry fallback if movie not on TMDB
- [ ] Set watch date / meeting date
- [ ] "Why I picked this" note field
- [ ] Submit creates a `movie` record (if new) and a `pick` record
- [ ] Only the assigned picker for the target month can submit
- [ ] Confirmation screen after submission
- [ ] Tests for the form and submission flow

### Files

- `app/add-movie/page.tsx`
- `components/TmdbSearch.tsx`, `components/ReviewForm.tsx` (shared form patterns)
- `lib/supabase/getPicks.ts`
- `tests/unit/components/TmdbSearch.test.tsx`

---

## CAS-006: Home / Current Movie of the Month

**Status:** Complete
**Dependencies:** CAS-003, CAS-004

### Acceptance Criteria

- [ ] `/` page (server component) shows the current month's pick
- [ ] Hero banner with poster, title, year, director, runtime
- [ ] "Picked by [member name]" badge
- [ ] Watch-by date with countdown
- [ ] Synopsis from TMDB
- [ ] Personal status: "You haven't reviewed this yet" → link to review, or "You rated this X/10"
- [ ] Quick stat: "N of M reviewed"
- [ ] Next up teaser: who picks next month
- [ ] Empty state if no current movie
- [ ] Tests for the page rendering

### Files

- `app/page.tsx`
- `components/MovieHero.tsx`, `components/MemberBadge.tsx`
- `lib/supabase/getPicks.ts`, `lib/supabase/getReviews.ts`
- `tests/unit/components/MovieHero.test.tsx`

---

## CAS-007: Schedule Page

**Status:** Complete
**Dependencies:** CAS-003

### Acceptance Criteria

- [ ] `/schedule` page (server component) shows upcoming months
- [ ] Each slot: month, assigned picker, status (not picked / movie selected / locked)
- [ ] Members can click their slot to add a pick (links to `/add-movie`)
- [ ] Past months collapse into history
- [ ] Rotation logic: cycles through all active members, repeats
- [ ] Empty state if no rotation set up
- [ ] Tests for schedule rendering and rotation logic

### Files

- `app/schedule/page.tsx`
- `components/ScheduleTimeline.tsx`
- `lib/rotation.ts`, `lib/supabase/getRotation.ts`
- `tests/unit/lib/rotation.test.ts`

---

## CAS-008: Rotation Management (Admin)

**Status:** Complete
**Dependencies:** CAS-007

### Acceptance Criteria

- [ ] Admin can view the rotation order
- [ ] Admin can drag-to-reorder members
- [ ] Admin can skip a member (bumps to next cycle)
- [ ] Admin can add/remove members from rotation
- [ ] Changes persist to Supabase `rotation` table
- [ ] Only admin can access (RLS + UI guard)
- [ ] Tests for rotation management

### Files

- `app/admin/page.tsx` (rotation section)
- `components/RotationEditor.tsx`
- `lib/supabase/getRotation.ts`

---

## CAS-009: Submit Review Page

**Status:** Complete
**Dependencies:** CAS-003, CAS-006

### Acceptance Criteria

- [ ] `/review/[pickId]` page (client component, members only)
- [ ] Score slider 1–10 (whole numbers or decimals — per DESIGN.md open question)
- [ ] Written review (markdown supported)
- [ ] Optional tags: "rewatch", "first time"
- [ ] Submit creates/updates a `review` record (one per member per pick)
- [ ] Editable until the pick is locked by admin
- [ ] Score badge color updates with slider (gold/green/yellow/red)
- [ ] Confirmation after submit
- [ ] Tests for the review form

### Files

- `app/review/[pickId]/page.tsx`
- `components/ReviewForm.tsx`, `components/ui/Slider.tsx`, `components/ui/Badge.tsx`
- `lib/scoring.ts`
- `tests/unit/components/ReviewForm.test.tsx`

---

## CAS-010: Movie Detail Page

**Status:** Complete
**Dependencies:** CAS-006

### Acceptance Criteria

- [ ] `/movies/[id]` page (server component)
- [ ] Full poster + metadata (director, year, runtime, genres, TMDB rating for comparison)
- [ ] "Picked by [member] in [month year]"
- [ ] Average score prominently displayed
- [ ] Score distribution chart (how many 10s, 9s, etc.)
- [ ] Individual reviews section: member name, score badge, written review
- [ ] Sort reviews by score or by name
- [ ] "Most divisive" indicator if score variance is high
- [ ] Empty state if no reviews yet
- [ ] Tests for the page and scoring logic

### Files

- `app/movies/[id]/page.tsx`
- `components/ReviewCard.tsx`, `components/ScoreDistribution.tsx`
- `lib/scoring.ts`
- `tests/unit/lib/scoring.test.ts`, `tests/unit/components/ScoreDistribution.test.tsx`

---

## CAS-011: History / Archive Page

**Status:** Complete
**Dependencies:** CAS-010

### Acceptance Criteria

- [ ] `/history` page (server component)
- [ ] Grid of past movies, newest first
- [ ] Each card: poster, title, year, average score, number of reviewers, picker
- [ ] Sort by: year, average score, genre, picker, most divisive
- [ ] Filter by: genre, picker
- [ ] Search by title
- [ ] Click any movie → movie detail page
- [ ] Minimum review count (5) for all-time rankings
- [ ] Pagination or infinite scroll
- [ ] Tests for filtering, sorting, search

### Files

- `app/history/page.tsx`
- `components/MovieCard.tsx`
- `lib/supabase/getMovies.ts`, `lib/supabase/getPicks.ts`
- `tests/unit/components/MovieCard.test.tsx`

---

## CAS-012: Members Page + Member Profile

**Status:** Complete
**Dependencies:** CAS-010

### Acceptance Criteria

- [ ] `/members` page (server component) — grid of all approved members
- [ ] Each member card: avatar, name, average score, top movie, worst movie, harsh/easy badge
- [ ] Top movie = highest-scored review, worst movie = lowest-scored review (with poster + score)
- [ ] Click member card → `/profile/[memberId]`
- [ ] `/profile/[memberId]` page (server component)
- [ ] Avatar, name, member since
- [ ] Stats: number of reviews, average score given, average vs. club average
- [ ] "Harsh critic" / "Easy grader" badge (avg 1+ points below/above club average)
- [ ] Most-rated genre
- [ ] Pick history (which movies they've picked, with posters, links to /movies/[id])
- [ ] Review history (sortable by score or date)
- [ ] Navbar: replace "Stats" link with "Members"
- [ ] ReviewCard, MovieCard, ScheduleTimeline: link member/picker names to /profile/[memberId]
- [ ] Tests for stat calculations

### Files

- `app/members/page.tsx`
- `app/profile/[memberId]/page.tsx`
- `components/MemberCard.tsx`, `components/ProfileHeader.tsx`, `components/ProfileStats.tsx`
- `components/ProfilePickHistory.tsx`, `components/ProfileReviewHistory.tsx`
- `lib/supabase/getMembers.ts`, `lib/supabase/getProfile.ts`
- `lib/stats.ts`
- `tests/unit/lib/stats.test.ts`, `tests/unit/components/MemberCard.test.tsx`

---

## CAS-013: Stats / Insights Page

**Status:** Complete
**Dependencies:** CAS-011, CAS-012

### Acceptance Criteria

- [ ] `/stats` page (server component)
- [ ] Club leaderboard: highest-rated and lowest-rated movies of all time
- [ ] Most divisive movies (highest score variance)
- [ ] Genre breakdown of watched movies
- [ ] Club average over time trend
- [ ] Tests for aggregate queries

### Files

- `app/stats/page.tsx`
- `lib/supabase/getReviews.ts`, `lib/scoring.ts`
- `tests/unit/lib/stats.test.ts`

---

## CAS-014: Admin Dashboard

**Status:** Complete
**Dependencies:** CAS-008

### Acceptance Criteria

- [ ] `/admin` page (client component, admin only)
- [ ] Member management: approve pending, remove, set admin
- [ ] Rotation editor (from CAS-008)
- [ ] Lock/unlock months (freezes reviews after meeting)
- [ ] Edit/delete any movie or review
- [ ] Only admin can access (RLS + UI guard)
- [ ] Tests for admin actions

### Files

- `app/admin/page.tsx`
- `components/RotationEditor.tsx`
- `lib/supabase/getMembers.ts`

---

## CAS-015: Mobile Responsive Design

**Status:** Complete
**Dependencies:** CAS-013

### Acceptance Criteria

- [ ] All pages render correctly on mobile (320px), tablet (768px), and desktop (1024px+)
- [ ] Navbar collapses to hamburger menu on mobile (nav links + user menu all inside)
- [ ] Touch-friendly tap targets (min 44x44px) for all interactive elements
- [ ] Score sliders, sort buttons, and filter controls work on touch
- [ ] Grid layouts collapse to single column on mobile (members, history, stats)
- [ ] Posters and images scale proportionally
- [ ] No horizontal scroll on any page
- [ ] Forms (login, signup, add-movie, review) are usable on mobile
- [ ] Unit tests for MobileMenu component

### Implementation Plan

**Critical fixes:**

1. `Navbar.tsx` — hamburger menu below `sm` breakpoint, all links + user menu inside
2. `HistoryControls.tsx` — reduce `min-w-[200px]` to `min-w-[140px]`
3. `add-movie/page.tsx` — reduce `min-w-[200px]` to `min-w-[140px]`

**Tap target fixes (min 44px height):** 4. `ReviewsSection.tsx` — sort buttons `px-3 py-1` → `px-4 py-2` 5. `ProfileReviewHistory.tsx` — sort buttons `px-3 py-1` → `px-4 py-2` 6. `RotationEditor.tsx` — action buttons → `px-3 py-2` 7. `MemberManager.tsx` — action buttons → `px-4 py-2` 8. `PickManager.tsx` — action buttons → `px-4 py-2` 9. `ContentManager.tsx` — tab buttons → `px-4 py-2.5` 10. `ReviewForm.tsx` — checkbox labels → `px-3 py-2`

**Minor layout fixes:** 11. `movies/[id]/page.tsx` — poster `w-48` → `w-32 sm:w-48` 12. `review/[pickId]/page.tsx` — add `flex-wrap` to tag container 13. `ScheduleTimeline.tsx` — add `flex-wrap` to slot content 14. `StatsGenreBreakdown.tsx` — genre label `w-28` → `w-20 sm:w-28`

### Files

- `components/Navbar.tsx` (hamburger menu)
- `components/MobileMenu.tsx` (new)
- `app/globals.css` (responsive utilities if needed)
- `tests/unit/components/MobileMenu.test.tsx` (new)
- Multiple component files (tap target + layout fixes)

---

## CAS-016: Historical Data Entry

**Status:** Complete
**Dependencies:** CAS-014

### Acceptance Criteria

- [ ] Admin can create a pick for any past month/year (not just rotation-assigned)
- [ ] Admin can assign any approved member as the picker
- [ ] Admin can set the watch date and picker note
- [ ] Pick is created as "current" (unlocked) so members can review it
- [ ] Members can review the past pick via the normal review page
- [ ] Admin locks the pick once all reviews are in
- [ ] TMDB search integrated for finding the movie
- [ ] Tests for the PastPickForm component

### Implementation Plan

**1. PastPickForm component (new):**

- TMDB search (reuse TmdbSearch component)
- Picker dropdown (list of approved members)
- Month/year selectors (any past month)
- Watch date input
- Picker note textarea
- Creates movie (if not in DB) + pick via service role or client API
- Pick status starts as "current" so reviews can be added

**2. Admin page — new "Past Pick" tab:**

- Tab alongside Rotation, Members, Picks, Content
- Renders PastPickForm
- After creation, shows success message with link to the pick

**3. Review flow (no changes needed):**

- Pick is "current" → review page allows submissions
- Members review normally
- Admin locks via PickManager when done

### Files

- `components/PastPickForm.tsx` (new)
- `app/admin/page.tsx` (add Past Pick tab)
- `tests/unit/components/PastPickForm.test.tsx` (new)

---

## CAS-017: Vercel Deployment

**Status:** Complete
**Dependencies:** All above

### Acceptance Criteria

- [ ] Vercel project connected to GitHub repo
- [ ] Environment variables configured in Vercel
- [ ] Auto-deploy on push to `main`
- [ ] Preview deployments for PRs
- [ ] Production site accessible at the Vercel URL
- [ ] All env vars documented in `.env.example`
- [ ] README.md with full setup instructions (Supabase + Vercel)
- [ ] Admin bootstrap: `ADMIN_EMAIL` env var auto-sets admin+approved on signup
- [ ] New migration updates `handle_new_user` trigger to check admin email

### Implementation Plan

**1. Admin bootstrap migration:**

- New migration file: modify `handle_new_user()` to check if `NEW.email` matches `current_setting('app.admin_email', true)`
- If match: set `is_admin = TRUE`, `is_approved = TRUE`
- If no match: default behavior (unapproved, non-admin)
- Add `ADMIN_EMAIL` to `.env.example`

**2. README.md — full setup guide:**

- Prerequisites (Node 20+, Supabase account, Vercel account, TMDB API key)
- Step 1: Create Supabase project
- Step 2: Run migrations (via Supabase CLI or SQL Editor)
- Step 3: Get API keys from Supabase
- Step 4: Get TMDB API key
- Step 5: Create Vercel project (import from GitHub)
- Step 6: Set environment variables in Vercel
- Step 7: Deploy
- Step 8: Sign up with admin email → auto-admin
- Step 9: Invite members

**3. `.env.example` — finalized:**

- Add `ADMIN_EMAIL` variable

### Files

- `README.md` (full rewrite with deployment guide)
- `.env.example` (add ADMIN_EMAIL)
- `supabase/migrations/20260730000001_admin_bootstrap.sql` (new)

---

## CAS-018: CI Pipeline (GitHub Actions)

**Status:** Not Started
**Dependencies:** CAS-001

### Acceptance Criteria

- [ ] GitHub Actions workflow runs on every PR targeting `main`
- [ ] Workflow runs `format:check`, `lint`, `typecheck`, `test`, `build`
- [ ] Playwright E2E tests run in CI (browsers installed via cache)
- [ ] Workflow fails the PR if any gate fails
- [ ] Node version pinned to match local (`20+`)
- [ ] npm dependency cache configured for speed
- [ ] Branch protection on `main` requires the workflow to pass

### Files

- `.github/workflows/ci.yml`

### Notes

Split out of CAS-001. Without this, nothing mechanically enforces the quality gates
before merge — they rely on the developer remembering to run `npm run verify`.

## CAS-019: Forgot Password (Password Reset Flow)

**Status:** Not Started
**Dependencies:** CAS-003

### Acceptance Criteria

- [ ] "Forgot password?" text link appears below the Log In button on `/login`
- [ ] Link navigates to `/forgot-password` page with email entry form
- [ ] User enters email and submits — Supabase sends a password reset email via `resetPasswordForEmail()`
- [ ] After submitting, the form is hidden and a success message "Check your email for a reset link" is shown on the same page
- [ ] Reset email link redirects to `/reset-password` page on the app (configured in Supabase auth settings)
- [ ] `/reset-password` page has new password + confirm password fields
- [ ] Password validation: min 6 characters (same as signup), must match confirmation
- [ ] On submit, calls `supabase.auth.updateUser({ password })` to set the new password
- [ ] After successful reset, redirect to `/login` with a "Password updated successfully" success banner
- [ ] Error states handled gracefully: network error, expired/invalid token, rate limit
- [ ] Rate limit errors show friendly message (Supabase free tier limits auth emails)
- [ ] Mobile responsive (matches existing auth form styling via AuthFormShell)
- [ ] Unit tests for form validation, error mapping, and component rendering

### Files

- `app/forgot-password/page.tsx` — email entry form (client component)
- `app/reset-password/page.tsx` — new password entry form (client component)
- `lib/supabase/auth.ts` — add `validateResetPasswordForm` helper
- `app/login/page.tsx` — add "Forgot password?" link below the Log In button
- `tests/unit/components/ForgotPasswordForm.test.tsx` — form rendering + validation tests
- `tests/unit/components/ResetPasswordForm.test.tsx` — form rendering + validation tests
- `tests/unit/lib/auth.test.ts` — add `validateResetPasswordForm` tests

### Notes

Supabase provides built-in password reset via `supabase.auth.resetPasswordForEmail()`.
The redirect URL must be configured in Supabase Auth settings (already done for
Vercel URL). Email confirmation is currently disabled, but password reset emails
are a separate Supabase auth setting and should work independently.

**Decisions made during planning:**

- Post-reset: redirect to `/login` with success banner (not auto-login)
- Password rules: min 6 chars (consistent with signup)
- Email sent UX: success message on same page, form hidden
- Link placement: text link below the Log In button on `/login`
