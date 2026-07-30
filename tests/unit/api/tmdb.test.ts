import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET as searchGET } from "@/app/api/tmdb/search/route";
import { GET as detailsGET } from "@/app/api/tmdb/[id]/route";

// Mock the tmdb client
vi.mock("@/lib/tmdb", () => ({
  searchMovies: vi.fn(),
  getMovieDetails: vi.fn(),
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
}));

import { searchMovies, getMovieDetails } from "@/lib/tmdb";

const mockSearchMovies = vi.mocked(searchMovies);
const mockGetMovieDetails = vi.mocked(getMovieDetails);

function makeRequest(url: string): Request {
  return new Request(url);
}

describe("GET /api/tmdb/search", () => {
  beforeEach(() => {
    mockSearchMovies.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns search results for a valid query", async () => {
    const mockResults = [
      {
        tmdb_id: 155,
        title: "The Dark Knight",
        year: 2008,
        poster_url: "https://image.tmdb.org/t/p/w500/poster.jpg",
        synopsis: "Batman movie.",
      },
    ];
    mockSearchMovies.mockResolvedValue(mockResults);

    const req = makeRequest("http://localhost:3000/api/tmdb/search?query=dark+knight");
    const res = await searchGET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockResults);
    expect(mockSearchMovies).toHaveBeenCalledWith("dark knight");
  });

  it("returns 400 when query param is missing", async () => {
    const req = makeRequest("http://localhost:3000/api/tmdb/search");
    const res = await searchGET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/query/i);
  });

  it("returns 400 when query param is empty", async () => {
    const req = makeRequest("http://localhost:3000/api/tmdb/search?query=");
    const res = await searchGET(req);

    expect(res.status).toBe(400);
  });

  it("returns 500 when TMDB client throws", async () => {
    mockSearchMovies.mockRejectedValue(new Error("TMDB API error"));

    const req = makeRequest("http://localhost:3000/api/tmdb/search?query=test");
    const res = await searchGET(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/tmdb/i);
  });
});

describe("GET /api/tmdb/[id]", () => {
  beforeEach(() => {
    mockGetMovieDetails.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns movie details for a valid id", async () => {
    const mockDetails = {
      tmdb_id: 155,
      title: "The Dark Knight",
      year: 2008,
      director: "Christopher Nolan",
      runtime: 152,
      poster_url: "https://image.tmdb.org/t/p/w500/poster.jpg",
      synopsis: "Batman movie.",
      genres: ["Action", "Crime"],
    };
    mockGetMovieDetails.mockResolvedValue(mockDetails);

    const req = makeRequest("http://localhost:3000/api/tmdb/155");
    const params = Promise.resolve({ id: "155" });
    const res = await detailsGET(req, { params });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockDetails);
    expect(mockGetMovieDetails).toHaveBeenCalledWith(155);
  });

  it("returns 400 when id is not a number", async () => {
    const req = makeRequest("http://localhost:3000/api/tmdb/abc");
    const params = Promise.resolve({ id: "abc" });
    const res = await detailsGET(req, { params });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/invalid/i);
  });

  it("returns 404 when movie is not found", async () => {
    mockGetMovieDetails.mockRejectedValue(new Error("Movie not found (404)"));

    const req = makeRequest("http://localhost:3000/api/tmdb/999999");
    const params = Promise.resolve({ id: "999999" });
    const res = await detailsGET(req, { params });

    expect(res.status).toBe(404);
  });

  it("returns 500 when TMDB client throws non-404 error", async () => {
    mockGetMovieDetails.mockRejectedValue(new Error("TMDB API error"));

    const req = makeRequest("http://localhost:3000/api/tmdb/155");
    const params = Promise.resolve({ id: "155" });
    const res = await detailsGET(req, { params });

    expect(res.status).toBe(500);
  });
});
