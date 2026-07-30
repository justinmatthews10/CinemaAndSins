import { getMovieDetail } from "@/lib/supabase/getMovieDetail";
import { PosterImage } from "@/components/PosterImage";
import { PageHeading } from "@/components/PageHeading";
import { ReviewsSection } from "@/components/ReviewsSection";
import { formatScore } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const BADGE_COLORS: Record<string, string> = {
  gold: "text-accent",
  green: "text-green-400",
  yellow: "text-yellow-400",
  red: "text-accent-secondary",
};

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMovieDetail(id);

  if (!data) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-24">
        <div className="w-full max-w-md text-center">
          <PageHeading centered className="mb-4">
            Movie Not Found
          </PageHeading>
          <Link href="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const { movie, pick, picker, reviews, averageScore, isDivisive } = data;
  const badgeColor = scoreBadgeColor(averageScore);
  const monthName = new Date(pick.year, pick.month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        {/* Movie header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row">
          <PosterImage
            src={movie.poster_url}
            alt={movie.title}
            className="h-72 w-48 flex-shrink-0 rounded-lg object-cover"
            fallbackClassName="flex h-72 w-48 flex-shrink-0 items-center justify-center rounded-lg bg-foreground/10 text-sm text-foreground/40"
          />

          <div className="flex flex-1 flex-col gap-4">
            <div>
              <PageHeading className="mb-1">{movie.title}</PageHeading>
              {movie.year && <p className="text-lg text-foreground/60">{movie.year}</p>}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
              {movie.director && <span>Directed by {movie.director}</span>}
              {movie.runtime && <span>{movie.runtime} min</span>}
              {movie.genres.length > 0 && <span>{movie.genres.join(", ")}</span>}
            </div>

            <p className="text-sm text-foreground/60">
              Picked by{" "}
              <span className="font-medium text-foreground/80">{picker.name}</span> in{" "}
              {monthName}
            </p>

            {movie.synopsis && (
              <p className="text-sm text-foreground/70">{movie.synopsis}</p>
            )}

            {/* Average score */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/50">
                    Average
                  </p>
                  <p className={`text-3xl font-bold ${BADGE_COLORS[badgeColor]}`}>
                    {formatScore(averageScore)}
                  </p>
                </div>
                <p className="text-sm text-foreground/50">
                  from {reviews.length} {reviews.length === 1 ? "reviewer" : "reviewers"}
                </p>
                {isDivisive && (
                  <span className="rounded-full bg-accent-secondary/20 px-3 py-1 text-xs font-medium text-accent-secondary">
                    🔥 Hot Takes
                  </span>
                )}
              </div>
            )}

            {pick.watch_date && (
              <p className="text-sm text-foreground/60">
                Watch by {formatDate(pick.watch_date)}
              </p>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <ReviewsSection reviews={reviews} />
      </div>
    </main>
  );
}
