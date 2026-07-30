---
name: cas-story
description: Implement a CinemaAndSins story. Tests first (await approval), then implement, verify, update docs, commit, and open a PR.
---

# CinemaAndSins: Story

Run the story workflow defined in `harness/workflows/story.md`.

## Quick Reference

### Before You Start
1. Read `harness/cinemaandins-harness.md` (Section 6 for status, Section 5 for dependencies)
2. Read the story from `ideation/raw-stories.md` by issue key
3. Read `AGENTS.md` (conventions, forbidden actions, pitfalls)
4. Set up branch: `git checkout main && git pull && git checkout -b feature/{ISSUE_KEY}`
5. Create checkpoint: copy `harness/checkpoints/TEMPLATE.md` → `harness/checkpoints/{ISSUE_KEY}.md`
6. Complexity check: if >8 files or >3 boundaries, warn and suggest batching

### Phase 1: Tests First
1. Write unit tests for every new component, integration tests for every API route
2. Mock external services (TMDB, Supabase)
3. Map each test to an acceptance criterion
4. **STOP** — present tests, wait for developer approval

### Phase 2: Implement
1. Write code to make tests pass (red → green)
2. Server Components by default; `"use client"` only for interactivity
3. Ensure RLS policies exist for new tables
4. TMDB calls server-side only

### Phase 3: Verify
1. `npm run test` — all pass
2. `npm run typecheck` — no errors
3. `npm run lint` — no errors
4. `npm run build` — succeeds
5. Grep for secrets — nothing found

If stuck, use `cas-loop`.

### After Implementation
1. Update `harness/cinemaandins-harness.md` Section 6 (story status)
2. Update checkpoint file
3. Update `ideation/issue-tracker.md`
4. Create amendment in `harness/amendments/`
5. Record pitfalls in `AGENTS.md` Section 7 if any found
6. **STOP** — present changes, wait for developer approval

### Commit & PR
1. `git add -A` — verify no secrets staged
2. Self-verify against AGENTS.md forbidden actions
3. Commit: `feat({ISSUE_KEY}): {summary}` with full body
4. `git push -u origin feature/{ISSUE_KEY}`
5. Open PR targeting `main`, link the GitHub issue

## Context Efficiency

- Read only the specific story from `ideation/raw-stories.md`, not the whole file
- Read only relevant harness sections (use `AGENTS.md` Section 3 routing table)
- For stories touching >5 files, batch into phases — commit each before starting the next
- Use the todo list to track progress — don't re-read files to recall state
