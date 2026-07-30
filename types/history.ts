export type HistoryEntry = {
  movie_id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  genres: string[];
  picker_id: string;
  picker_name: string;
  pick_month: number;
  pick_year: number;
  average_score: number;
  review_count: number;
  score_variance: number;
};

export type HistoryData = {
  entries: HistoryEntry[];
  pickers: string[];
  genres: string[];
};

/** Minimum reviews for "most divisive" to be meaningful. */
export const DIVISIVE_MIN_REVIEWS = 5;
