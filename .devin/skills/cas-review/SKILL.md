---
name: cas-review
description: Review a CinemaAndSins PR. Runs a 6-section checklist, addresses feedback, and merges when ready.
---

# CinemaAndSins: Review

Run the review workflow defined in `harness/workflows/review.md`.

## Quick Reference

1. **Read the PR** — `gh pr view {PR_NUMBER}` for description, linked issue, changed files
2. **Read the diff** — `gh pr diff {PR_NUMBER}`
3. **Run the checklist:**

   ### Code Correctness
   - Logic matches AC
   - Edge cases handled (empty, error, loading states)
   - No dead code or unused imports
   - Types correct and complete

   ### Security
   - No secrets in code
   - RLS policies in place for new tables
   - No TMDB calls in client components
   - No service role key in client code
   - No PII in logs

   ### Testing
   - `npm run test` passes
   - `npm run typecheck` passes
   - `npm run lint` passes
   - `npm run build` succeeds
   - Every new component/API route has tests
   - No tests deleted or weakened

   ### Conventions
   - Naming conventions followed
   - Server Components by default
   - No debugging statements
   - Files in correct directories

   ### Documentation
   - Harness Section 6 updated
   - Checkpoint updated
   - Amendment created
   - Issue tracker updated

   ### Merge Readiness
   - PR targets `main`
   - PR description matches commit
   - GitHub issue linked

4. **Report findings** — pass/fail per section. Fix failures (use `cas-loop` if needed).
5. **Address feedback** — read PR comments via `gh pr view {PR_NUMBER} --comments`, validate each, implement fixes, re-run tests.
6. **Merge** — once everything passes and developer approves:
   ```bash
   gh pr merge {PR_NUMBER} --squash --delete-branch
   ```
7. **Cleanup:**
   - Delete `harness/checkpoints/{ISSUE-KEY}.md`
   - Update harness Section 6: mark Complete
   - Update issue tracker: mark closed
   - Close GitHub issue: `gh issue close {ISSUE_KEY}`
