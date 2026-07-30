import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewCard } from "@/components/ReviewCard";
import type { Review } from "@/types/review";
import type { Member } from "@/types/member";

const makeMember = (id: string, name: string): Member => ({
  id,
  email: `${name.toLowerCase()}@example.com`,
  name,
  avatar_url: null,
  is_admin: false,
  is_approved: true,
  created_at: "2026-01-01",
});

const makeReview = (overrides: Partial<Review> = {}): Review => ({
  id: "rev-1",
  pick_id: "pick-1",
  member_id: "1",
  score: 8,
  review_text: "Great movie!",
  tags: [],
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  ...overrides,
});

describe("ReviewCard", () => {
  it("renders member name", () => {
    render(<ReviewCard review={makeReview()} member={makeMember("1", "Justin")} />);

    expect(screen.getByText("Justin")).toBeInTheDocument();
  });

  it("renders score badge", () => {
    render(
      <ReviewCard
        review={makeReview({ score: 9.5 })}
        member={makeMember("1", "Justin")}
      />,
    );

    expect(screen.getByText("9.5")).toBeInTheDocument();
  });

  it("renders review text", () => {
    render(
      <ReviewCard
        review={makeReview({ review_text: "Amazing film!" })}
        member={makeMember("1", "Justin")}
      />,
    );

    expect(screen.getByText("Amazing film!")).toBeInTheDocument();
  });

  it("shows placeholder when no review text", () => {
    render(
      <ReviewCard
        review={makeReview({ review_text: null })}
        member={makeMember("1", "Justin")}
      />,
    );

    expect(screen.getByText(/no written review/i)).toBeInTheDocument();
  });

  it("renders tags when present", () => {
    render(
      <ReviewCard
        review={makeReview({ tags: ["rewatch", "first time"] })}
        member={makeMember("1", "Justin")}
      />,
    );

    expect(screen.getByText(/rewatch/i)).toBeInTheDocument();
    expect(screen.getByText(/first time/i)).toBeInTheDocument();
  });

  it("does not render tags section when empty", () => {
    render(
      <ReviewCard review={makeReview({ tags: [] })} member={makeMember("1", "Justin")} />,
    );

    expect(screen.queryByText(/rewatch/i)).not.toBeInTheDocument();
  });

  it("applies cyan badge color for score 9+", () => {
    render(
      <ReviewCard
        review={makeReview({ score: 10 })}
        member={makeMember("1", "Justin")}
      />,
    );

    const badge = screen.getByText("10");
    expect(badge.className).toContain("text-cyan-400");
  });

  it("applies red badge color for score below 5", () => {
    render(
      <ReviewCard review={makeReview({ score: 3 })} member={makeMember("1", "Justin")} />,
    );

    const badge = screen.getByText("3");
    expect(badge.className).toContain("text-accent-secondary");
  });
});
