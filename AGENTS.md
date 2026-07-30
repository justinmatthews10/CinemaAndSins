# AGENTS.md — AI Coding Agent Rules for CinemaAndSins

> Strict rulebook for writing code in this repo. Fetch additional context only when needed using the routing table below.

---

## 1. Project Identity

- **Repo:** `CinemaAndSins` — CinemaAndSins Movie Club
- **Purpose:** Members-only web app for scheduling monthly movie picks, recording 1–10 scores and written reviews, and archiving club history
- **Runtime:** `Node.js 20+, Next.js 16 (App Router), TypeScript 5+, Tailwind CSS 4`
- **Backend/Auth/DB:** Supabase (Postgres + email auth + row-level security)
- **Movie data:** TMDB API (free) for posters, synopsis, year, director, runtime, genre
- **Testing:** `npm run test` (Vitest), `npm run test:e2e` (Playwright)
- **Linting:** `npm run lint` (ESLint), `npm run format` (Prettier)
- **Full gate:** `npm run verify`
- **Base branch:** `main`

---

## 2. Critical Directives

**Non-negotiable. Violating any is a blocking issue.**

### Security Rules

1. **No secrets in code** — use `.env.local` for local dev, Vercel env vars for production.
2. **Supabase RLS required** — every table must have RLS policies. Never disable RLS.
3. **No PII in logs** — never log emails, passwords, tokens, or full request bodies.
4. **TMDB API key server-side only** — never expose to the client. All TMDB calls go through server-side API routes or server components.

### Forbidden Actions

- Hardcode API URLs, credentials, timeouts, or cache TTLs — use env vars or config
- Install new npm packages without verifying compatibility with `Node.js 20+, Next.js 16, TypeScript 5+`
- Delete or weaken existing tests
- Commit `.env.local` or secrets
- Create files outside the established directory structure (see `harness/codebase-layout.md`)
- Use debugging statements (`console.log`, `debugger`) in committed code
- Use `git commit --amend`, `git push --force`, or `git push --force-with-lease`
- Rebase feature branches — rewrites history and breaks review context
- Disable Supabase RLS on any table
- Expose Supabase service role keys to the client
- Make TMDB API calls from client components

---

## 3. Context Routing

**Do NOT read everything upfront. Fetch context only when needed.**

| If you need to...                                     | Read this file                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Understand architecture, data model, or project state | `harness/cinemaandins-harness.md`                                           |
| Check feature statuses                                | `harness/cinemaandins-harness.md` Section 6                                 |
| Check what's in progress                              | `harness/checkpoints/` (one `{ISSUE-KEY}.md` per active story)              |
| Implement a story                                     | `.devin/skills/cas-story/SKILL.md` + the story in `ideation/raw-stories.md` |
| Plan a story                                          | `.devin/skills/cas-plan/SKILL.md`                                           |
| Run iterative loop engineering                        | `.devin/skills/cas-loop/SKILL.md`                                           |
| Review a PR                                           | `.devin/skills/cas-review/SKILL.md`                                         |
| Check GitHub issue statuses                           | `ideation/issue-tracker.md`                                                 |
| Look up API endpoints, schema, or env vars            | `harness/api-contracts.md`                                                  |
| Look up planned directory structure                   | `harness/codebase-layout.md`                                                |

---

## 4. Conventions

### Coding Standards

- **Runtime:** `Node.js 20+, Next.js 16 (App Router), TypeScript 5+, Tailwind CSS 4`
- ESLint + Prettier for TS/JS
- Type-hint all function parameters and return types
- Use **environment variables** for all tunables
- Use **Supabase client** for data access — never raw SQL in components
- **One component per file** — co-locate tests next to components
- Use **Server Components** by default; `"use client"` only when interactivity is required
- Use **Supabase RLS** for authorization — do not duplicate in app code

### Design System

- **Theme:** Dark cinematic. Near-black background (`#0a0a0f`), warm accent (amber/gold `#f5a623` or deep red `#c0392b`)
- **Posters** are the visual anchor — large, high quality
- **Typography:** Display serif for titles + clean sans for body
- **Score badges:** Gold 9–10, Green 7–8, Yellow 5–6, Red 1–4
- Subtle film-grain texture or vignette on hero sections

### Naming Conventions

| Type          | Pattern                   | Example                          |
| ------------- | ------------------------- | -------------------------------- |
| Page          | `app/{route}/page.tsx`    | `app/movies/[id]/page.tsx`       |
| Component     | `{Name}.tsx` (PascalCase) | `MovieCard.tsx`                  |
| Hook          | `use{Feature}.ts`         | `useMember.ts`                   |
| Service / lib | `{feature}.ts`            | `tmdb.ts`, `supabase.ts`         |
| Test          | `{Name}.test.ts(x)`       | `MovieCard.test.tsx`             |
| E2E test      | `{feature}.spec.ts`       | `auth.spec.ts`                   |
| Type          | `{Name}` (PascalCase)     | `Movie`, `Review`                |
| DB table      | snake_case, plural        | `members`, `movies`              |
| DB column     | snake_case                | `created_at`, `picker_member_id` |

### Commands

```bash
npm run verify        # Full gate: format:check + lint + typecheck + test + build
npm run test          # Unit/integration (Vitest) — run before every submission
npm run test:e2e      # E2E (Playwright)
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix lint
npm run format        # Prettier — write
npm run format:check  # Prettier — check only
npm run typecheck     # TypeScript check
npm run build         # Production build
```

