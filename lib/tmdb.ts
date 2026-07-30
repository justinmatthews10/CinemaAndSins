import type { TmdbSearchResult, TmdbMovieDetails } from "@/types/movie";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  if (!query.trim()) return [];

  const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=1`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    throw new Error(`TMDB search failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.results || []).map(
    (m: {
      id: number;
      title: string;
      release_date?: string;
      poster_path?: string | null;
      overview?: string;
    }): TmdbSearchResult => ({
      tmdb_id: m.id,
      title: m.title,
      year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : null,
      poster_url: m.poster_path ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}` : null,
      synopsis: m.overview || null,
    }),
  );
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
  const url = `${TMDB_BASE_URL}/movie/${tmdbId}?append_to_response=credits`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    throw new Error(`TMDB details failed: ${res.status}`);
  }

  const data = await res.json();
  const director =
    data.credits?.crew?.find((c: { job: string }) => c.job === "Director")?.name ?? null;

  return {
    tmdb_id: data.id,
    title: data.title,
    year: data.release_date ? parseInt(data.release_date.slice(0, 4)) : null,
    director,
    runtime: data.runtime ?? null,
    poster_url: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : null,
    synopsis: data.overview || null,
    genres: (data.genres || []).map((g: { name: string }) => g.name),
  };
}
