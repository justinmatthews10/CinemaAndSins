import type { TmdbSearchResult, TmdbMovieDetails } from "@/types/movie";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", getApiKey());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function parseYear(releaseDate: string | null | undefined): number | null {
  if (!releaseDate || releaseDate.length < 4) return null;
  const year = parseInt(releaseDate.substring(0, 4), 10);
  return isNaN(year) ? null : year;
}

function buildPosterUrl(posterPath: string | null | undefined): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

async function tmdbFetch(url: string): Promise<Response> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res;
}

type TmdbRawSearchResult = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
};

type TmdbRawMovieDetails = {
  id: number;
  title: string;
  release_date: string;
  runtime: number | null;
  poster_path: string | null;
  overview: string;
  genres: { id: number; name: string }[];
  credits: {
    crew: { job: string; name: string }[];
  };
};

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  const url = buildUrl("/search/movie", { query });
  const res = await tmdbFetch(url);
  const data = await res.json();
  const results: TmdbRawSearchResult[] = data.results ?? [];

  return results.map((r) => ({
    tmdb_id: r.id,
    title: r.title,
    year: parseYear(r.release_date),
    poster_url: buildPosterUrl(r.poster_path),
    synopsis: r.overview || null,
  }));
}

export async function getMovieDetails(id: number): Promise<TmdbMovieDetails> {
  const url = buildUrl(`/movie/${id}`, { append_to_response: "credits" });
  const res = await tmdbFetch(url);
  const data: TmdbRawMovieDetails = await res.json();

  const director = data.credits?.crew?.find((c) => c.job === "Director");

  return {
    tmdb_id: data.id,
    title: data.title,
    year: parseYear(data.release_date),
    director: director?.name ?? null,
    runtime: data.runtime ?? null,
    poster_url: buildPosterUrl(data.poster_path),
    synopsis: data.overview || null,
    genres: (data.genres ?? []).map((g) => g.name),
  };
}
