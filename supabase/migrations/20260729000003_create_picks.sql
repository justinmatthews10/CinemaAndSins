-- Picks table
-- A pick links a movie to a month/year and the member who chose it.
-- status: 'upcoming' (not yet watched) → 'current' (this month's movie) → 'locked' (meeting passed, reviews frozen)
-- Only one pick should be 'current' at a time; enforced by a partial unique index.
CREATE TABLE picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  picker_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  watch_date DATE,
  picker_note TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'locked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one current pick at a time
CREATE UNIQUE INDEX idx_picks_single_current ON picks (status) WHERE status = 'current';

-- One pick per member per month/year (prevents double-booking a slot)
CREATE UNIQUE INDEX idx_picks_member_month_year ON picks (picker_member_id, month, year);

-- Index for schedule queries (ordered by year, month)
CREATE INDEX idx_picks_schedule ON picks (year, month);

-- Index for finding picks by status
CREATE INDEX idx_picks_status ON picks (status);
