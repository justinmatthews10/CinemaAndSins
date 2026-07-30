import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovieCard } from "@/components/MovieCard";
import type { HistoryEntry } from "@/types/history";

const makeEntry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  movie_id: "movie-1",
  title: "The Matrix",
  year: 1999,
  poster_url: "https://example.com/poster.jpg",
  genres: ["Sci-Fi", "Action"],
  picker_id: "member-1",
  picker_name: "Justin",
  pick_month: 6,
  pick_year: 2026,
  average_score: 8.5,
  review_count: 4,
  score_variance: 2.1,
  ...overrides,
});

describe("MovieCard", () => {
  it("renders title and year", () => {
    render(<MovieCard entry={makeEntry()} />);

    expect(screen.getByText("The Matrix")).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
  });

  it("renders picker name", () => {
    render(<MovieCard entry={makeEntry()} />);

    expect(screen.getByText(/Justin/i)).toBeInTheDocument();
  });

  it("renders average score", () => {
    render(<MovieCard entry={makeEntry({ average_score: 9 })} />);

    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("renders review count", () => {
    render(<MovieCard entry={makeEntry({ review_count: 7 })} />);

    expect(screen.getByText(/7/)).toBeInTheDocument();
  });

  it("renders genres", () => {
    render(<MovieCard entry={makeEntry()} />);

    expect(screen.getByText(/Sci-Fi, Action/)).toBeInTheDocument();
  });

  it("links to movie detail page", () => {
    render(<MovieCard entry={makeEntry({ movie_id: "abc-123" })} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/movies/abc-123");
  });

  it("shows 'No reviews yet' when review count is 0", () => {
    render(<MovieCard entry={makeEntry({ review_count: 0, average_score: 0 })} />);

    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it("shows 'Hot Takes' badge when variance is high", () => {
    render(<MovieCard entry={makeEntry({ score_variance: 5.5, review_count: 5 })} />);

    expect(screen.getByText(/hot takes/i)).toBeInTheDocument();
  });

  it("does not show 'Hot Takes' badge when variance is low", () => {
    render(<MovieCard entry={makeEntry({ score_variance: 1.0, review_count: 5 })} />);

    expect(screen.queryByText(/hot takes/i)).not.toBeInTheDocument();
  });

  it("does not show 'Hot Takes' badge when review count is below threshold", () => {
    render(<MovieCard entry={makeEntry({ score_variance: 5.5, review_count: 3 })} />);

    expect(screen.queryByText(/hot takes/i)).not.toBeInTheDocument();
  });
});
