import { formatMonthYear } from "@/lib/utils";

export type StatsMovie = {
  movie_id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  genres: string[];
  pick_id: string;
  pick_month: number;
  pick_year: number;
  scores: number[];
};

export type LeaderboardEntry = {
  movie_id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  average: number;
  reviewCount: number;
};

export type GenreStat = {
  genre: string;
  count: number;
  averageScore: number;
};

export type TimePoint = {
  label: string;
  average: number;
  reviewCount: number;
};

const MIN_REVIEWS = 3;

function avg(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function variance(scores: number[]): number {
  if (scores.length < 2) return 0;
  const a = avg(scores);
  return scores.reduce((acc, s) => acc + Math.pow(s - a, 2), 0) / scores.length;
}

/** Top N highest-rated and bottom N lowest-rated movies (min 3 reviews). */
export function leaderboard(
  movies: StatsMovie[],
  n: number,
): { top: LeaderboardEntry[]; bottom: LeaderboardEntry[] } {
  const qualified = movies.filter((m) => m.scores.length >= MIN_REVIEWS);
  const entries: LeaderboardEntry[] = qualified.map((m) => ({
    movie_id: m.movie_id,
    title: m.title,
    year: m.year,
    poster_url: m.poster_url,
    average: avg(m.scores),
    reviewCount: m.scores.length,
  }));
  const sorted = [...entries].sort((a, b) => b.average - a.average);
  return {
    top: sorted.slice(0, n),
    bottom: [...sorted].reverse().slice(0, n),
  };
}

/** Top N most divisive movies by score variance (min 3 reviews). */
export function mostDivisive(movies: StatsMovie[], n: number): LeaderboardEntry[] {
  const qualified = movies
    .filter((m) => m.scores.length >= MIN_REVIEWS)
    .map((m) => ({
      movie_id: m.movie_id,
      title: m.title,
      year: m.year,
      poster_url: m.poster_url,
      average: avg(m.scores),
      reviewCount: m.scores.length,
      variance: variance(m.scores),
    }))
    .sort((a, b) => b.variance - a.variance);
  return qualified.slice(0, n).map(({ variance: _, ...entry }) => entry);
}

/** Genre breakdown: count and average score per genre, sorted by count desc. */
export function genreBreakdown(movies: StatsMovie[]): GenreStat[] {
  const genreMap = new Map<string, { scores: number[]; count: number }>();
  for (const m of movies) {
    if (m.scores.length === 0) continue;
    for (const g of m.genres) {
      const existing = genreMap.get(g) ?? { scores: [], count: 0 };
      existing.scores.push(...m.scores);
      existing.count += 1;
      genreMap.set(g, existing);
    }
  }
  return [...genreMap.entries()]
    .map(([genre, data]) => ({
      genre,
      count: data.count,
      averageScore: avg(data.scores),
    }))
    .sort((a, b) => b.count - a.count);
}

/** Club average score over time, sorted chronologically. */
export function averageOverTime(movies: StatsMovie[]): TimePoint[] {
  const timeMap = new Map<string, { scores: number[]; month: number; year: number }>();
  for (const m of movies) {
    if (m.scores.length === 0) continue;
    const key = `${m.pick_year}-${m.pick_month}`;
    const existing = timeMap.get(key) ?? {
      scores: [],
      month: m.pick_month,
      year: m.pick_year,
    };
    existing.scores.push(...m.scores);
    timeMap.set(key, existing);
  }
  return [...timeMap.values()]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((data) => ({
      label: formatMonthYear(data.month, data.year),
      average: avg(data.scores),
      reviewCount: data.scores.length,
    }));
}
