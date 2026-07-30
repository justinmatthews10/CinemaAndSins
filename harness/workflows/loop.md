# Loop Workflow

> Use for iterative engineering on a hard problem — implement → test → adjust → repeat until passing.

---

## When to Use

- A story is in Phase 2 (Implement) or Phase 3 (Verify) and you hit a problem that needs trial-and-error
- Tests are failing and the fix isn't obvious
- A build or type error requires multiple attempts to resolve
- You need to explore an unfamiliar API or pattern before settling on an approach

---

## Steps

1. **State the problem** — Clearly describe what's failing and what success looks like.

2. **Attempt a fix** — Make the smallest reasonable change that could work.

3. **Test immediately** — Run the relevant test (not the full suite — just the failing one):

   ```bash
   npm run test -- --run {test-file}
   ```

4. **Evaluate** — Did it pass?

   - **Yes** → Run the full suite (`npm run test`) + typecheck (`npm run typecheck`) to confirm no regressions. If clean, exit the loop.
   - **No** → Read the error, understand why, go to step 2.

5. **Checkpoint every 3 attempts** — After 3 failed attempts, STOP and:

   - Summarize what you've tried and why each failed
   - Ask the developer for guidance or permission to try a different approach
   - This prevents spinning on the same problem indefinitely

6. **Exit gate** — The loop exits when:

   - The targeted test passes
   - The full test suite passes (`npm run test`)
   - Typecheck passes (`npm run typecheck`)
   - Build succeeds (`npm run build`)

7. **Record pitfalls** — If the solution was non-obvious (3+ attempts, or the developer corrected your approach), add a pitfall to `AGENTS.md` Section 7.

---

## Rules

- Make small, incremental changes — don't rewrite large chunks at once
- Run the targeted test after each change, not the full suite (faster feedback)
- Never disable a test to make it pass — fix the underlying issue
- Never skip typecheck or lint to "deal with later"
- If you find yourself changing the same file 5+ times, step back and reconsider the approach
