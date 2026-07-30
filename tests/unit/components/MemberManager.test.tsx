import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemberManager } from "@/components/MemberManager";
import type { Member } from "@/types/member";

const makeMember = (overrides: Partial<Member> = {}): Member => ({
  id: "m1",
  email: "test@example.com",
  name: "Test User",
  avatar_url: null,
  is_admin: false,
  is_approved: true,
  created_at: "2026-01-01",
  ...overrides,
});

describe("MemberManager", () => {
  it("renders approved members", () => {
    render(
      <MemberManager
        members={[makeMember({ name: "Justin", is_approved: true })]}
        onApprove={vi.fn()}
        onRemove={vi.fn()}
        onToggleAdmin={vi.fn()}
      />,
    );
    expect(screen.getByText("Justin")).toBeInTheDocument();
  });

  it("renders pending members in a separate section", () => {
    render(
      <MemberManager
        members={[makeMember({ name: "Pending Pat", is_approved: false })]}
        onApprove={vi.fn()}
        onRemove={vi.fn()}
        onToggleAdmin={vi.fn()}
      />,
    );
    expect(screen.getByText("Pending Pat")).toBeInTheDocument();
    expect(screen.getByText(/pending approval/i)).toBeInTheDocument();
  });

  it("calls onApprove when approve button clicked", () => {
    const onApprove = vi.fn();
    render(
      <MemberManager
        members={[makeMember({ id: "abc", name: "Pat", is_approved: false })]}
        onApprove={onApprove}
        onRemove={vi.fn()}
        onToggleAdmin={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(onApprove).toHaveBeenCalledWith("abc");
  });

  it("calls onRemove when remove button clicked", () => {
    const onRemove = vi.fn();
    render(
      <MemberManager
        members={[makeMember({ id: "xyz", name: "Justin", is_approved: true })]}
        onApprove={vi.fn()}
        onRemove={onRemove}
        onToggleAdmin={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText(/remove/i));
    expect(onRemove).toHaveBeenCalledWith("xyz");
  });

  it("calls onToggleAdmin when make admin button clicked", () => {
    const onToggleAdmin = vi.fn();
    render(
      <MemberManager
        members={[makeMember({ id: "adm", name: "Justin", is_admin: false })]}
        onApprove={vi.fn()}
        onRemove={vi.fn()}
        onToggleAdmin={onToggleAdmin}
      />,
    );
    fireEvent.click(screen.getByText(/make admin/i));
    expect(onToggleAdmin).toHaveBeenCalledWith("adm", true);
  });

  it("shows 'Remove admin' when member is already admin", () => {
    render(
      <MemberManager
        members={[makeMember({ name: "Admin", is_admin: true })]}
        onApprove={vi.fn()}
        onRemove={vi.fn()}
        onToggleAdmin={vi.fn()}
      />,
    );
    expect(screen.getByText(/remove admin/i)).toBeInTheDocument();
  });

  it("shows empty state when no members", () => {
    render(
      <MemberManager
        members={[]}
        onApprove={vi.fn()}
        onRemove={vi.fn()}
        onToggleAdmin={vi.fn()}
      />,
    );
    expect(screen.getByText(/no members/i)).toBeInTheDocument();
  });
});
