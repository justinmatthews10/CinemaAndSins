---
name: cas-plan
description: Plan or refine a CinemaAndSins story. Performs gap analysis, asks for missing context, and updates the harness.
---

# CinemaAndSins: Plan

Run the plan workflow defined in `harness/workflows/plan.md`.

## Quick Reference

1. Read the story from `ideation/raw-stories.md` by issue key
2. Read `harness/cinemaandins-harness.md` for architecture and dependency context
3. Read `harness/api-contracts.md` and `harness/codebase-layout.md` if the story touches APIs or file structure
4. Produce a gap analysis table (what's missing, category, who can provide)
5. **STOP** — present gaps to the developer, wait for answers
6. Update `ideation/raw-stories.md` with refined AC
7. Update the GitHub issue description to match
8. Create an amendment in `harness/amendments/` if architectural changes emerged
9. Update the story checkpoint if one exists

## When to Use

- A story's acceptance criteria are unclear or incomplete
- Requirements change mid-story
- A story references undocumented patterns
- The developer says "let's plan this one first"

## When NOT to Use

- The story's AC is already clear and complete — go straight to `cas-story`
