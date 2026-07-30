import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemberCard } from "@/components/MemberCard";
import type { MemberSummary } from "@/types/member-summary";

const makeSummary = (overrides: Partial<MemberSummary> = {}): MemberSummary => ({
  id: "m1",
  name: "Justin",
  avatar_url: null,
  created_at: "2026-01-01",
  review_count: 10,
  average_score: 8.5,
  club_average: 7.5,
  top_movie: {
    movie_id: "movie-1",
    title: "The Dark Knight",
    score: 10,
    poster_url: null,
  },
  worst_movie: {
    movie_id: "movie-2",
    title: "Cats",
    score: 2,
    poster_url: null,
  },
  ...overrides,
});

describe("MemberCard", () => {
  it("renders member name", () => {
    render(<MemberCard summary={makeSummary()} />);
    expect(screen.getByText("Justin")).toBeInTheDocument();
  });

  it("renders average score", () => {
    render(<MemberCard summary={makeSummary({ average_score: 8.5 })} />);
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("renders review count", () => {
    render(<MemberCard summary={makeSummary({ review_count: 12 })} />);
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  it("renders top movie title", () => {
    render(<MemberCard summary={makeSummary()} />);
    expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
  });

  it("renders worst movie title", () => {
    render(<MemberCard summary={makeSummary()} />);
    expect(screen.getByText("Cats")).toBeInTheDocument();
  });

  it("renders easy grader badge when avg is above club", () => {
    render(<MemberCard summary={makeSummary({ average_score: 9, club_average: 7 })} />);
    expect(screen.getByText(/easy grader/i)).toBeInTheDocument();
  });

  it("renders harsh critic badge when avg is below club", () => {
    render(<MemberCard summary={makeSummary({ average_score: 5, club_average: 7 })} />);
    expect(screen.getByText(/harsh critic/i)).toBeInTheDocument();
  });

  it("does not render badge when avg is close to club", () => {
    render(<MemberCard summary={makeSummary({ average_score: 7.5, club_average: 7 })} />);
    expect(screen.queryByText(/easy grader|harsh critic/i)).not.toBeInTheDocument();
  });

  it("links to profile page", () => {
    render(<MemberCard summary={makeSummary({ id: "abc-123" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profile/abc-123");
  });

  it("shows 'No reviews yet' when review count is 0", () => {
    render(
      <MemberCard
        summary={makeSummary({
          review_count: 0,
          average_score: 0,
          top_movie: null,
          worst_movie: null,
        })}
      />,
    );
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });
});
