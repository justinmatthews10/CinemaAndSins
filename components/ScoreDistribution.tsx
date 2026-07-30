import { scoreDistribution } from "@/lib/scoring";
import type { Review } from "@/types/review";

type ScoreDistributionProps = {
  reviews: Review[];
};

const BUCKET_COLORS: Record<number, string> = {
  10: "bg-cyan-500",
  9: "bg-cyan-500",
  8: "bg-green-500",
  7: "bg-green-500",
  6: "bg-yellow-500",
  5: "bg-yellow-500",
  4: "bg-accent-secondary",
  3: "bg-accent-secondary",
  2: "bg-accent-secondary",
  1: "bg-accent-secondary",
};

export function ScoreDistribution({ reviews }: ScoreDistributionProps) {
  if (reviews.length === 0) {
    return <p className="text-sm text-foreground/50">No reviews yet</p>;
  }

  const dist = scoreDistribution(reviews);
  const maxCount = Math.max(...Object.values(dist));
  const activeBuckets = Object.entries(dist)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => Number(b) - Number(a));

  return (
    <div className="space-y-2">
      {activeBuckets.map(([scoreStr, count]) => {
        const score = Number(scoreStr);
        const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div key={scoreStr} className="flex items-center gap-3">
            <span className="w-8 text-right text-sm font-medium text-foreground/70">
              {score}
            </span>
            <div className="flex-1 overflow-hidden rounded-full bg-foreground/5">
              <div
                className={`h-6 rounded-full ${BUCKET_COLORS[score] ?? "bg-foreground/30"} transition-all`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-6 text-sm text-foreground/60">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
