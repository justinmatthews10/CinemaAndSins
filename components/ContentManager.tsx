"use client";

import { useState } from "react";
import { PosterImage } from "@/components/PosterImage";
import { formatScore } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import { SCORE_BADGE_BG } from "@/lib/ui";

export type AdminMovie = {
  id: string;
  title: string;
  year: number | null;
  poster_url: string | null;
  review_count: number;
};

export type AdminReview = {
  id: string;
  score: number;
  review_text: string | null;
  member_name: string;
  movie_title: string;
  pick_id: string;
};

type ContentManagerProps = {
  movies: AdminMovie[];
  reviews: AdminReview[];
  onDeleteMovie: (movieId: string) => void;
  onDeleteReview: (reviewId: string) => void;
};

type Tab = "movies" | "reviews";

export function ContentManager({
  movies,
  reviews,
  onDeleteMovie,
  onDeleteReview,
}: ContentManagerProps) {
  const [tab, setTab] = useState<Tab>("movies");

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("movies")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === "movies" ? "bg-accent text-background" : "border border-border text-foreground/60 hover:bg-foreground/5"}`}
        >
          Movies ({movies.length})
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === "reviews" ? "bg-accent text-background" : "border border-border text-foreground/60 hover:bg-foreground/5"}`}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {/* Movies tab */}
      {tab === "movies" && (
        <div className="space-y-3">
          {movies.length === 0 ? (
            <p className="text-sm italic text-foreground/40">No movies yet.</p>
          ) : (
            movies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"
              >
                <PosterImage
                  src={movie.poster_url}
                  alt={movie.title}
                  className="h-16 w-11 flex-shrink-0 rounded object-cover"
                  fallbackClassName="flex h-16 w-11 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{movie.title}</p>
                  <p className="text-xs text-foreground/50">
                    {movie.year ?? "—"} · {movie.review_count} reviews
                  </p>
                </div>
                <button
                  onClick={() => onDeleteMovie(movie.id)}
                  className="rounded border border-accent-secondary/40 px-3 py-1.5 text-sm text-accent-secondary transition-colors hover:bg-accent-secondary/10"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviews tab */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm italic text-foreground/40">No reviews yet.</p>
          ) : (
            reviews.map((review) => {
              const badgeColor = scoreBadgeColor(review.score);
              return (
                <div
                  key={review.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4"
                >
                  <span
                    className={`flex h-8 w-10 flex-shrink-0 items-center justify-center rounded text-sm font-bold ${SCORE_BADGE_BG[badgeColor]}`}
                  >
                    {formatScore(review.score)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {review.member_name} on {review.movie_title}
                    </p>
                    {review.review_text && (
                      <p className="mt-1 line-clamp-2 text-sm text-foreground/70">
                        {review.review_text}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteReview(review.id)}
                    className="rounded border border-accent-secondary/40 px-3 py-1.5 text-sm text-accent-secondary transition-colors hover:bg-accent-secondary/10"
                  >
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
