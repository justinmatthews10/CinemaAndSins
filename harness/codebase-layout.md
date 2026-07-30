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
│   │   └── page.tsx              # Archive grid
│   ├── movies/
│   │   └── [id]/
│   │       └── page.tsx          # Movie detail with reviews
│   ├── add-movie/
│   │   └── page.tsx              # Member pick submission (TMDB search)
│   ├── review/
│   │   └── [pickId]/
│   │       └── page.tsx          # Submit/edit review
│   ├── profile/
│   │   └── [memberId]/
│   │       └── page.tsx          # Member profile with stats
│   ├── stats/
│   │   └── page.tsx              # Club-wide insights
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
│   ├── ui/                       # Primitive UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx             # Score badges (gold/green/yellow/red)
│   │   ├── Input.tsx
│   │   ├── Slider.tsx            # Score slider 1-10
│   │   └── Modal.tsx
│   ├── MovieCard.tsx             # Poster + title + score (history grid)
│   ├── MovieHero.tsx             # Current movie hero banner
│   ├── ReviewCard.tsx            # Individual review display
│   ├── ReviewForm.tsx            # Score + markdown review input
│   ├── ScoreDistribution.tsx     # Chart showing score spread
│   ├── ScheduleTimeline.tsx      # Upcoming picks timeline
│   ├── RotationEditor.tsx        # Admin drag-to-reorder rotation
│   ├── MemberBadge.tsx           # Member name + avatar
│   ├── TmdbSearch.tsx            # TMDB search input + results
│   ├── Navbar.tsx                # Top navigation
│   ├── AuthProvider.tsx          # Supabase auth context provider
│   └── Footer.tsx
├── lib/                          # Shared utilities
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (anon key)
│   │   ├── server.ts             # Server Supabase client (service role)
│   │   ├── getMovies.ts          # Query helpers
│   │   ├── getPicks.ts
│   │   ├── getReviews.ts
│   │   ├── getMembers.ts
│   │   └── getRotation.ts
│   ├── tmdb.ts                   # TMDB API client (server-side)
│   ├── scoring.ts                # Average calculation, score distribution
│   ├── rotation.ts               # Rotation logic (next picker, skip/bump)
│   └── utils.ts                  # General utilities (formatting, etc.)
├── types/                        # TypeScript type definitions
│   ├── movie.ts
│   ├── pick.ts
│   ├── review.ts
│   ├── member.ts
│   └── rotation.ts
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
