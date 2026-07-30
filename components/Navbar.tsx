import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-xl font-bold text-foreground"
        >
          CinemaAndSins
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-foreground/70 transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/schedule"
            className="text-foreground/70 transition-colors hover:text-foreground"
          >
            Schedule
          </Link>
          <Link
            href="/history"
            className="text-foreground/70 transition-colors hover:text-foreground"
          >
            History
          </Link>
          <Link
            href="/stats"
            className="text-foreground/70 transition-colors hover:text-foreground"
          >
            Stats
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-accent px-4 py-2 font-medium text-background transition-colors hover:bg-accent/80"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
