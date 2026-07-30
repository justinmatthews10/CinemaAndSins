"use client";

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

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const isApproved = member?.is_approved === true;

  return (
    <nav className="border-b border-border bg-surface">
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
              <div className="flex items-center gap-4">
                <Link href="/add-movie" className={navLinkClass}>
                  Add Movie
                </Link>
                <span className="text-foreground/60">{member?.name}</span>
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-border px-4 py-2 font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  Log Out
                </button>
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
