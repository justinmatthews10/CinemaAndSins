"use client";

import Link from "next/link";
import type { Movie } from "@/types/movie";
import type { Pick } from "@/types/pick";
import type { Member } from "@/types/member";

type MovieHeroProps = {
  movie: Movie;
  pick: Pick;
  picker: Member;
  reviewStats: { reviewed: number; total: number };
  userReview: { score: number; review_text: string | null } | null;
  nextPicker: Member | null;
};

function getDaysLeft(watchDate: string | null): number | null {
  if (!watchDate) return null;
  const target = new Date(watchDate + "T23:59:59");
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function MovieHero({
  movie,
  pick,
  picker,
  reviewStats,
  userReview,
  nextPicker,
}: MovieHeroProps) {
  const daysLeft = getDaysLeft(pick.watch_date);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-col md:flex-row">
        {/* Poster */}
        <div className="flex-shrink-0">
          {movie.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="h-full w-full object-cover md:h-auto md:w-64"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-foreground/10 md:w-64">
              <span className="text-sm text-foreground/40">No poster</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
              {movie.title}
            </h1>
            {movie.year && (
              <p className="mt-1 text-lg text-foreground/60">{movie.year}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
            {movie.director && <span>Directed by {movie.director}</span>}
            {movie.runtime && <span>{movie.runtime} min</span>}
            {movie.genres.length > 0 && <span>{movie.genres.join(", ")}</span>}
          </div>

          {/* Picked by badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">
              Picked by {picker.name}
            </span>
            {pick.picker_note && (
              <span className="text-sm italic text-foreground/60">
                &ldquo;{pick.picker_note}&rdquo;
              </span>
            )}
          </div>

          {/* Synopsis */}
          {movie.synopsis && (
            <p className="text-sm text-foreground/70">{movie.synopsis}</p>
          )}

          {/* Watch date + countdown */}
          {pick.watch_date && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-foreground/60">Watch by:</span>
              <span className="font-medium text-foreground">
                {new Date(pick.watch_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {daysLeft !== null && daysLeft > 0 && (
                <span className="rounded-full bg-accent-secondary/20 px-2 py-0.5 text-xs font-medium text-accent-secondary">
                  {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                </span>
              )}
            </div>
          )}

          {/* Review stats */}
          <div className="flex items-center gap-4 text-sm text-foreground/70">
            <span>
              {reviewStats.reviewed} of {reviewStats.total} reviewed
            </span>
          </div>

          {/* User review status */}
          {userReview ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-foreground/60">Your rating:</span>
              <span className="font-bold text-accent">{userReview.score}/10</span>
            </div>
          ) : (
            <Link
              href={`/review/${pick.id}`}
              className="text-sm text-accent hover:underline"
            >
              You haven&apos;t reviewed this yet →
            </Link>
          )}

          {/* Next picker teaser */}
          {nextPicker && (
            <div className="mt-2 border-t border-border pt-4 text-sm text-foreground/60">
              Next month:{" "}
              <span className="font-medium text-foreground/80">{nextPicker.name}</span>{" "}
              picks
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
