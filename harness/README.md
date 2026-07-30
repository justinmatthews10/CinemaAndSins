# Harness Developer Guide

> **Harness Guide Version:** 1.0.0

The harness is a structured documentation system that gives AI coding agents the context they need to implement stories correctly. It's the single source of truth for the project.

You don't need to memorize the harness — the agent reads it. Your job is to **invoke the right skill**, **provide context when asked**, and **approve or redirect** the agent's work.

---

## Skills

| Skill        | When to Use                                        | What Happens                                                                                                      |
| ------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `cas-plan`   | A story needs clarification or requirements change | Agent performs gap analysis, asks you for missing context, updates the harness                                    |
| `cas-story`  | You're ready to implement a story                  | Agent reads AC, writes tests first (waits for approval), implements, verifies, updates harness, commits, opens PR |
| `cas-loop`   | Iterative engineering on a problem                 | Agent loops: implement → test → adjust → repeat until passing, with checkpoints                                   |
| `cas-review` | You need to review a PR                            | Agent runs checklist (code, security, tests, docs), addresses feedback, merges when ready                         |

---

## Typical Flow

```text
cas-plan → cas-story → cas-review → (merge)
```

1. **`cas-plan`** — Refine the story's acceptance criteria if unclear. Skip if the AC is already clear.
2. **`cas-story`** — Write tests (you approve) → implement → verify → update docs → commit → open PR.
3. **`cas-review`** — Review the PR, address any feedback, squash merge into `main`.

Use **`cas-loop`** when you hit a hard problem mid-story that needs iterative trial-and-error.

---

## Key Files

| File                              | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| `harness/cinemaandins-harness.md` | Architecture, data model, page inventory, progress     |
| `AGENTS.md`                       | Agent rules, conventions, security constraints         |
| `ideation/raw-stories.md`         | All stories with acceptance criteria                   |
| `ideation/issue-tracker.md`       | GitHub issue keys and statuses                         |
| `harness/api-contracts.md`        | Supabase schema, TMDB endpoints, env vars              |
| `harness/codebase-layout.md`      | Planned file structure                                 |
| `harness/workflows/*.md`          | Detailed workflow steps                                |
| `harness/amendments/*.md`         | History of harness changes                             |
| `harness/checkpoints/*.md`        | Per-story active status (one file per in-flight story) |

---

## Tips

- The agent stops at key checkpoints (after tests, before commit). Don't worry about it running away.
- If something looks wrong, tell the agent. The harness is a living document.
- Amendments are append-only — the agent never edits past amendments.
- The agent checks the dependency graph before starting. If a prerequisite isn't done, it will tell you.
