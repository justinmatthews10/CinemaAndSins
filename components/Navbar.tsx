"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { navLinkClass } from "@/lib/ui";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/history", label: "History" },
  { href: "/stats", label: "Stats" },
];

export default function Navbar() {
  const { user, member, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isApproved = member?.is_approved === true;
  const isAdmin = member?.is_admin === true;

  return (
    <nav className="relative z-50 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-xl font-bold text-foreground"
        >
          Cinema and Sins
        </Link>

        <div className="flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}

          {loading ? (
            <span className="text-foreground/40">...</span>
          ) : user ? (
            isApproved ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-full border border-border px-4 py-2 font-medium text-foreground transition-colors hover:bg-foreground/5"
                >
                  {member?.name}
                  <svg
                    className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
                    <Link
                      href="/add-movie"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
                    >
                      My Pick
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      href={`/profile/${member?.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
                    >
                      Profile
                    </Link>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-foreground/5"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/pending"
                className="rounded-full bg-accent-secondary px-4 py-2 font-medium text-white"
              >
                Pending
              </Link>
            )
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-accent px-4 py-2 font-medium text-background transition-colors hover:bg-accent/80"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
