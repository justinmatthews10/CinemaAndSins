import { describe, it, expect } from "vitest";
import {
  calculateAverage,
  harshEasyGrader,
  mostRatedGenre,
  topAndWorstMovies,
} from "@/lib/stats";
import type { ReviewWithMovie } from "@/lib/stats";

const makeReview = (overrides: Partial<ReviewWithMovie> = {}): ReviewWithMovie => ({
  id: "r1",
  pick_id: "p1",
  member_id: "m1",
  score: 7,
  review_text: null,
  tags: [],
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  movie_id: "movie-1",
  movie_title: "Test Movie",
  movie_year: 2020,
  movie_poster_url: null,
  movie_genres: ["Drama"],
  ...overrides,
});

describe("calculateAverage", () => {
  it("returns 0 for empty array", () => {
    expect(calculateAverage([])).toBe(0);
  });

  it("calculates mean of scores", () => {
    const reviews = [makeReview({ score: 8 }), makeReview({ score: 6 })];
    expect(calculateAverage(reviews)).toBe(7);
  });

  it("handles single review", () => {
    expect(calculateAverage([makeReview({ score: 9.5 })])).toBe(9.5);
  });
});

describe("harshEasyGrader", () => {
  it("returns 'harsh' when avg is 1+ below club average", () => {
    expect(harshEasyGrader(5.5, 7.0)).toBe("harsh");
  });

  it("returns 'easy' when avg is 1+ above club average", () => {
    expect(harshEasyGrader(9.0, 7.0)).toBe("easy");
  });

  it("returns null when within 1 point of club average", () => {
    expect(harshEasyGrader(7.5, 7.0)).toBeNull();
    expect(harshEasyGrader(6.5, 7.0)).toBeNull();
  });

  it("returns null when no reviews", () => {
    expect(harshEasyGrader(0, 7.0)).toBeNull();
  });
});

describe("mostRatedGenre", () => {
  it("returns the genre with most reviews", () => {
    const reviews = [
      makeReview({ movie_genres: ["Drama", "Crime"] }),
      makeReview({ movie_genres: ["Drama", "Thriller"] }),
      makeReview({ movie_genres: ["Crime"] }),
    ];
    expect(mostRatedGenre(reviews)).toBe("Drama");
  });

  it("returns null for empty array", () => {
    expect(mostRatedGenre([])).toBeNull();
  });

  it("handles ties by returning first encountered", () => {
    const reviews = [
      makeReview({ movie_genres: ["Action"] }),
      makeReview({ movie_genres: ["Comedy"] }),
    ];
    const result = mostRatedGenre(reviews);
    expect(["Action", "Comedy"]).toContain(result);
  });
});

describe("topAndWorstMovies", () => {
  it("returns top and worst by score", () => {
    const reviews = [
      makeReview({ score: 9, movie_id: "a", movie_title: "Great" }),
      makeReview({ score: 3, movie_id: "b", movie_title: "Bad" }),
      makeReview({ score: 7, movie_id: "c", movie_title: "Mid" }),
    ];
    const result = topAndWorstMovies(reviews);
    expect(result.top?.title).toBe("Great");
    expect(result.worst?.title).toBe("Bad");
  });

  it("returns null for top and worst when empty", () => {
    const result = topAndWorstMovies([]);
    expect(result.top).toBeNull();
    expect(result.worst).toBeNull();
  });

  it("handles single review (top = worst)", () => {
    const reviews = [makeReview({ score: 7, movie_title: "Only" })];
    const result = topAndWorstMovies(reviews);
    expect(result.top?.title).toBe("Only");
    expect(result.worst?.title).toBe("Only");
  });
});
