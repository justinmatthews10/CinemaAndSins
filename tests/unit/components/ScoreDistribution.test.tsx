import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreDistribution } from "@/components/ScoreDistribution";
import type { Review } from "@/types/review";

const makeReview = (score: number, memberId: string): Review => ({
  id: `rev-${memberId}`,
  pick_id: "pick-1",
  member_id: memberId,
  score,
  review_text: null,
  tags: [],
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
});

describe("ScoreDistribution", () => {
  it("renders bars for each score bucket", () => {
    const reviews = [
      makeReview(10, "1"),
      makeReview(9, "2"),
      makeReview(7, "3"),
      makeReview(5, "4"),
    ];

    render(<ScoreDistribution reviews={reviews} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows count for each score", () => {
    const reviews = [makeReview(10, "1"), makeReview(10, "2"), makeReview(8, "3")];

    render(<ScoreDistribution reviews={reviews} />);

    expect(screen.getByText("2")).toBeInTheDocument(); // two 10s
    expect(screen.getByText("1")).toBeInTheDocument(); // one 8
  });

  it("shows empty state when no reviews", () => {
    render(<ScoreDistribution reviews={[]} />);

    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it("only shows scores that have at least one review", () => {
    const reviews = [makeReview(10, "1"), makeReview(7, "2")];

    render(<ScoreDistribution reviews={reviews} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    // 9, 8, 6, 5, etc. should not have bars
    expect(screen.queryByText("9")).not.toBeInTheDocument();
    expect(screen.queryByText("8")).not.toBeInTheDocument();
  });
});
