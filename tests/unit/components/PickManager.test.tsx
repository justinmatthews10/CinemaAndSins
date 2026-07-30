import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PickManager } from "@/components/PickManager";
import type { PickWithMovie } from "@/components/PickManager";

const makePick = (overrides: Partial<PickWithMovie> = {}): PickWithMovie => ({
  id: "p1",
  movie_id: "m1",
  picker_member_id: "r1",
  picker_name: "Justin",
  month: 7,
  year: 2026,
  watch_date: "2026-07-17",
  status: "current",
  movie_title: "Inception",
  movie_poster_url: null,
  ...overrides,
});

describe("PickManager", () => {
  it("renders picks with movie title and picker", () => {
    render(<PickManager picks={[makePick()]} onLock={vi.fn()} onUnlock={vi.fn()} />);
    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText(/Justin/i)).toBeInTheDocument();
  });

  it("shows Lock button for non-locked picks", () => {
    render(
      <PickManager
        picks={[makePick({ status: "current" })]}
        onLock={vi.fn()}
        onUnlock={vi.fn()}
      />,
    );
    expect(screen.getByText(/lock/i)).toBeInTheDocument();
  });

  it("shows Unlock button for locked picks", () => {
    render(
      <PickManager
        picks={[makePick({ status: "locked" })]}
        onLock={vi.fn()}
        onUnlock={vi.fn()}
      />,
    );
    expect(screen.getByText(/unlock/i)).toBeInTheDocument();
  });

  it("calls onLock with pick id when lock clicked", () => {
    const onLock = vi.fn();
    render(
      <PickManager
        picks={[makePick({ id: "abc", status: "current" })]}
        onLock={onLock}
        onUnlock={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText(/lock/i));
    expect(onLock).toHaveBeenCalledWith("abc");
  });

  it("calls onUnlock with pick id when unlock clicked", () => {
    const onUnlock = vi.fn();
    render(
      <PickManager
        picks={[makePick({ id: "xyz", status: "locked" })]}
        onLock={vi.fn()}
        onUnlock={onUnlock}
      />,
    );
    fireEvent.click(screen.getByText(/unlock/i));
    expect(onUnlock).toHaveBeenCalledWith("xyz");
  });

  it("shows empty state when no picks", () => {
    render(<PickManager picks={[]} onLock={vi.fn()} onUnlock={vi.fn()} />);
    expect(screen.getByText(/no picks/i)).toBeInTheDocument();
  });
});
