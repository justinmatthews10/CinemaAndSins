-- Movies table
-- tmdb_id is nullable to support manual entry when a movie isn't on TMDB.
-- A unique constraint on tmdb_id prevents duplicate imports of the same film.
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER,
  title TEXT NOT NULL,
  year INTEGER,
  director TEXT,
  runtime INTEGER,
  poster_url TEXT,
  synopsis TEXT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tmdb_id)
);

-- Index for searching by title (case-insensitive)
CREATE INDEX idx_movies_title_lower ON movies (LOWER(title));

-- Index for filtering by year
CREATE INDEX idx_movies_year ON movies (year);
