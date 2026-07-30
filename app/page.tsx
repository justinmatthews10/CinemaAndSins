export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-4xl text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Cinema and Sins
        </h1>
        <p className="mt-6 text-lg text-foreground/70 sm:text-xl">
          Our movie club. Every month, one of us picks a movie, we all watch it, rate it
          1–10, and talk about it.
        </p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/schedule"
            className="rounded-full bg-accent px-6 py-3 font-medium text-background transition-colors hover:bg-accent/80"
          >
            View Schedule
          </a>
          <a
            href="/history"
            className="rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Browse History
          </a>
        </div>
      </div>
    </main>
  );
}
