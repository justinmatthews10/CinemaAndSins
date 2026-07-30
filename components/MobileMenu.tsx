"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Member } from "@/types/member";

type NavLink = {
  href: string;
  label: string;
};

type MobileMenuProps = {
  navLinks: NavLink[];
  user: { id: string } | null;
  member: Member | null;
  loading: boolean;
  onSignOut: () => void;
};

export function MobileMenu({
  navLinks,
  user,
  member,
  loading,
  onSignOut,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isApproved = member?.is_approved === true;
  const isAdmin = member?.is_admin === true;

  function close() {
    setOpen(false);
  }

  function handleSignOut() {
    close();
    onSignOut();
  }

  return (
    <div className="relative sm:hidden" ref={menuRef}>
      {/* Hamburger / close button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-foreground/5"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-surface py-2 shadow-lg">
          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="block px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
            >
              {link.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-1 border-t border-border" />

          {/* User section */}
          {loading ? (
            <span className="block px-4 py-3 text-sm text-foreground/40">...</span>
          ) : user ? (
            isApproved ? (
              <>
                <Link
                  href="/add-movie"
                  onClick={close}
                  className="block px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
                >
                  My Pick
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={close}
                    className="block px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href={`/profile/${member?.id}`}
                  onClick={close}
                  className="block px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
                >
                  Profile
                </Link>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={handleSignOut}
                  className="block w-full px-4 py-3 text-left text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/pending"
                onClick={close}
                className="block px-4 py-3 text-sm font-medium text-accent-secondary transition-colors hover:bg-foreground/5"
              >
                Pending
              </Link>
            )
          ) : (
            <Link
              href="/login"
              onClick={close}
              className="block px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-foreground/5"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
