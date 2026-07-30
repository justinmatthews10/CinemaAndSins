export type ReviewWithMovie = {
  id: string;
  pick_id: string;
  member_id: string;
  score: number;
  review_text: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  movie_id: string;
  movie_title: string;
  movie_year: number | null;
  movie_poster_url: string | null;
  movie_genres: string[];
};

export type MovieSummary = {
  movie_id: string;
  title: string;
  score: number;
  poster_url: string | null;
} | null;

/** Calculate average score from a list of reviews. */
export function calculateAverage(reviews: { score: number }[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length;
}

/** Determine if a member is a harsh critic or easy grader vs. club average. */
export function harshEasyGrader(
  memberAverage: number,
  clubAverage: number,
): "harsh" | "easy" | null {
  if (memberAverage === 0) return null;
  const diff = memberAverage - clubAverage;
  if (diff <= -1) return "harsh";
  if (diff >= 1) return "easy";
  return null;
}

/** Find the genre the member has reviewed most. */
export function mostRatedGenre(reviews: ReviewWithMovie[]): string | null {
  if (reviews.length === 0) return null;
  const counts = new Map<string, number>();
  for (const r of reviews) {
    for (const g of r.movie_genres) {
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [genre, count] of counts) {
    if (count > bestCount) {
      best = genre;
      bestCount = count;
    }
  }
  return best;
}

/** Find the highest and lowest scored movies from a member's reviews. */
export function topAndWorstMovies(reviews: ReviewWithMovie[]): {
  top: MovieSummary;
  worst: MovieSummary;
} {
  if (reviews.length === 0) {
    return { top: null, worst: null };
  }
  const sorted = [...reviews].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const worst = sorted[sorted.length - 1];
  return {
    top: {
      movie_id: top.movie_id,
      title: top.movie_title,
      score: top.score,
      poster_url: top.movie_poster_url,
    },
    worst: {
      movie_id: worst.movie_id,
      title: worst.movie_title,
      score: worst.score,
      poster_url: worst.movie_poster_url,
    },
  };
}
