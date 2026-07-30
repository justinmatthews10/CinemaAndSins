import { getCurrentPick } from "@/lib/supabase/getCurrentPick";
import { createClient } from "@/lib/supabase/server";
import { MovieHero } from "@/components/MovieHero";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPick = await getCurrentPick(user?.id ?? null);

  if (!currentPick) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-2xl text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Cinema and Sins
          </h1>
          <p className="mt-6 text-lg text-foreground/70 sm:text-xl">
            Our movie club. Every month, one of us picks a movie, we all watch it, rate it
            1–10, and talk about it.
          </p>
          <div className="mt-8 rounded-xl border border-border bg-surface p-8">
            <p className="text-foreground/60">
              No movie has been picked for this month yet.
            </p>
            {user && (
              <a
                href="/add-movie"
                className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-background transition-colors hover:bg-accent/80"
              >
                Add a Pick
              </a>
            )}
          </div>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="/schedule"
              className="rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              View Schedule
            </a>
            <a
              href="/history"
              className="rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              Browse History
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-foreground/50">
          Movie of the Month
        </h2>
        <MovieHero
          movie={currentPick.movie}
          pick={currentPick.pick}
          picker={currentPick.picker}
          reviewStats={currentPick.reviewStats}
          userReview={currentPick.userReview}
          nextPicker={currentPick.nextPicker}
        />
      </div>
    </main>
  );
}
