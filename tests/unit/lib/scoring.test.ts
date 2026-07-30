import { describe, it, expect } from "vitest";
import {
  calculateAverage,
  scoreDistribution,
  scoreVariance,
  scoreBadgeColor,
} from "@/lib/scoring";
import type { Review } from "@/types/review";

function makeReview(score: number, id = "1"): Review {
  return {
    id,
    pick_id: "pick-1",
    member_id: "member-1",
    score,
    review_text: null,
    tags: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };
}

describe("calculateAverage", () => {
  it("returns 0 for empty array", () => {
    expect(calculateAverage([])).toBe(0);
  });

  it("calculates the mean of all scores", () => {
    const reviews = [makeReview(8, "1"), makeReview(6, "2"), makeReview(10, "3")];
    expect(calculateAverage(reviews)).toBeCloseTo(8, 1);
  });

  it("handles a single review", () => {
    expect(calculateAverage([makeReview(7)])).toBe(7);
  });
});

describe("scoreDistribution", () => {
  it("returns counts per score bucket", () => {
    const reviews = [
      makeReview(9, "1"),
      makeReview(9, "2"),
      makeReview(7, "3"),
      makeReview(5, "4"),
    ];
    const dist = scoreDistribution(reviews);
    expect(dist[9]).toBe(2);
    expect(dist[7]).toBe(1);
    expect(dist[5]).toBe(1);
    expect(dist[1]).toBe(0);
  });

  it("returns all zeros for empty array", () => {
    const dist = scoreDistribution([]);
    for (let i = 1; i <= 10; i++) {
      expect(dist[i]).toBe(0);
    }
  });
});

describe("scoreVariance", () => {
  it("returns 0 for fewer than 2 reviews", () => {
    expect(scoreVariance([])).toBe(0);
    expect(scoreVariance([makeReview(5)])).toBe(0);
  });

  it("calculates variance for multiple reviews", () => {
    // mean = 6; ((10-6)^2 + (2-6)^2) / 2 = (16 + 16) / 2 = 16
    const reviews = [makeReview(10, "1"), makeReview(2, "2")];
    expect(scoreVariance(reviews)).toBe(16);
  });

  it("returns 0 when all reviewers agree", () => {
    const reviews = [makeReview(7, "1"), makeReview(7, "2"), makeReview(7, "3")];
    expect(scoreVariance(reviews)).toBe(0);
  });

  it("reports higher variance for a more divisive set", () => {
    const divisive = [makeReview(10, "1"), makeReview(2, "2")];
    const agreeable = [makeReview(7, "3"), makeReview(6, "4")];
    expect(scoreVariance(divisive)).toBeGreaterThan(scoreVariance(agreeable));
  });
});

describe("scoreBadgeColor", () => {
  it("returns gold for 9-10", () => {
    expect(scoreBadgeColor(9)).toBe("gold");
    expect(scoreBadgeColor(10)).toBe("gold");
  });

  it("returns green for 7-8", () => {
    expect(scoreBadgeColor(7)).toBe("green");
    expect(scoreBadgeColor(8)).toBe("green");
  });

  it("returns yellow for 5-6", () => {
    expect(scoreBadgeColor(5)).toBe("yellow");
    expect(scoreBadgeColor(6)).toBe("yellow");
  });

  it("returns red for 1-4", () => {
    expect(scoreBadgeColor(1)).toBe("red");
    expect(scoreBadgeColor(4)).toBe("red");
  });
});
