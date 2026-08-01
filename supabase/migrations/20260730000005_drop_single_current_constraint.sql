-- Drop the single-current-pick constraint.
--
-- This constraint only allowed one pick with status='current' at a time,
-- which prevented creating historical past picks (they're created as
-- 'current' so members can review them before the admin locks them).
--
-- The picks_month_year_unique index already prevents duplicate picks
-- for the same month/year, so this constraint is not needed.

DROP INDEX IF EXISTS idx_picks_single_current;
