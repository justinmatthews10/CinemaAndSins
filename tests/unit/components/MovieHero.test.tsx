import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovieHero } from "@/components/MovieHero";
import type { Movie } from "@/types/movie";
import type { Pick } from "@/types/pick";
import type { Member } from "@/types/member";

// Mock next/navigation and supabase client
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  }),
}));

const mockMovie: Movie = {
  id: "movie-1",
  tmdb_id: 155,
  title: "The Dark Knight",
  year: 2008,
  director: "Christopher Nolan",
  runtime: 152,
  poster_url: "https://image.tmdb.org/t/p/w500/poster.jpg",
  synopsis: "Batman raises the stakes in his war on crime.",
  genres: ["Action", "Crime"],
  created_at: "2026-01-01",
};

const mockPicker: Member = {
  id: "member-1",
  email: "justin@example.com",
  name: "Justin",
  avatar_url: null,
  is_admin: true,
  is_approved: true,
  created_at: "2026-01-01",
};

const mockPick: Pick = {
  id: "pick-1",
  movie_id: "movie-1",
  picker_member_id: "member-1",
  month: 7,
  year: 2026,
  watch_date: "2026-07-31",
  picker_note: "Best Batman movie!",
  status: "current",
  created_at: "2026-07-01",
};

describe("MovieHero", () => {
  it("renders movie title and year", () => {
    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
    expect(screen.getByText("2008")).toBeInTheDocument();
  });

  it("renders director and runtime", () => {
    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/Christopher Nolan/i)).toBeInTheDocument();
    expect(screen.getByText(/152/)).toBeInTheDocument();
  });

  it("renders picked by badge with member name", () => {
    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/Justin/i)).toBeInTheDocument();
  });

  it("renders synopsis", () => {
    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/Batman raises the stakes/i)).toBeInTheDocument();
  });

  it("renders review stats", () => {
    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/3 of 5 reviewed/i)).toBeInTheDocument();
  });

  it("shows review prompt when user has not reviewed", () => {
    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/haven't reviewed/i)).toBeInTheDocument();
  });

  it("shows user score when user has reviewed", () => {
    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={{ score: 9.5, review_text: "Amazing!" }}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/9\.5/)).toBeInTheDocument();
  });

  it("renders countdown to watch date", () => {
    const futurePick = {
      ...mockPick,
      watch_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    };

    render(
      <MovieHero
        movie={mockMovie}
        pick={futurePick}
        picker={mockPicker}
        reviewStats={{ reviewed: 0, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/days? left/i)).toBeInTheDocument();
  });

  it("renders next picker teaser when provided", () => {
    const nextPicker: Member = {
      id: "member-2",
      email: "sarah@example.com",
      name: "Sarah",
      avatar_url: null,
      is_admin: false,
      is_approved: true,
      created_at: "2026-01-01",
    };

    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={nextPicker}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/Sarah/i)).toBeInTheDocument();
    expect(screen.getByText(/next month/i)).toBeInTheDocument();
  });

  it("renders poster image when available", () => {
    render(
      <MovieHero
        movie={mockMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    const img = screen.getByAltText("The Dark Knight");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockMovie.poster_url);
  });

  it("renders placeholder when poster is null", () => {
    const noPosterMovie = { ...mockMovie, poster_url: null };

    render(
      <MovieHero
        movie={noPosterMovie}
        pick={mockPick}
        picker={mockPicker}
        reviewStats={{ reviewed: 3, total: 5 }}
        userReview={null}
        nextPicker={null}
        canDelete={false}
      />,
    );

    expect(screen.getByText(/no poster/i)).toBeInTheDocument();
  });
});
