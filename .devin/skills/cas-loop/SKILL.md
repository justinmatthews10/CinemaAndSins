---
name: cas-loop
description: Iterative engineering loop for CinemaAndSins. Implement → test → adjust → repeat until passing, with checkpoints every 3 attempts.
---

# CinemaAndSins: Loop

Run the loop workflow defined in `harness/workflows/loop.md`.

## Quick Reference

1. **State the problem** — what's failing and what success looks like
2. **Attempt a fix** — smallest reasonable change
3. **Test immediately** — run just the failing test: `npm run test -- --run {test-file}`
4. **Evaluate:**
   - Pass → run full suite + typecheck → if clean, exit loop
   - Fail → read error, understand why, go to step 2
5. **Checkpoint every 3 attempts** — STOP, summarize what you tried, ask developer for guidance
6. **Exit gate:** targeted test passes + full suite passes + typecheck passes + build succeeds
7. **Record pitfalls** — if 3+ attempts or developer corrected your approach, add to `AGENTS.md` Section 7

## When to Use

- Tests failing and the fix isn't obvious
- Build or type errors needing multiple attempts
- Exploring an unfamiliar API or pattern
- Any hard problem mid-story needing trial-and-error

## Rules

- Small, incremental changes — don't rewrite large chunks at once
- Run the targeted test after each change, not the full suite
- Never disable a test to make it pass
- Never skip typecheck or lint
- If changing the same file 5+ times, step back and reconsider
