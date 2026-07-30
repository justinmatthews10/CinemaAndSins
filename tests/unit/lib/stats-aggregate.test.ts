import { describe, it, expect } from "vitest";
import {
  leaderboard,
  mostDivisive,
  genreBreakdown,
  averageOverTime,
} from "@/lib/stats-aggregate";
import type { StatsMovie } from "@/lib/stats-aggregate";

const makeMovie = (overrides: Partial<StatsMovie> = {}): StatsMovie => ({
  movie_id: "m1",
  title: "Test Movie",
  year: 2020,
  poster_url: null,
  genres: ["Drama"],
  pick_id: "p1",
  pick_month: 6,
  pick_year: 2026,
  scores: [7, 8, 9],
  ...overrides,
});

describe("leaderboard", () => {
  it("returns top and bottom movies sorted by average", () => {
    const movies = [
      makeMovie({ movie_id: "a", title: "Great", scores: [10, 9, 8] }),
      makeMovie({ movie_id: "b", title: "Mid", scores: [6, 7, 6] }),
      makeMovie({ movie_id: "c", title: "Bad", scores: [2, 3, 4] }),
    ];
    const result = leaderboard(movies, 2);
    expect(result.top[0].title).toBe("Great");
    expect(result.bottom[0].title).toBe("Bad");
    expect(result.top).toHaveLength(2);
    expect(result.bottom).toHaveLength(2);
  });

  it("excludes movies with fewer than 3 reviews", () => {
    const movies = [
      makeMovie({ movie_id: "a", title: "Great", scores: [10, 9, 8] }),
      makeMovie({ movie_id: "b", title: "Few", scores: [10] }),
    ];
    const result = leaderboard(movies, 5);
    expect(result.top.find((m) => m.title === "Few")).toBeUndefined();
  });

  it("returns empty arrays when no movies qualify", () => {
    const result = leaderboard([], 5);
    expect(result.top).toEqual([]);
    expect(result.bottom).toEqual([]);
  });
});

describe("mostDivisive", () => {
  it("sorts by variance descending", () => {
    const movies = [
      makeMovie({ movie_id: "a", title: "Agreement", scores: [7, 7, 8] }),
      makeMovie({ movie_id: "b", title: "Chaos", scores: [1, 10, 5] }),
      makeMovie({ movie_id: "c", title: "Mild", scores: [6, 7, 8] }),
    ];
    const result = mostDivisive(movies, 3);
    expect(result[0].title).toBe("Chaos");
  });

  it("excludes movies with fewer than 3 reviews", () => {
    const movies = [makeMovie({ movie_id: "a", title: "Chaos", scores: [1, 10] })];
    const result = mostDivisive(movies, 5);
    expect(result).toEqual([]);
  });

  it("returns empty array when no movies qualify", () => {
    expect(mostDivisive([], 5)).toEqual([]);
  });
});

describe("genreBreakdown", () => {
  it("counts movies and averages scores per genre", () => {
    const movies = [
      makeMovie({ genres: ["Drama", "Crime"], scores: [8, 7, 9] }),
      makeMovie({ genres: ["Drama", "Thriller"], scores: [6, 5, 7] }),
      makeMovie({ genres: ["Crime"], scores: [10, 9, 8] }),
    ];
    const result = genreBreakdown(movies);
    const drama = result.find((g) => g.genre === "Drama");
    expect(drama?.count).toBe(2);
    // Drama avg: ((8+7+9)/3 + (6+5+7)/3) / 2 = (8 + 6) / 2 = 7
    expect(drama?.averageScore).toBe(7);

    const crime = result.find((g) => g.genre === "Crime");
    expect(crime?.count).toBe(2);
    // Crime avg: ((8+7+9)/3 + (10+9+8)/3) / 2 = (8 + 9) / 2 = 8.5
    expect(crime?.averageScore).toBe(8.5);
  });

  it("returns empty array for no movies", () => {
    expect(genreBreakdown([])).toEqual([]);
  });

  it("sorts by count descending", () => {
    const movies = [
      makeMovie({ genres: ["Rare"], scores: [7, 8, 9] }),
      makeMovie({ genres: ["Common", "Other"], scores: [7, 8, 9] }),
      makeMovie({ genres: ["Common"], scores: [6, 7, 8] }),
    ];
    const result = genreBreakdown(movies);
    expect(result[0].genre).toBe("Common");
    expect(result[0].count).toBe(2);
  });
});

describe("averageOverTime", () => {
  it("calculates club average per month/year", () => {
    const movies = [
      makeMovie({ pick_month: 5, pick_year: 2026, scores: [8, 7, 9] }),
      makeMovie({ pick_month: 6, pick_year: 2026, scores: [5, 6, 7] }),
    ];
    const result = averageOverTime(movies);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe("May 2026");
    expect(result[0].average).toBe(8);
    expect(result[1].label).toBe("June 2026");
    expect(result[1].average).toBe(6);
  });

  it("sorts chronologically", () => {
    const movies = [
      makeMovie({ pick_month: 6, pick_year: 2026, scores: [5, 6, 7] }),
      makeMovie({ pick_month: 5, pick_year: 2026, scores: [8, 7, 9] }),
    ];
    const result = averageOverTime(movies);
    expect(result[0].label).toBe("May 2026");
    expect(result[1].label).toBe("June 2026");
  });

  it("skips movies with no reviews", () => {
    const movies = [
      makeMovie({ pick_month: 5, pick_year: 2026, scores: [8, 7, 9] }),
      makeMovie({ pick_month: 6, pick_year: 2026, scores: [] }),
    ];
    const result = averageOverTime(movies);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("May 2026");
  });

  it("returns empty array for no movies", () => {
    expect(averageOverTime([])).toEqual([]);
  });
});
