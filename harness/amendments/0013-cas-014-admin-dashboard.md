# Amendment 0013 — CAS-014: Admin Dashboard

**Date:** 2026-07-30
**Story:** CAS-014 — Admin Dashboard
**Status:** Complete

## What was built

- `app/admin/page.tsx` — refactored with 4 tabs (rotation, members, picks, content)
- `components/MemberManager.tsx` — approve pending members, remove members, toggle admin
- `components/PickManager.tsx` — lock/unlock picks (freezes/unfreezes reviews)
- `components/ContentManager.tsx` — tabbed view of movies and reviews with delete actions

## Features

### Rotation tab (existing from CAS-008)

- Reorder, skip, activate/deactivate, add to rotation

### Members tab (new)

- Pending approval section with Approve and Remove buttons
- Approved members list with Make/Remove admin and Remove buttons
- Admin badge shown next to admin members

### Picks tab (new)

- All picks listed with poster, title, picker, month/year, status badge
- Lock button (non-locked picks) — freezes reviews via RLS policy
- Unlock button (locked picks) — reopens reviews

### Content tab (new)

- Movies sub-tab: list with poster, title, year, review count, delete button
- Reviews sub-tab: list with score badge, member name, movie title, review text, delete button

## Tests

- `tests/unit/components/MemberManager.test.tsx` — 7 tests
- `tests/unit/components/PickManager.test.tsx` — 6 tests
- `tests/unit/components/ContentManager.test.tsx` — 5 tests

## Decisions

- Admin page uses tab-based navigation (Rotation, Members, Picks, Content)
- All data loaded in a single Promise.all on page load
- RLS policies from CAS-002 already support all admin operations
- Delete actions are immediate (no confirmation modal — kept simple for trusted admin)
- Pick lock/unlock changes status between "locked" and "current"
