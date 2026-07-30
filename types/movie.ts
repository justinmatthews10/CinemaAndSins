export type Movie = {
  id: string;
  tmdb_id: number | null;
  title: string;
  year: number | null;
  director: string | null;
  runtime: number | null;
  poster_url: string | null;
  synopsis: string | null;
  genres: string[];
  created_at: string;
};

export type TmdbSearchResult = {
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  synopsis: string | null;
};

export type TmdbMovieDetails = {
  tmdb_id: number;
  title: string;
  year: number | null;
  director: string | null;
  runtime: number | null;
  poster_url: string | null;
  synopsis: string | null;
  genres: string[];
};
