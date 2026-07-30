-- Rotation table
-- Defines the order in which members pick movies.
-- order_index determines picking sequence (0 = next to pick).
-- is_active = false removes a member from the rotation without deleting the row.
CREATE TABLE rotation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_index INTEGER NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One rotation entry per member
CREATE UNIQUE INDEX idx_rotation_member ON rotation (member_id);

-- Index for fetching rotation in order
CREATE INDEX idx_rotation_order ON rotation (order_index) WHERE is_active = TRUE;
