# Codebase Layout — Planned Structure

> **Extracted from:** `harness/cinemaandins-harness.md` — detailed reference material loaded on-demand to reduce required reading scope.

---

## Planned Structure

```text
CinemaAndSins/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (theme, auth provider, nav)
│   ├── page.tsx                  # Home / Current Movie of the Month
│   ├── globals.css               # Tailwind + global styles
│   ├── schedule/
│   │   └── page.tsx              # Schedule timeline
│   ├── history/
│   │   └── page.tsx              # Archive grid (sort, filter, search)
│   ├── movies/
│   │   └── [id]/
│   │       └── page.tsx          # Movie detail with reviews
│   ├── add-movie/
│   │   └── page.tsx              # Member pick page (TMDB search, change/remove)
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard (rotation management)
│   ├── review/
│   │   └── [pickId]/
│   │       └── page.tsx          # Submit/edit review (score slider, markdown)
│   ├── members/
│   │   └── page.tsx              # Members grid (top/worst movies, avg score, badges)
│   ├── profile/
│   │   └── [memberId]/
│   │       └── page.tsx          # Full member profile (stats, pick/review history)
│   ├── stats/
│   │   └── page.tsx              # Club-wide insights (leaderboard, divisive, genres, trend)
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard
│   ├── login/
│   │   └── page.tsx              # Email + password login
│   ├── signup/
│   │   └── page.tsx              # Email + password signup
│   └── api/
│       └── tmdb/
│           ├── search/
│           │   └── route.ts      # TMDB movie search (server-side)
│           └── [id]/
│               └── route.ts      # TMDB movie details (server-side)
├── components/                   # Reusable React components
│   ├── MovieHero.tsx             # Current movie hero banner
│   ├── PosterImage.tsx           # Poster with no-poster fallback
│   ├── PageHeading.tsx           # Standard page heading (Playfair font)
│   ├── ScheduleTimeline.tsx      # Schedule timeline with pick status
│   ├── RotationEditor.tsx        # Admin rotation management (reorder, skip, toggle)
│   ├── MemberManager.tsx         # Admin member management (approve, remove, admin)
│   ├── PickManager.tsx           # Admin pick locking (lock/unlock months)
│   ├── ContentManager.tsx        # Admin content management (delete movies/reviews)
│   ├── PastPickForm.tsx          # Admin form for creating historical picks
│   ├── ReviewForm.tsx            # Score slider + markdown review + tags
│   ├── TmdbSearch.tsx            # TMDB search input + results
│   ├── FormField.tsx             # Reusable input + label + error
│   ├── AuthFormShell.tsx         # Shared auth form layout (card, title, footer)
│   ├── Navbar.tsx                # Top navigation (desktop nav + mobile hamburger)
│   ├── MobileMenu.tsx            # Hamburger menu for mobile (nav links + user menu)
│   ├── AuthProvider.tsx          # Supabase auth context provider
│   ├── MovieCard.tsx             # Poster + title + score (history grid card)
│   ├── ReviewCard.tsx            # Individual review (name, score badge, text, tags)
│   ├── HistoryControls.tsx       # Sort/filter/search/pagination for history grid
│   ├── MemberCard.tsx            # Member card (avatar, avg, top/worst movies, badge)
│   ├── ProfileHeader.tsx         # Profile avatar, name, avg score, harsh/easy badge
│   ├── ProfileStats.tsx          # Profile stats grid (reviews, avg, vs club, genre)
│   ├── ProfilePickHistory.tsx    # Member's pick history (posters, links to movies)
│   ├── ProfileReviewHistory.tsx  # Sortable review history (client component)
│   ├── StatsLeaderboard.tsx      # Highest/lowest rated movies (two columns)
│   ├── StatsDivisive.tsx         # Most divisive movies by score variance
│   ├── StatsGenreBreakdown.tsx   # Genre bars with count + avg score
│   ├── StatsTrendChart.tsx       # Club average over time (bar chart)
│   ├── ReviewsSection.tsx        # Sortable reviews list + distribution chart
│   ├── ScoreDistribution.tsx     # Horizontal bar chart showing score spread
│   └── RotationEditor.tsx        # Admin drag-to-reorder rotation
├── lib/                          # Shared utilities
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (anon key)
│   │   ├── server.ts             # Server Supabase client (service role)
│   │   ├── auth.ts               # Auth validation + error mapping
│   │   ├── picks.ts              # Pick CRUD + getAssignedPicker logic
│   │   ├── getCurrentPick.ts     # Server-side fetcher for home page
│   │   ├── getSchedule.ts        # Server-side fetcher for schedule page
│   │   ├── getMovieDetail.ts     # Server-side fetcher for movie detail page
│   │   ├── getHistory.ts         # Server-side fetcher for history page
│   │   ├── getMembers.ts         # Server-side fetcher for members page
│   │   ├── getProfile.ts         # Server-side fetcher for member profile page
│   │   └── getStats.ts           # Server-side fetcher for stats page
│   ├── tmdb.ts                   # TMDB API client (server-side)
│   ├── scoring.ts                # Average calculation, score distribution
│   ├── stats.ts                  # Member stat calculations (avg, harsh/easy, genre)
│   ├── stats-aggregate.ts        # Club-wide stat aggregations (leaderboard, divisive, genres, trend)
│   ├── rotation.ts               # Rotation logic (next picker, skip/bump)
│   ├── ui.ts                     # Shared CSS class constants
│   └── utils.ts                  # General utilities (formatDate, formatScore, cn)
├── types/                        # TypeScript type definitions
│   ├── movie.ts
│   ├── pick.ts
│   ├── review.ts
│   ├── member.ts
│   ├── rotation.ts
│   ├── history.ts                # HistoryEntry, HistoryData, DIVISIVE_MIN_REVIEWS
│   └── member-summary.ts         # MemberSummary, ProfileData
├── supabase/                     # Supabase migrations and policies
│   ├── migrations/
│   │   ├── 001_create_members.sql
│   │   ├── 002_create_movies.sql
│   │   ├── 003_create_picks.sql
│   │   ├── 004_create_reviews.sql
│   │   ├── 005_create_rotation.sql
│   │   └── 006_rls_policies.sql
│   └── seed.sql                  # Seed data for local dev
├── tests/                        # Vitest unit/integration tests
│   ├── unit/
│   │   ├── components/
│   │   ├── lib/
│   │   └── api/
│   └── e2e/                      # Playwright E2E tests
│       ├── auth.spec.ts
│       ├── schedule.spec.ts
│       ├── review.spec.ts
│       └── history.spec.ts
├── harness/                      # Project documentation harness
│   ├── README.md
│   ├── cinemaandins-harness.md
│   ├── repo-config.yml
│   ├── codebase-layout.md
│   ├── api-contracts.md
│   ├── amendments/
│   ├── checkpoints/
│   ├── adrs/
│   └── workflows/
├── ideation/                     # Story breakdown and tracking
│   ├── raw-stories.md
│   └── issue-tracker.md
├── .devin/                       # Devin CLI skills
│   └── skills/
│       ├── cas-story/
│       ├── cas-plan/
│       ├── cas-subtask/
│       ├── cas-review/
│       ├── cas-pr/
│       ├── cas-pr-comments/
│       ├── cas-testing/
│       ├── cas-merge/
│       └── cas-update-harness/
├── public/                       # Static assets
│   └── icons/
├── .env.local                    # Local env (gitignored)
├── .env.example                  # Env template (committed)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.mjs
├── package.json
└── README.md
```

---

## Cross-Repo Changes

No cross-repo changes expected. This is a standalone application.
