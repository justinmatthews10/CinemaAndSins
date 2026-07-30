import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContentManager } from "@/components/ContentManager";
import type { AdminMovie, AdminReview } from "@/components/ContentManager";

const makeMovie = (overrides: Partial<AdminMovie> = {}): AdminMovie => ({
  id: "m1",
  title: "The Room",
  year: 2003,
  poster_url: null,
  review_count: 5,
  ...overrides,
});

const makeReview = (overrides: Partial<AdminReview> = {}): AdminReview => ({
  id: "r1",
  score: 2,
  review_text: "Oh hi Mark",
  member_name: "Alex",
  movie_title: "The Room",
  pick_id: "p1",
  ...overrides,
});

describe("ContentManager", () => {
  it("renders movies tab with movie titles", () => {
    render(
      <ContentManager
        movies={[makeMovie()]}
        reviews={[]}
        onDeleteMovie={vi.fn()}
        onDeleteReview={vi.fn()}
      />,
    );
    expect(screen.getByText("The Room")).toBeInTheDocument();
  });

  it("renders reviews tab with review info", () => {
    render(
      <ContentManager
        movies={[]}
        reviews={[makeReview()]}
        onDeleteMovie={vi.fn()}
        onDeleteReview={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /reviews/i }));
    expect(screen.getByText("Oh hi Mark")).toBeInTheDocument();
    expect(screen.getByText(/Alex on The Room/i)).toBeInTheDocument();
  });

  it("calls onDeleteMovie when delete movie clicked", () => {
    const onDeleteMovie = vi.fn();
    render(
      <ContentManager
        movies={[makeMovie({ id: "abc" })]}
        reviews={[]}
        onDeleteMovie={onDeleteMovie}
        onDeleteReview={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText(/delete/i));
    expect(onDeleteMovie).toHaveBeenCalledWith("abc");
  });

  it("calls onDeleteReview when delete review clicked", () => {
    const onDeleteReview = vi.fn();
    render(
      <ContentManager
        movies={[]}
        reviews={[makeReview({ id: "rxyz" })]}
        onDeleteMovie={vi.fn()}
        onDeleteReview={onDeleteReview}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /reviews/i }));
    fireEvent.click(screen.getByText(/delete/i));
    expect(onDeleteReview).toHaveBeenCalledWith("rxyz");
  });

  it("shows empty states when no data", () => {
    render(
      <ContentManager
        movies={[]}
        reviews={[]}
        onDeleteMovie={vi.fn()}
        onDeleteReview={vi.fn()}
      />,
    );
    expect(screen.getByText(/no movies/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reviews/i }));
    expect(screen.getByText(/no reviews/i)).toBeInTheDocument();
  });
});
