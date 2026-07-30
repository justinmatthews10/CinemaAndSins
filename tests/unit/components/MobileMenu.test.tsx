import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileMenu } from "@/components/MobileMenu";
import type { Member } from "@/types/member";

const makeMember = (overrides: Partial<Member> = {}): Member => ({
  id: "m1",
  email: "justin@example.com",
  name: "Justin",
  avatar_url: null,
  is_admin: false,
  is_approved: true,
  created_at: "2026-01-01",
  ...overrides,
});

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/history", label: "History" },
  { href: "/members", label: "Members" },
  { href: "/stats", label: "Stats" },
];

describe("MobileMenu", () => {
  it("renders hamburger button when closed", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={null}
        member={null}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });

  it("opens menu when hamburger clicked", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={null}
        member={null}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
  });

  it("closes menu when close button clicked", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={null}
        member={null}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    fireEvent.click(screen.getByLabelText(/close menu/i));
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });

  it("renders all nav links when open", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={null}
        member={null}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    for (const link of navLinks) {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    }
  });

  it("shows login link when no user", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={null}
        member={null}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it("shows user menu items when logged in and approved", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={{ id: "u1" } as never}
        member={makeMember()}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    expect(screen.getByText(/my pick/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/log out/i)).toBeInTheDocument();
  });

  it("shows admin link when user is admin", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={{ id: "u1" } as never}
        member={makeMember({ is_admin: true })}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  it("shows pending link when user is not approved", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={{ id: "u1" } as never}
        member={makeMember({ is_approved: false })}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it("calls onSignOut when log out clicked", () => {
    const onSignOut = vi.fn();
    render(
      <MobileMenu
        navLinks={navLinks}
        user={{ id: "u1" } as never}
        member={makeMember()}
        loading={false}
        onSignOut={onSignOut}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    fireEvent.click(screen.getByText(/log out/i));
    expect(onSignOut).toHaveBeenCalled();
  });

  it("closes menu after clicking a nav link", () => {
    render(
      <MobileMenu
        navLinks={navLinks}
        user={null}
        member={null}
        loading={false}
        onSignOut={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText(/open menu/i));
    fireEvent.click(screen.getByText("Schedule"));
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });
});
