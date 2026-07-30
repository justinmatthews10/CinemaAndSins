# Amendment 0007 — CAS-008: Rotation Management (Admin)

**Date:** 2026-07-30
**Story:** CAS-008 — Rotation Management (Admin)
**Status:** Complete

## What was built

- `app/admin/page.tsx` — admin-only page for managing rotation
  - Admin guard: redirects non-admins to home, shows "Access Denied" if bypassed
  - Fetches rotation and members from Supabase
  - Handles reorder, toggle active, skip, and add operations
  - Success/error messages for each action
- `components/RotationEditor.tsx` — rotation management UI
  - Active rotation list with order numbers (1, 2, 3...)
  - Up/down arrow buttons to reorder (disabled at boundaries)
  - Skip button (bumps member to next cycle)
  - Deactivate/Activate toggle
  - Members not in rotation shown with "Add to rotation" button
  - Inactive members shown in separate section

## Tests

- `tests/unit/components/RotationEditor.test.tsx` — 10 tests
  (rendering members, order numbers, reorder up/down, disabled boundaries,
  toggle active, inactive display, skip, add to rotation)

## Decisions

- Used up/down arrows instead of drag-and-drop (no extra dependencies, works on mobile)
- Skip bumps order_index by active.length (moves to end of current cycle)
- Admin page is a client component (needs interactivity for mutations)
- Uses existing PageHeading component
- RLS policies on rotation table restrict writes to admins

## What changed from plan

- `lib/supabase/getRotation.ts` was not needed — admin page fetches directly using the client
- Drag-to-reorder was replaced with up/down arrows per user preference

## Additional changes

### Navbar restructured with user dropdown

- Main nav: Home, Schedule, History, Stats
- User dropdown (click name): My Pick, Admin (admin only), Profile, Log Out
- Dropdown closes on outside click
- Chevron icon rotates when open
- Navbar has z-50 to ensure dropdown appears above page content
- Replaces the growing list of inline nav links with a cleaner, scalable pattern
