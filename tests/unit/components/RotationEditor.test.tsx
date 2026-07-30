import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RotationEditor } from "@/components/RotationEditor";
import type { RotationEntry } from "@/types/rotation";
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

const makeEntry = (
  memberId: string,
  orderIndex: number,
  isActive = true,
): RotationEntry => ({
  id: `rot-${memberId}`,
  order_index: orderIndex,
  member_id: memberId,
  is_active: isActive,
  updated_at: "2026-01-01",
});

const mockMembers: Member[] = [
  makeMember("1", "Justin"),
  makeMember("2", "Sarah"),
  makeMember("3", "Mike"),
  makeMember("4", "Emma"),
  makeMember("5", "Alex"),
];

const mockRotation: RotationEntry[] = [
  makeEntry("1", 0),
  makeEntry("2", 1),
  makeEntry("3", 2),
  makeEntry("4", 3),
  makeEntry("5", 4),
];

describe("RotationEditor", () => {
  it("renders all active rotation members in order", () => {
    render(
      <RotationEditor
        rotation={mockRotation}
        members={mockMembers}
        onReorder={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );

    const names = screen.getAllByText(/Justin|Sarah|Mike|Emma|Alex/);
    expect(names).toHaveLength(5);
  });

  it("shows order numbers", () => {
    render(
      <RotationEditor
        rotation={mockRotation}
        members={mockMembers}
        onReorder={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onReorder when up arrow clicked", () => {
    const onReorder = vi.fn();
    render(
      <RotationEditor
        rotation={mockRotation}
        members={mockMembers}
        onReorder={onReorder}
        onToggleActive={vi.fn()}
      />,
    );

    const upButtons = screen.getAllByLabelText(/move .* up/i);
    fireEvent.click(upButtons[1]); // Second member's up button

    expect(onReorder).toHaveBeenCalledWith(1, "up");
  });

  it("calls onReorder when down arrow clicked", () => {
    const onReorder = vi.fn();
    render(
      <RotationEditor
        rotation={mockRotation}
        members={mockMembers}
        onReorder={onReorder}
        onToggleActive={vi.fn()}
      />,
    );

    const downButtons = screen.getAllByLabelText(/move .* down/i);
    fireEvent.click(downButtons[0]); // First member's down button

    expect(onReorder).toHaveBeenCalledWith(0, "down");
  });

  it("disables up arrow for first member", () => {
    render(
      <RotationEditor
        rotation={mockRotation}
        members={mockMembers}
        onReorder={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );

    const upButtons = screen.getAllByLabelText(/move .* up/i);
    expect(upButtons[0]).toBeDisabled();
  });

  it("disables down arrow for last member", () => {
    render(
      <RotationEditor
        rotation={mockRotation}
        members={mockMembers}
        onReorder={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );

    const downButtons = screen.getAllByLabelText(/move .* down/i);
    expect(downButtons[downButtons.length - 1]).toBeDisabled();
  });

  it("calls onToggleActive when deactivate button clicked", () => {
    const onToggleActive = vi.fn();
    render(
      <RotationEditor
        rotation={mockRotation}
        members={mockMembers}
        onReorder={vi.fn()}
        onToggleActive={onToggleActive}
      />,
    );

    const deactivateButtons = screen.getAllByLabelText(/deactivate/i);
    fireEvent.click(deactivateButtons[0]);

    expect(onToggleActive).toHaveBeenCalledWith("1", false);
  });

  it("shows inactive members with activate button", () => {
    const rotationWithInactive = [
      ...mockRotation.slice(0, 2),
      makeEntry("3", 2, false),
      ...mockRotation.slice(3),
    ];

    render(
      <RotationEditor
        rotation={rotationWithInactive}
        members={mockMembers}
        onReorder={vi.fn()}
        onToggleActive={vi.fn()}
      />,
    );

    expect(screen.getAllByLabelText(/^activate/i)).toHaveLength(1);
  });

  it("shows members not in rotation with add button", () => {
    const extraMember = makeMember("6", "Bob");
    const allMembers = [...mockMembers, extraMember];

    render(
      <RotationEditor
        rotation={mockRotation}
        members={allMembers}
        onReorder={vi.fn()}
        onToggleActive={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/add .* to rotation/i)).toHaveLength(1);
  });
});
