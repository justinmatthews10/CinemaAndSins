-- Reviews table
-- One review per member per pick (enforced by UNIQUE constraint).
-- score is numeric(3,1) to support full decimal precision (1.0–10.0, 0.1 step).
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pick_id UUID NOT NULL REFERENCES picks(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  score NUMERIC(3,1) NOT NULL CHECK (score >= 1.0 AND score <= 10.0),
  review_text TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pick_id, member_id)
);

-- Index for fetching all reviews for a pick
CREATE INDEX idx_reviews_pick_id ON reviews (pick_id);

-- Index for fetching all reviews by a member
CREATE INDEX idx_reviews_member_id ON reviews (member_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_update_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
