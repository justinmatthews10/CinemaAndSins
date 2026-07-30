# Review Workflow

> Use when a PR is ready for review. Covers: checklist → address feedback → merge.

---

## Steps

1. **Read the PR** — `gh pr view {PR_NUMBER}` to get the description, linked issue, and changed files.

2. **Read the diff** — `gh pr diff {PR_NUMBER}` to review all changes.

3. **Run the checklist:**

   ### Code Correctness
   - [ ] Logic matches the story's acceptance criteria
   - [ ] Edge cases handled (empty states, error states, loading states)
   - [ ] No dead code or unused imports
   - [ ] Types are correct and complete

   ### Security
   - [ ] No secrets in code
   - [ ] Supabase RLS policies in place for any new tables
   - [ ] No TMDB calls in client components
   - [ ] No Supabase service role key in client code
   - [ ] No PII in logs

   ### Testing
   - [ ] `npm run test` passes
   - [ ] `npm run typecheck` passes
   - [ ] `npm run lint` passes
   - [ ] `npm run build` succeeds
   - [ ] Every new component/API route has tests
   - [ ] No tests were deleted or weakened

   ### Conventions
   - [ ] Naming conventions followed (see `AGENTS.md`)
   - [ ] Server Components by default; `"use client"` only for interactivity
   - [ ] No debugging statements (`console.log`, `debugger`)
   - [ ] Files in the correct directories

   ### Documentation
   - [ ] `harness/cinemaandins-harness.md` Section 6 updated
   - [ ] Checkpoint file updated
   - [ ] Amendment created
   - [ ] `ideation/issue-tracker.md` updated if status changed

   ### Merge Readiness
   - [ ] PR targets `main`
   - [ ] PR description matches commit message
   - [ ] GitHub issue linked in PR

4. **Report findings** — Present pass/fail for each section. If anything fails, fix it (use `cas-loop` if needed) before proceeding.

5. **Address feedback** — If the developer left review comments on the PR:
   - `gh pr view {PR_NUMBER} --comments` to read them
   - Validate each comment (legit / debatable / incorrect) — discuss debatable ones
   - Implement fixes one at a time, commit, push
   - Re-run tests after each fix

6. **Merge** — Once everything passes and the developer approves:
   ```bash
   gh pr merge {PR_NUMBER} --squash --delete-branch
   ```

7. **Cleanup** —
   - Delete `harness/checkpoints/{ISSUE-KEY}.md`
   - Update `harness/cinemaandins-harness.md` Section 6: mark story as Complete
   - Update `ideation/issue-tracker.md`: mark issue as closed
   - Close the GitHub issue if not auto-closed: `gh issue close {ISSUE_KEY}`
