"use client";

import { useState } from "react";
import Link from "next/link";
import { PosterImage } from "@/components/PosterImage";
import { formatScore, formatDate } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import { SCORE_BADGE_BG } from "@/lib/ui";

type ReviewItem = {
  id: string;
  score: number;
  review_text: string | null;
  tags: string[] | null;
  created_at: string;
  movie_id: string;
  movie_title: string;
  movie_year: number | null;
  movie_poster_url: string | null;
};

type ProfileReviewHistoryProps = {
  reviews: ReviewItem[];
};

type SortMode = "score" | "date";

export function ProfileReviewHistory({ reviews }: ProfileReviewHistoryProps) {
  const [sortMode, setSortMode] = useState<SortMode>("date");

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-foreground/50">No reviews yet.</p>
      </div>
    );
  }

  const sorted = [...reviews].sort((a, b) => {
    if (sortMode === "score") return b.score - a.score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-foreground/50">
          Sort by
        </span>
        <button
          onClick={() => setSortMode("date")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${sortMode === "date" ? "bg-accent text-background" : "border border-border text-foreground/60 hover:bg-foreground/5"}`}
        >
          Date
        </button>
        <button
          onClick={() => setSortMode("score")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${sortMode === "score" ? "bg-accent text-background" : "border border-border text-foreground/60 hover:bg-foreground/5"}`}
        >
          Score
        </button>
      </div>

      {/* Review list */}
      <div className="space-y-3">
        {sorted.map((review) => {
          const badgeColor = scoreBadgeColor(review.score);
          return (
            <Link
              key={review.id}
              href={`/movies/${review.movie_id}`}
              className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50"
            >
              <PosterImage
                src={review.movie_poster_url}
                alt={review.movie_title}
                className="h-20 w-14 flex-shrink-0 rounded object-cover"
                fallbackClassName="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-foreground">{review.movie_title}</p>
                  {review.movie_year && (
                    <p className="text-xs text-foreground/40">{review.movie_year}</p>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <span
                    className={`flex h-8 w-10 items-center justify-center rounded text-sm font-bold ${SCORE_BADGE_BG[badgeColor]}`}
                  >
                    {formatScore(review.score)}
                  </span>
                  <span className="text-xs text-foreground/40">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                {review.review_text && (
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                    {review.review_text}
                  </p>
                )}
                {review.tags && review.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-foreground/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
