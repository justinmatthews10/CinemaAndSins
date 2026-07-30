"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/ReviewCard";
import { ScoreDistribution } from "@/components/ScoreDistribution";
import type { Review } from "@/types/review";
import type { Member } from "@/types/member";

type ReviewsSectionProps = {
  reviews: (Review & { member: Member })[];
};

type SortMode = "score" | "name";

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [sortMode, setSortMode] = useState<SortMode>("score");

  const sorted = [...reviews].sort((a, b) => {
    if (sortMode === "score") return b.score - a.score;
    return a.member.name.localeCompare(b.member.name);
  });

  return (
    <div className="space-y-6">
      {/* Score distribution */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-foreground/50">
          Score Distribution
        </h3>
        <ScoreDistribution reviews={reviews} />
      </div>

      {/* Sort controls + reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
              Reviews ({reviews.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSortMode("score")}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${sortMode === "score" ? "bg-accent text-background" : "border border-border text-foreground/60 hover:bg-foreground/5"}`}
              >
                By Score
              </button>
              <button
                onClick={() => setSortMode("name")}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${sortMode === "name" ? "bg-accent text-background" : "border border-border text-foreground/60 hover:bg-foreground/5"}`}
              >
                By Name
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sorted.map((review) => (
              <ReviewCard key={review.id} review={review} member={review.member} />
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-foreground/60">No reviews yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
