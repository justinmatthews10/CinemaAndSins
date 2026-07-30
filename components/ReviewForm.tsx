"use client";

import { useState } from "react";
import { scoreBadgeColor } from "@/lib/scoring";
import { formatScore } from "@/lib/utils";
import { SCORE_BADGE_BG } from "@/lib/ui";

type ReviewFormProps = {
  initialScore: number;
  initialReviewText: string;
  initialTags: string[];
  locked: boolean;
  onSubmit: (data: { score: number; reviewText: string; tags: string[] }) => void;
};

const TAGS = [
  { value: "rewatch", label: "Rewatch" },
  { value: "first time", label: "First Time" },
];

export function ReviewForm({
  initialScore,
  initialReviewText,
  initialTags,
  locked,
  onSubmit,
}: ReviewFormProps) {
  const [score, setScore] = useState(initialScore);
  const [reviewText, setReviewText] = useState(initialReviewText);
  const [tags, setTags] = useState<string[]>(initialTags);

  const badgeColor = scoreBadgeColor(score);
  const isEditing = initialReviewText.length > 0;

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ score, reviewText, tags });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Score slider */}
      <div>
        <label className="mb-2 block text-sm font-medium">Score</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value))}
            disabled={locked}
            className="flex-1 accent-accent"
          />
          <span
            className={`flex h-12 w-14 flex-shrink-0 items-center justify-center rounded-lg text-lg font-bold ${SCORE_BADGE_BG[badgeColor]}`}
          >
            {formatScore(score)}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block text-sm font-medium">Tags (optional)</label>
        <div className="flex flex-wrap gap-3">
          {TAGS.map((tag) => (
            <label
              key={tag.value}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/5"
            >
              <input
                type="checkbox"
                checked={tags.includes(tag.value)}
                onChange={() => toggleTag(tag.value)}
                disabled={locked}
                className="accent-accent"
              />
              {tag.label}
            </label>
          ))}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label htmlFor="review-text" className="mb-2 block text-sm font-medium">
          Review (markdown supported)
        </label>
        <textarea
          id="review-text"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          disabled={locked}
          rows={8}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none disabled:opacity-50"
          placeholder="Share your thoughts on the movie..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={locked}
        className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-background transition-colors hover:bg-accent/80 disabled:opacity-50"
      >
        {locked ? "Locked" : isEditing ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}
