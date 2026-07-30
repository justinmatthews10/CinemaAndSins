import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TmdbSearch } from "@/components/TmdbSearch";

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockSearchResponse(results: unknown[]) {
  return {
    ok: true,
    json: () => Promise.resolve(results),
  } as Response;
}

describe("TmdbSearch", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders search input with placeholder", () => {
    render(<TmdbSearch onSelect={() => {}} />);
    expect(screen.getByPlaceholderText(/search for a movie/i)).toBeInTheDocument();
  });

  it("shows loading state while searching", async () => {
    // Delay the response
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockSearchResponse([])), 100)),
    );

    render(<TmdbSearch onSelect={() => {}} />);
    const input = screen.getByPlaceholderText(/search for a movie/i);
    await userEvent.type(input, "batman");

    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it("displays search results after typing", async () => {
    const results = [
      {
        tmdb_id: 155,
        title: "The Dark Knight",
        year: 2008,
        poster_url: "https://image.tmdb.org/t/p/w500/poster.jpg",
        synopsis: "Batman movie.",
      },
    ];
    mockFetch.mockResolvedValue(mockSearchResponse(results));

    render(<TmdbSearch onSelect={() => {}} />);
    const input = screen.getByPlaceholderText(/search for a movie/i);
    await userEvent.type(input, "dark knight");

    await waitFor(() => {
      expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
      expect(screen.getByText("2008")).toBeInTheDocument();
    });
  });

  it("calls onSelect when a result is clicked", async () => {
    const onSelect = vi.fn();
    const results = [
      {
        tmdb_id: 155,
        title: "The Dark Knight",
        year: 2008,
        poster_url: null,
        synopsis: null,
      },
    ];
    mockFetch.mockResolvedValue(mockSearchResponse(results));

    render(<TmdbSearch onSelect={onSelect} />);
    await userEvent.type(
      screen.getByPlaceholderText(/search for a movie/i),
      "dark knight",
    );

    await waitFor(() => {
      expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("The Dark Knight"));
    expect(onSelect).toHaveBeenCalledWith(results[0]);
  });

  it("shows no results message when search returns empty", async () => {
    mockFetch.mockResolvedValue(mockSearchResponse([]));

    render(<TmdbSearch onSelect={() => {}} />);
    await userEvent.type(
      screen.getByPlaceholderText(/search for a movie/i),
      "xyznonexistent",
    );

    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  it("shows error message on API failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    render(<TmdbSearch onSelect={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText(/search for a movie/i), "batman");

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("debounces search calls (does not call API on every keystroke)", async () => {
    mockFetch.mockResolvedValue(mockSearchResponse([]));

    render(<TmdbSearch onSelect={() => {}} />);
    const input = screen.getByPlaceholderText(/search for a movie/i);

    await userEvent.type(input, "batman", { delay: 10 });

    // Should not call fetch immediately on every keystroke
    // Wait for debounce to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Should only make one API call after debouncing
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("clears results when input is cleared", async () => {
    const results = [
      {
        tmdb_id: 155,
        title: "The Dark Knight",
        year: 2008,
        poster_url: null,
        synopsis: null,
      },
    ];
    mockFetch.mockResolvedValue(mockSearchResponse(results));

    render(<TmdbSearch onSelect={() => {}} />);
    const input = screen.getByPlaceholderText(/search for a movie/i);

    await userEvent.type(input, "dark knight");
    await waitFor(() => {
      expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
    });

    await userEvent.clear(input);
    await waitFor(() => {
      expect(screen.queryByText("The Dark Knight")).not.toBeInTheDocument();
    });
  });
});
