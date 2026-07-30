import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScheduleTimeline } from "@/components/ScheduleTimeline";
import type { ScheduleSlot } from "@/lib/supabase/getSchedule";
import type { Member } from "@/types/member";

const mockMember = (id: string, name: string): Member => ({
  id,
  email: `${name.toLowerCase()}@example.com`,
  name,
  avatar_url: null,
  is_admin: false,
  is_approved: true,
  created_at: "2026-01-01",
});

const noPick = (month: number, year: number, picker: Member): ScheduleSlot => ({
  month,
  year,
  picker,
  pick: null,
  movie: null,
  status: "not_picked",
});

const withPick = (
  month: number,
  year: number,
  picker: Member,
  title: string,
  posterUrl: string | null = "https://example.com/poster.jpg",
  status: ScheduleSlot["status"] = "movie_selected",
): ScheduleSlot => ({
  month,
  year,
  picker,
  pick: {
    id: `pick-${month}-${year}`,
    movie_id: `movie-${month}-${year}`,
    picker_member_id: picker.id,
    month,
    year,
    watch_date: null,
    picker_note: null,
    status: status === "locked" ? "locked" : "upcoming",
    created_at: "2026-01-01",
  },
  movie: {
    id: `movie-${month}-${year}`,
    tmdb_id: 123,
    title,
    year: 2020,
    director: null,
    runtime: null,
    poster_url: posterUrl,
    synopsis: null,
    genres: [],
    created_at: "2026-01-01",
  },
  status,
});

describe("ScheduleTimeline", () => {
  it("renders month and year for each slot", () => {
    const slots = [
      noPick(8, 2026, mockMember("1", "Justin")),
      noPick(9, 2026, mockMember("2", "Sarah")),
    ];

    render(<ScheduleTimeline slots={slots} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByText(/August 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/September 2026/i)).toBeInTheDocument();
  });

  it("shows assigned picker name", () => {
    const slots = [noPick(8, 2026, mockMember("1", "Justin"))];

    render(<ScheduleTimeline slots={slots} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByText(/Picked by Justin/i)).toBeInTheDocument();
  });

  it("shows picker name even when movie is picked", () => {
    const slots = [withPick(8, 2026, mockMember("1", "Justin"), "Inception")];

    render(<ScheduleTimeline slots={slots} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByText(/Picked by Justin/i)).toBeInTheDocument();
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("shows 'Not picked yet' status when no movie", () => {
    const slots = [noPick(8, 2026, mockMember("1", "Justin"))];

    render(<ScheduleTimeline slots={slots} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByText(/not picked/i)).toBeInTheDocument();
  });

  it("shows movie title when a pick exists", () => {
    const slots = [withPick(8, 2026, mockMember("1", "Justin"), "Inception")];

    render(<ScheduleTimeline slots={slots} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("shows 'Movie selected' status when pick exists", () => {
    const slots = [withPick(8, 2026, mockMember("1", "Justin"), "Inception")];

    render(<ScheduleTimeline slots={slots} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByText(/movie selected/i)).toBeInTheDocument();
  });

  it("shows 'Locked' status when pick is locked", () => {
    const slots = [
      withPick(8, 2026, mockMember("1", "Justin"), "Inception", "url", "locked"),
    ];

    render(<ScheduleTimeline slots={slots} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByText(/locked/i)).toBeInTheDocument();
  });

  it("shows poster when movie has one", () => {
    const slots = [withPick(8, 2026, mockMember("1", "Justin"), "Inception")];

    render(<ScheduleTimeline slots={slots} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByAltText("Inception")).toBeInTheDocument();
  });

  it("shows link to /add-movie when canPick is true", () => {
    const me = mockMember("1", "Justin");
    const slots = [noPick(8, 2026, me)];

    render(<ScheduleTimeline slots={slots} currentUserId="1" pastSlots={[]} />);

    const link = screen.getByRole("link", { name: /pick a movie/i });
    expect(link).toHaveAttribute("href", "/add-movie");
  });

  it("does not show pick link when canPick is false", () => {
    const slots = [noPick(8, 2026, mockMember("2", "Sarah"))];

    render(<ScheduleTimeline slots={slots} currentUserId="1" pastSlots={[]} />);

    expect(screen.queryByRole("link", { name: /pick a movie/i })).not.toBeInTheDocument();
  });

  it("only shows pick link for the first unpicked slot, not future slots", () => {
    const me = mockMember("1", "Justin");
    // Two future slots for the same user, both unpicked
    const slots = [noPick(8, 2026, me), noPick(2, 2027, me)];

    render(<ScheduleTimeline slots={slots} currentUserId="1" pastSlots={[]} />);

    const links = screen.getAllByRole("link", { name: /pick a movie/i });
    expect(links).toHaveLength(1);
  });

  it("does not show pick link when movie already selected", () => {
    const me = mockMember("1", "Justin");
    const slots = [withPick(8, 2026, me, "Inception")];

    render(<ScheduleTimeline slots={slots} currentUserId="1" pastSlots={[]} />);

    expect(screen.queryByRole("link", { name: /pick a movie/i })).not.toBeInTheDocument();
  });

  it("shows past slots count in history section", () => {
    const pastSlots = [
      withPick(5, 2026, mockMember("1", "Justin"), "Dark Knight"),
      withPick(6, 2026, mockMember("2", "Sarah"), "Forrest Gump"),
    ];

    render(<ScheduleTimeline slots={[]} currentUserId={null} pastSlots={pastSlots} />);

    expect(screen.getByText(/2 past picks/i)).toBeInTheDocument();
    expect(screen.getByText("Dark Knight")).toBeInTheDocument();
    expect(screen.getByText("Forrest Gump")).toBeInTheDocument();
  });

  it("shows empty state when no slots and no past picks", () => {
    render(<ScheduleTimeline slots={[]} currentUserId={null} pastSlots={[]} />);

    expect(screen.getByText(/no rotation/i)).toBeInTheDocument();
  });
});
