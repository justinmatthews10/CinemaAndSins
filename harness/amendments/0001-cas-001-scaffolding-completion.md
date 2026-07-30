# Amendment: CAS-001 Scaffolding Completion and Version Correction

> **Date:** 2026-07-29
> **Issue:** CAS-001 — Project Scaffolding

## What Changed

- Installed and configured Prettier (`prettier@3.4.2`, `eslint-config-prettier@9.1.0`) with
  `.prettierrc.json` and `.prettierignore`. `eslint-config-prettier` is loaded last in
  `eslint.config.mjs` so ESLint and Prettier cannot fight over formatting rules.
- Added `format`, `format:check`, and `verify` npm scripts. `verify` is the single
  pre-PR gate: `format:check && lint && typecheck && test && build`.
- Installed the Playwright chromium browser and added `tests/e2e/smoke.spec.ts`. The E2E
  harness was previously configured but unrunnable, so the AC could not actually be met.
- Added `tests/unit/lib/env.test.ts` to guard `.env.example` against drift and to assert
  no real secret ever lands in it.
- Corrected the documented Next.js version from **15** to **16** across `AGENTS.md`,
  `harness/cinemaandins-harness.md`, `README.md`, and `ideation/raw-stories.md`.
- Applied Prettier formatting repo-wide (mechanical; mostly markdown table alignment).
- Gitignored Playwright artifacts (`playwright-report/`, `test-results/`, `blob-report/`).
- Split CI into a new story, **CAS-016**, rather than expanding CAS-001's scope.

## Why

Verifying CAS-001's acceptance criteria against the actual repository — rather than
assuming the scaffolding commit satisfied them — surfaced four gaps:

1. **Prettier was never installed** despite the AC requiring "ESLint + Prettier configured".
2. **Playwright browsers were never installed**, so the E2E configuration was inert. A
   config file alone does not satisfy "Playwright configured for E2E tests".
3. **The docs claimed Next.js 15 but `create-next-app` installed 16.2.12.** Version drift in
   an agent rulebook is actively harmful: it sends future sessions to the wrong API docs.
4. **The story's file list named `tailwind.config.ts`**, which does not exist under
   Tailwind 4's CSS-first configuration. The list assumed Tailwind 3.

A defect introduced in the initial scaffolding commit was also fixed: `scoring.test.ts`
contained a trailing comment (`// (6^2 + 4^2) / 2 = (36+16)/2 = 26... no`) that contradicted
its own passing assertion. The assertion was correct; the comment was misleading noise.
Two further variance tests were added to pin the behaviour properly.

## Harness Sections Updated

- `AGENTS.md` Section 1 (runtime version, tooling), Section 4 (commands)
- `harness/cinemaandins-harness.md` Section 1, Section 6 (Story Status Matrix)
- `ideation/raw-stories.md` (CAS-001 AC/file list/notes, new CAS-016)
- `ideation/issue-tracker.md` (CAS-001 → Complete, new CAS-016)

## Known Follow-Ups

- **CAS-016** — nothing mechanically enforces `npm run verify` before merge until CI exists.
- The DESIGN.md open questions (decimal scores, public vs. members-only visibility) remain
  unresolved and block final data-model decisions in CAS-002.