`npm run verify` is the single command to run before opening a PR.

---

## 5. Git Workflow

- **Base branch:** `main` — never commit directly to it
- **Feature branches:** `feature/{ISSUE-KEY}` (e.g. `feature/CAS-001`)
- **Commit format:**

```text
feat({ISSUE-KEY}): {short summary}

Issue: {ISSUE-KEY} — {story title}

Changes:
- {bullet list of changes}

Tests:
- {bullet list of test files}
```

- **PRs target `main`** — squash merge on approval

---

## 6. After Completing Work

1. Run `npm run test` — all tests pass
2. Run `npm run typecheck` — no errors
3. Grep for secrets — must return nothing
4. Update `harness/cinemaandins-harness.md` Section 6 and the story's checkpoint
5. Update `ideation/issue-tracker.md` if status changed
6. Create an amendment in `harness/amendments/`
7. If a non-obvious pitfall was discovered, add it to Section 7

---

## 7. Known Pitfalls

> **Living document.** Add entries when debugging reveals non-obvious gotchas.

```markdown
#### [Short title]

- **Symptom:** [What went wrong]
- **Wrong approach:** [What didn't work and why]
- **Correct fix:** [What solved it]
- **Why it's non-obvious:** [Why an agent would make this mistake]
- **Added:** YYYY-MM-DD (Issue X.X)
```

#### Supabase: auth.users ON CONFLICT (email) fails

- **Symptom:** Seed file fails with "there is no unique or exclusion constraint matching the ON CONFLICT specification" when inserting into `auth.users`.
- **Wrong approach:** Using `ON CONFLICT (email) DO NOTHING` — `auth.users` has no unique constraint on `email`, only a partial unique index (`users_email_partial_key WHERE is_sso_user = false`), which doesn't match.
- **Correct fix:** Use `ON CONFLICT (id) DO NOTHING` since `id` is the primary key.
- **Why it's non-obvious:** Most tables with an email column have a plain unique constraint. Supabase's auth schema uses a partial index to allow SSO users to share emails.
- **Added:** 2026-07-29 (CAS-002)

#### Supabase: new tables not accessible to anon/authenticated roles

- **Symptom:** RLS policies exist but `SET ROLE anon; SELECT * FROM movies;` returns "permission denied for table movies".
- **Wrong approach:** Assuming RLS policies alone grant access. They don't — RLS filters rows, but the role still needs `GRANT SELECT` to even attempt the query.
- **Correct fix:** Add explicit `GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;` and write grants for authenticated.
- **Why it's non-obvious:** Older Supabase versions auto-exposed new tables. The 2026+ default changed to require explicit grants, and the config option to restore old behavior (`auto_expose_new_tables`) is deprecated.
- **Added:** 2026-07-29 (CAS-002)

#### Vitest: .env.local not loaded automatically

- **Symptom:** Integration tests fail with "supabaseUrl is required" even though `.env.local` exists.
- **Wrong approach:** Assuming Vitest loads `.env.local` like Next.js does. It doesn't.
- **Correct fix:** Manually parse `.env.local` in `tests/setup.ts` using Node's `fs` module — no new dependency needed.
- **Why it's non-obvious:** Next.js loads `.env.local` transparently. Vitest uses Vite's env system which loads `.env` files into `import.meta.env`, not `process.env`.
- **Added:** 2026-07-29 (CAS-002)

#### Next.js 16: cross-origin dev resources blocked by default

- **Symptom:** Client-side hydration silently fails in browser preview — forms do native GET submission, buttons don't fire onClick, no console errors.
- **Wrong approach:** Debugging the form/component code. The issue is that Next.js 16 blocks cross-origin requests to dev resources (HMR, chunks) when accessed through a proxy like the browser preview at `127.0.0.1`.
- **Correct fix:** Add `allowedDevOrigins: ["127.0.0.1", "localhost"]` to `next.config.ts`.
- **Why it's non-obvious:** There are no errors in the browser console — the JS just doesn't load. The only hint is a server-side warning about blocked cross-origin requests.
- **Added:** 2026-07-30 (CAS-003)

#### AuthProvider: member not loaded before auth-gated pages redirect

- **Symptom:** `/add-movie` redirects to `/login` even when the user is logged in. Console shows `user: true, member: false` on first render.
- **Wrong approach:** Checking `authLoading` alone. The `onAuthStateChange` callback set `loading(false)` immediately after getting the session, before `fetchMember` completed.
- **Correct fix:** In `onAuthStateChange`, only set `loading(false)` after `fetchMember` resolves (or immediately if no session).
- **Why it's non-obvious:** The initial `getSession` path already waited for `fetchMember`, but the `onAuthStateChange` path didn't — and `onAuthStateChange` fires first on page load.
- **Added:** 2026-07-30 (CAS-005)

#### TMDB: placeholder API key causes 401 with no clear hint

- **Symptom:** TMDB search returns 500 with `{"error":"TMDB API error: 401 Unauthorized"}`.
- **Wrong approach:** Assuming the TMDB client code is wrong. The actual issue is the `.env.local` has a placeholder value.
- **Correct fix:** Replace `TMDB_API_KEY` in `.env.local` with a real v3 API key from themoviedb.org/settings/api.
- **Why it's non-obvious:** The 401 comes from TMDB, not our code, but the error message doesn't mention the API key.
- **Added:** 2026-07-30 (CAS-005)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
