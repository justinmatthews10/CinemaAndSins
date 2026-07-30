import { scoreBadgeColor } from "@/lib/scoring";
import { formatScore } from "@/lib/utils";
import type { Review } from "@/types/review";
import type { Member } from "@/types/member";

type ReviewCardProps = {
  review: Review;
  member: Member;
};

const BADGE_COLORS: Record<string, string> = {
  gold: "bg-accent/20 text-accent",
  green: "bg-green-500/20 text-green-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  red: "bg-accent-secondary/20 text-accent-secondary",
};

export function ReviewCard({ review, member }: ReviewCardProps) {
  const badgeColor = scoreBadgeColor(review.score);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-4">
        {/* Score badge */}
        <span
          className={`flex h-12 w-14 flex-shrink-0 items-center justify-center rounded-lg text-lg font-bold ${BADGE_COLORS[badgeColor]}`}
        >
          {formatScore(review.score)}
        </span>

        {/* Review content */}
        <div className="flex-1">
          <p className="font-medium text-foreground">{member.name}</p>
          {review.review_text ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
              {review.review_text}
            </p>
          ) : (
            <p className="mt-2 text-sm italic text-foreground/40">No written review</p>
          )}
          {review.tags && review.tags.length > 0 && (
            <div className="mt-3 flex gap-2">
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
      </div>
    </div>
  );
}
