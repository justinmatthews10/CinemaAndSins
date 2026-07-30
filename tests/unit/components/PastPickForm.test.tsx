import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PastPickForm } from "@/components/PastPickForm";
import type { Member } from "@/types/member";
import type { TmdbSearchResult } from "@/types/movie";

const makeMember = (id: string, name: string): Member => ({
  id,
  email: `${name.toLowerCase()}@example.com`,
  name,
  avatar_url: null,
  is_admin: false,
  is_approved: true,
  created_at: "2026-01-01",
});

const mockMembers: Member[] = [
  makeMember("1", "Justin"),
  makeMember("2", "Sarah"),
  makeMember("3", "Mike"),
];

const mockResult: TmdbSearchResult = {
  tmdb_id: 27205,
  title: "Inception",
  year: 2010,
  poster_url: "/poster.jpg",
  synopsis: null,
};

// Mock TmdbSearch to skip the async search and call onSelect directly
vi.mock("@/components/TmdbSearch", () => ({
  TmdbSearch: ({ onSelect }: { onSelect: (r: TmdbSearchResult) => void }) => (
    <button data-testid="mock-tmdb-search" onClick={() => onSelect(mockResult)}>
      Select Inception
    </button>
  ),
}));

describe("PastPickForm", () => {
  it("renders movie search, picker dropdown, month/year, watch date, and note", () => {
    render(<PastPickForm members={mockMembers} onSubmit={vi.fn()} submitting={false} />);
    expect(screen.getByTestId("mock-tmdb-search")).toBeInTheDocument();
    expect(screen.getByLabelText(/^picker$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/watch date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/picker note/i)).toBeInTheDocument();
  });

  it("shows selected movie after TMDB selection", async () => {
    render(<PastPickForm members={mockMembers} onSubmit={vi.fn()} submitting={false} />);
    fireEvent.click(screen.getByTestId("mock-tmdb-search"));
    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });
  });

  it("populates picker dropdown with approved members", () => {
    render(<PastPickForm members={mockMembers} onSubmit={vi.fn()} submitting={false} />);
    const select = screen.getByLabelText(/^picker$/i) as HTMLSelectElement;
    expect(select.options.length).toBe(4); // 3 members + placeholder
    expect(screen.getByText("Justin")).toBeInTheDocument();
    expect(screen.getByText("Sarah")).toBeInTheDocument();
    expect(screen.getByText("Mike")).toBeInTheDocument();
  });

  it("disables submit until all required fields filled", async () => {
    render(<PastPickForm members={mockMembers} onSubmit={vi.fn()} submitting={false} />);
    const submitBtn = screen.getByRole("button", { name: /create past pick/i });
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit when movie selected, picker chosen, month and year filled", async () => {
    render(<PastPickForm members={mockMembers} onSubmit={vi.fn()} submitting={false} />);
    // Select movie
    fireEvent.click(screen.getByTestId("mock-tmdb-search"));
    await waitFor(() => screen.getByText("Inception"));

    // Select picker
    fireEvent.change(screen.getByLabelText(/^picker$/i), { target: { value: "1" } });

    // Select month
    fireEvent.change(screen.getByLabelText(/month/i), { target: { value: "3" } });

    // Select year
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: "2025" } });

    const submitBtn = screen.getByRole("button", { name: /create past pick/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it("calls onSubmit with correct data when submitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PastPickForm members={mockMembers} onSubmit={onSubmit} submitting={false} />);

    fireEvent.click(screen.getByTestId("mock-tmdb-search"));
    await waitFor(() => screen.getByText("Inception"));

    fireEvent.change(screen.getByLabelText(/^picker$/i), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText(/month/i), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: "2024" } });
    fireEvent.change(screen.getByLabelText(/watch date/i), {
      target: { value: "2024-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/picker note/i), {
      target: { value: "Great pick!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create past pick/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        movie: mockResult,
        pickerMemberId: "2",
        month: 6,
        year: 2024,
        watchDate: "2024-06-15",
        pickerNote: "Great pick!",
      });
    });
  });

  it("shows submitting state on button when submitting=true", () => {
    render(<PastPickForm members={mockMembers} onSubmit={vi.fn()} submitting={true} />);
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
  });

  it("shows empty state when no approved members", () => {
    render(
      <PastPickForm
        members={[makeMember("1", "Pending")]}
        membersApproved={[]}
        onSubmit={vi.fn()}
        submitting={false}
      />,
    );
    expect(screen.getByText(/no approved members/i)).toBeInTheDocument();
  });
});
