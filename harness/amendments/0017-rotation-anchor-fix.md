# Amendment 0017 — Rotation Anchor Fix

**Date:** 2026-07-30
**Story:** Post-launch bugfix (CAS-016 historical data entry)
**Status:** Complete

## What Changed

- `lib/supabase/picks.ts` — `getAssignedPicker` now uses the **latest** pick as the rotation anchor instead of the **earliest** pick
- `tests/unit/lib/picks.test.ts` — added test case for historical past picks not breaking future rotation

## Why

When a user added historical past picks via the Past Pick form for people at the bottom of the rotation, the rotation calculation for future months broke — showing the wrong picker.

**Root cause:** The algorithm anchored on the earliest pick (by month/year). Historical picks for earlier months shifted the anchor to someone at the bottom of the rotation, throwing off the offset calculation for all future months.

**Example:**
- Rotation: Sam(0), Luke(1), Hank(2), D(3), E(4)
- Sam picked for June (real pick through the app)
- User added historical picks: D for March, E for April
- Old (earliest anchor): anchor=D(March, index 3), July = (3 + 4) % 5 = Hank ❌
- New (latest anchor): anchor=Sam(June, index 0), July = (0 + 1) % 5 = Luke ✓

## Fix

Use the most recent pick (by month/year) as the anchor. Historical picks for earlier months don't shift the anchor, so the rotation continues correctly from the most recent real pick.

## Harness Sections Updated

- `AGENTS.md` Section 7 — added pitfall entry
