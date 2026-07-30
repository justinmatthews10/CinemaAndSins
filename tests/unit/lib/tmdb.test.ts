import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import after mocking fetch
import { searchMovies, getMovieDetails, TMDB_BASE_URL } from "@/lib/tmdb";

function tmdbSearchResponse(results: unknown[]) {
  return {
    ok: true,
    json: () => Promise.resolve({ results, total_results: results.length }),
  } as Response;
}

function tmdbMovieResponse(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
}

describe("tmdb client", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    process.env.TMDB_API_KEY = "test-tmdb-key";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("searchMovies", () => {
    it("returns normalized search results", async () => {
      mockFetch.mockResolvedValue(
        tmdbSearchResponse([
          {
            id: 155,
            title: "The Dark Knight",
            release_date: "2008-07-18",
            poster_path: "/qJ2tW6WMUDux911Z6o7U0OoOTZ.jpg",
            overview: "Batman raises the stakes in his war on crime.",
          },
        ]),
      );

      const results = await searchMovies("dark knight");

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        tmdb_id: 155,
        title: "The Dark Knight",
        year: 2008,
        poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911Z6o7U0OoOTZ.jpg",
        synopsis: "Batman raises the stakes in his war on crime.",
      });
    });

    it("returns empty array for no results", async () => {
      mockFetch.mockResolvedValue(tmdbSearchResponse([]));

      const results = await searchMovies("nonexistent movie xyz");
      expect(results).toEqual([]);
    });

    it("handles missing poster_path", async () => {
      mockFetch.mockResolvedValue(
        tmdbSearchResponse([
          {
            id: 1,
            title: "No Poster Movie",
            release_date: "2020-01-01",
            poster_path: null,
            overview: "A movie with no poster.",
          },
        ]),
      );

      const results = await searchMovies("no poster");
      expect(results[0].poster_url).toBeNull();
    });

    it("handles missing release_date", async () => {
      mockFetch.mockResolvedValue(
        tmdbSearchResponse([
          {
            id: 2,
            title: "No Date Movie",
            release_date: "",
            poster_path: "/poster.jpg",
            overview: "A movie with no date.",
          },
        ]),
      );

      const results = await searchMovies("no date");
      expect(results[0].year).toBeNull();
    });

    it("throws on TMDB API error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);

      await expect(searchMovies("test")).rejects.toThrow();
    });

    it("calls TMDB with correct URL and headers", async () => {
      mockFetch.mockResolvedValue(tmdbSearchResponse([]));

      await searchMovies("inception");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain(TMDB_BASE_URL);
      expect(url).toContain("/search/movie");
      expect(url).toContain("query=inception");
      expect(url).toContain("api_key=test-tmdb-key");
    });
  });

  describe("getMovieDetails", () => {
    it("returns normalized movie details", async () => {
      mockFetch.mockResolvedValue(
        tmdbMovieResponse({
          id: 155,
          title: "The Dark Knight",
          release_date: "2008-07-18",
          runtime: 152,
          poster_path: "/qJ2tW6WMUDux911Z6o7U0OoOTZ.jpg",
          overview: "Batman raises the stakes.",
          genres: [
            { id: 1, name: "Action" },
            { id: 2, name: "Crime" },
          ],
          credits: {
            crew: [{ job: "Director", name: "Christopher Nolan" }],
          },
        }),
      );

      const details = await getMovieDetails(155);

      expect(details).toEqual({
        tmdb_id: 155,
        title: "The Dark Knight",
        year: 2008,
        director: "Christopher Nolan",
        runtime: 152,
        poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911Z6o7U0OoOTZ.jpg",
        synopsis: "Batman raises the stakes.",
        genres: ["Action", "Crime"],
      });
    });

    it("handles missing director", async () => {
      mockFetch.mockResolvedValue(
        tmdbMovieResponse({
          id: 1,
          title: "No Director",
          release_date: "2020-01-01",
          runtime: 90,
          poster_path: null,
          overview: "No director listed.",
          genres: [],
          credits: { crew: [] },
        }),
      );

      const details = await getMovieDetails(1);
      expect(details.director).toBeNull();
    });

    it("handles missing runtime", async () => {
      mockFetch.mockResolvedValue(
        tmdbMovieResponse({
          id: 1,
          title: "No Runtime",
          release_date: "2020-01-01",
          runtime: null,
          poster_path: null,
          overview: "No runtime.",
          genres: [],
          credits: { crew: [] },
        }),
      );

      const details = await getMovieDetails(1);
      expect(details.runtime).toBeNull();
    });

    it("throws on not found (404)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      await expect(getMovieDetails(999999)).rejects.toThrow();
    });

    it("throws on rate limit (429)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      } as Response);

      await expect(getMovieDetails(155)).rejects.toThrow();
    });
  });
});
