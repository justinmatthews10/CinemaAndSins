import { getCurrentPick } from "@/lib/supabase/getCurrentPick";
import { createClient } from "@/lib/supabase/server";
import { MovieHero } from "@/components/MovieHero";
import { secondaryLinkClass } from "@/lib/ui";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = await getCurrentPick(user?.id ?? null);

  // No pick yet — show who's turn it is
  if (!data.pick || !data.movie || !data.picker) {
    const monthName = new Date(data.year, data.month - 1).toLocaleDateString("en-US", {
      month: "long",
    });

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
            {data.assignedPicker ? (
              <>
                <p className="text-sm uppercase tracking-wide text-foreground/50">
                  {monthName} {data.year}
                </p>
                <p className="mt-2 text-lg text-foreground">
                  It&apos;s{" "}
                  <span className="font-bold text-accent">
                    {data.assignedPicker.name}
                  </span>
                  &apos;s turn to pick
                </p>
                <p className="mt-1 text-sm text-foreground/60">
                  No movie has been picked yet.
                </p>
                {user && data.assignedPicker.id === user.id && (
                  <a
                    href="/add-movie"
                    className="mt-4 inline-block rounded-full bg-accent px-6 py-3 font-medium text-background transition-colors hover:bg-accent/80"
                  >
                    Pick a Movie
                  </a>
                )}
              </>
            ) : (
              <p className="text-foreground/60">No rotation has been set up yet.</p>
            )}
          </div>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a href="/schedule" className={secondaryLinkClass}>
              View Schedule
            </a>
            <a href="/history" className={secondaryLinkClass}>
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
          movie={data.movie}
          pick={data.pick}
          picker={data.picker}
          reviewStats={data.reviewStats}
          userReview={data.userReview}
          nextPicker={data.nextPicker}
        />
      </div>
    </main>
  );
}
