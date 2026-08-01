# API Contracts — Endpoints, Supabase Schema, TMDB, and Environment Variables

> **When to use this file:** Look up API routes, Supabase table schemas, TMDB endpoints, or required environment variables.

---

## Environment Variables

| Variable                        | Scope           | Description                                        |
| ------------------------------- | --------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Client + Server | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon key (safe for client)                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only     | Supabase service role key (never expose to client) |
| `TMDB_API_KEY`                  | Server only     | TMDB Bearer token for API access                   |
| `ADMIN_EMAIL`                   | Server only     | Email of the initial admin (auto-approved on signup) |

---

## Supabase Schema

### `members`

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `movies`

```sql
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER,
  title TEXT NOT NULL,
  year INTEGER,
  director TEXT,
  runtime INTEGER,
  poster_url TEXT,
  synopsis TEXT,
  genres TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `picks`

```sql
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
```

### `reviews`

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pick_id UUID NOT NULL REFERENCES picks(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  score NUMERIC(3,1) NOT NULL CHECK (score >= 1.0 AND score <= 10.0),
  review_text TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pick_id, member_id)
);
```

### `rotation`

```sql
CREATE TABLE rotation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_index INTEGER NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `app_config`

```sql
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## RLS Policies

### `members`

```sql
-- Public can see limited member info
CREATE POLICY "members_public_read" ON members
  FOR SELECT USING (true);

-- Members can update their own profile
CREATE POLICY "members_self_update" ON members
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "members_admin_all" ON members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.is_admin)
  );
```

### `movies`

```sql
-- Public can read
CREATE POLICY "movies_public_read" ON movies
  FOR SELECT USING (true);

-- Authenticated members can insert
CREATE POLICY "movies_member_insert" ON movies
  FOR INSERT TO authenticated WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "movies_admin_all" ON movies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.is_admin)
  );
```

### `picks`

```sql
-- Public can read
CREATE POLICY "picks_public_read" ON picks
  FOR SELECT USING (true);

-- Members can insert picks when they are the assigned picker
CREATE POLICY "picks_member_insert" ON picks
  FOR INSERT TO authenticated WITH CHECK (
    picker_member_id = auth.uid()
  );

-- Members can update their own picks
CREATE POLICY "picks_member_update" ON picks
  FOR UPDATE USING (picker_member_id = auth.uid());

-- Admins can do everything
CREATE POLICY "picks_admin_all" ON picks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.is_admin)
  );
```

### `reviews`

```sql
-- Public can read
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);

-- Members can insert their own reviews
CREATE POLICY "reviews_member_insert" ON reviews
  FOR INSERT TO authenticated WITH CHECK (member_id = auth.uid());

-- Members can update their own reviews (only if pick is not locked)
CREATE POLICY "reviews_member_update" ON reviews
  FOR UPDATE USING (
    member_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM picks p
      WHERE p.id = pick_id AND p.status != 'locked'
    )
  );

-- Admins can do everything
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.is_admin)
  );
```

### `rotation`

```sql
-- Public can read
CREATE POLICY "rotation_public_read" ON rotation
  FOR SELECT USING (true);

-- Admins can do everything
CREATE POLICY "rotation_admin_all" ON rotation
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.is_admin)
  );
```

### `app_config`

```sql
-- Public can read
CREATE POLICY "app_config_public_read" ON app_config
  FOR SELECT USING (true);

-- Admins can do everything
CREATE POLICY "app_config_admin_all" ON app_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM members m WHERE m.id = auth.uid() AND m.is_admin)
  );
```

---

## TMDB API

### Base Configuration

- **Base URL:** `https://api.themoviedb.org/3`
- **Auth:** `Authorization: Bearer {TMDB_API_KEY}` header
- **Image base URL:** `https://image.tmdb.org/t/p/w500` (posters), `https://image.tmdb.org/t/p/original` (hero)

### Endpoints Used

#### Search Movies

```
GET /search/movie?query={query}&page={page}
```

Returns: `{ results: [{ id, title, poster_path, release_date, overview }] }`

#### Get Movie Details

```
GET /movie/{id}?append_to_response=credits
```

Returns: `{ id, title, poster_path, release_date, runtime, overview, genres: [{ name }], credits: { crew: [{ job, name }] } }`

### Internal API Routes

#### `GET /api/tmdb/search?query={query}`

- Server-side proxy to TMDB search
- Returns: `{ results: [{ tmdb_id, title, year, poster_url, synopsis }] }`

#### `GET /api/tmdb/{id}`

- Server-side proxy to TMDB movie details
- Returns: `{ tmdb_id, title, year, director, runtime, poster_url, synopsis, genres }`

---

## Scoring Logic

### Average Score

```typescript
function calculateAverage(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.score, 0);
  return sum / reviews.length;
}
```

### Score Distribution

```typescript
function scoreDistribution(reviews: Review[]): Record<number, number> {
  // Returns count of reviews at each score point (1-10)
  const dist: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) dist[i] = 0;
  reviews.forEach((r) => {
    const bucket = Math.floor(r.score);
    dist[bucket] = (dist[bucket] || 0) + 1;
  });
  return dist;
}
```

### Score Variance (for "most divisive" calculation)

```typescript
function scoreVariance(reviews: Review[]): number {
  if (reviews.length < 2) return 0;
  const avg = calculateAverage(reviews);
  const sumSquares = reviews.reduce((acc, r) => acc + Math.pow(r.score - avg, 2), 0);
  return sumSquares / reviews.length;
}
```

### Score Badge Color

```typescript
function scoreBadgeColor(score: number): string {
  if (score >= 9) return "gold";
  if (score >= 7) return "green";
  if (score >= 5) return "yellow";
  return "red";
}
```
