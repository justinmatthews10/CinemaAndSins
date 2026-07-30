import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryControls } from "@/components/HistoryControls";
import type { HistoryEntry } from "@/types/history";

const entries: HistoryEntry[] = [
  {
    movie_id: "1",
    title: "The Matrix",
    year: 1999,
    poster_url: null,
    genres: ["Sci-Fi", "Action"],
    picker_id: "m1",
    picker_name: "Justin",
    pick_month: 6,
    pick_year: 2026,
    average_score: 8.5,
    review_count: 5,
    score_variance: 1.0,
  },
  {
    movie_id: "2",
    title: "Inception",
    year: 2010,
    poster_url: null,
    genres: ["Sci-Fi", "Thriller"],
    picker_id: "m2",
    picker_name: "Sarah",
    pick_month: 5,
    pick_year: 2026,
    average_score: 7.0,
    review_count: 3,
    score_variance: 3.0,
  },
];

describe("HistoryControls", () => {
  it("renders search input", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  it("renders genre filter", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
  });

  it("renders picker filter", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    expect(screen.getByLabelText(/picker/i)).toBeInTheDocument();
  });

  it("filters by search query", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    const search = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(search, { target: { value: "matrix" } });

    expect(screen.getByText("The Matrix")).toBeInTheDocument();
    expect(screen.queryByText("Inception")).not.toBeInTheDocument();
  });

  it("filters by genre", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    const genreSelect = screen.getByLabelText(/genre/i);
    fireEvent.change(genreSelect, { target: { value: "Thriller" } });

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.queryByText("The Matrix")).not.toBeInTheDocument();
  });

  it("filters by picker", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    const pickerSelect = screen.getByLabelText(/picker/i);
    fireEvent.change(pickerSelect, { target: { value: "Sarah" } });

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.queryByText("The Matrix")).not.toBeInTheDocument();
  });

  it("sorts by average score descending", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: "score" } });

    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles[0]).toHaveTextContent("The Matrix");
    expect(titles[1]).toHaveTextContent("Inception");
  });

  it("sorts by year ascending", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: "year" } });

    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles[0]).toHaveTextContent("The Matrix");
    expect(titles[1]).toHaveTextContent("Inception");
  });

  it("shows empty state when no results match", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    const search = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(search, { target: { value: "nonexistent movie" } });

    expect(screen.getByText(/no movies found/i)).toBeInTheDocument();
  });

  it("resets filters when reset button is clicked", () => {
    render(
      <HistoryControls
        entries={entries}
        pickers={["Justin", "Sarah"]}
        genres={["Sci-Fi", "Action", "Thriller"]}
      />,
    );

    const search = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(search, { target: { value: "matrix" } });

    expect(screen.getByText("The Matrix")).toBeInTheDocument();
    expect(screen.queryByText("Inception")).not.toBeInTheDocument();

    const resetButton = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetButton);

    expect(screen.getByText("The Matrix")).toBeInTheDocument();
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });
});
