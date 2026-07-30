# Plan Workflow

> Use when a story's acceptance criteria are unclear, need refinement, or requirements change mid-story.

---

## Steps

1. **Read the story** — Find it in `ideation/raw-stories.md` by issue key. Read the full AC, file list, and dependencies.

2. **Read relevant context** — `harness/cinemaandins-harness.md` (architecture, data model, dependency graph) and `harness/api-contracts.md` / `harness/codebase-layout.md` if the story touches APIs or file structure.

3. **Gap analysis** — Produce a table of what's missing:

   | Gap | Category | Who can provide |
   |-----|----------|-----------------|
   | ... | ... | ... |

   Categories: missing AC, unclear requirement, undocumented pattern, missing dependency, scope change.

4. **Stop and wait** — Present the gap analysis to the developer. Wait for them to fill in the gaps or clarify.

5. **Update the story** — Incorporate the answers into `ideation/raw-stories.md`. Update the GitHub issue description to match.

6. **Update the harness** — If the planning revealed architectural or data model changes, update `harness/cinemaandins-harness.md` and create an amendment in `harness/amendments/`.

7. **Update the checkpoint** — If a checkpoint exists for this story, update its status and notes.

**Output:** The story is now fully specified and ready for `cas-story`.

> **Skip `cas-plan` if** the story's AC in `ideation/raw-stories.md` is already clear and complete.
