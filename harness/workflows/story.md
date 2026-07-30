# Story Workflow

> Use when ready to implement a story. Covers: tests → implement → verify → update docs → commit → PR.

---

## Before You Start

1. **Read the harness** — `harness/cinemaandins-harness.md`

   - Section 6 (Story Status Matrix): confirm the story's status
   - `harness/checkpoints/{ISSUE-KEY}.md` (if exists): recover prior state
   - Section 5 (Feature Dependency Graph): confirm prerequisites are done

2. **Read the story** — `ideation/raw-stories.md` — find by issue key, read AC, file list, dependencies.

3. **Read AGENTS.md** — Review conventions, forbidden actions, security rules, known pitfalls.

4. **Set up your branch**

   - `git checkout main && git pull origin main`
   - `git checkout -b feature/{ISSUE_KEY}` (or `git checkout feature/{ISSUE_KEY}` if it exists)
   - If branch exists and is behind, ask developer: merge `main` in or handle differently?
   - Never delete, rebase, or force-push branches.

5. **Create checkpoint** — Copy `harness/checkpoints/TEMPLATE.md` to `harness/checkpoints/{ISSUE-KEY}.md`, fill in story title and start date.

6. **Complexity check** — If the story touches >8 files or >3 boundaries, warn the developer and suggest batching into phases.

---

## Phase 1: Write Tests First

> Tests fail initially — that's expected.

1. Write unit tests for every new component (`tests/unit/components/`)
2. Write integration tests for every new API route (`tests/unit/api/`)
3. Mock external services (TMDB, Supabase) — never make real calls in unit tests
4. Map each test to a specific acceptance criterion

**STOP** — Present tests to the developer. Wait for approval before implementing.

If the developer raises scope changes here, pause and run `cas-plan` before continuing.

---

## Phase 2: Implement

Only after the developer approves the tests.

1. Write code to make all approved tests pass (red → green)
2. Follow naming conventions from `AGENTS.md`
3. Server Components by default; `"use client"` only for interactivity
4. Ensure Supabase RLS policies exist for any new tables
5. TMDB calls server-side only

---

## Phase 3: Verify

1. `npm run test` — all tests pass
2. `npm run typecheck` — no type errors
3. `npm run lint` — no lint errors
4. `npm run build` — production build succeeds
5. Grep for secrets — must return nothing
6. Verify coverage: every component and API route has tests

If anything fails, fix it before proceeding. Use `cas-loop` if you hit a hard problem.

---

## After Implementation

1. **Update harness** — `harness/cinemaandins-harness.md` Section 6: change story status. Update checkpoint file.
2. **Update issue tracker** — `ideation/issue-tracker.md` if status changed.
3. **Create amendment** — `harness/amendments/` — date + what changed + why.
4. **Cross-check AGENTS.md** — if new env vars or conventions emerged, update it.
5. **Record pitfalls** — if a non-obvious issue was discovered, add it to AGENTS.md Section 7.

**STOP** — Present changes to the developer. Wait for green light before committing.

---

## Commit & PR

Only after the developer approves.

1. `git add -A` — review staged files, confirm no secrets or `.env.local`
2. Self-verify against AGENTS.md forbidden actions — fix violations before committing
3. Commit:

```text
feat({ISSUE_KEY}): {short summary}

Issue: {ISSUE_KEY} — {story title}

Changes:
- {changes}

Tests:
- {test files}
```

4. `git push -u origin feature/{ISSUE_KEY}`
5. Open PR targeting `main` — title: `feat({ISSUE_KEY}): {short summary}`, link the GitHub issue.

The story now moves to `cas-review`.
