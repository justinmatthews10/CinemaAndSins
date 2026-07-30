import { formatScore } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import { SCORE_BADGE_TEXT } from "@/lib/ui";
import type { TimePoint } from "@/lib/stats-aggregate";

type StatsTrendChartProps = {
  points: TimePoint[];
};

export function StatsTrendChart({ points }: StatsTrendChartProps) {
  if (points.length === 0) {
    return <p className="text-sm italic text-foreground/40">No reviewed months yet.</p>;
  }

  const maxAvg = Math.max(...points.map((p) => p.average), 10);
  const minAvg = Math.min(...points.map((p) => p.average), 0);
  const range = maxAvg - minAvg || 1;

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2">
      {points.map((point) => {
        const badgeColor = scoreBadgeColor(point.average);
        const heightPct = ((point.average - minAvg) / range) * 100;
        return (
          <div key={point.label} className="flex min-w-24 flex-col items-center gap-2">
            <span className={`text-sm font-bold ${SCORE_BADGE_TEXT[badgeColor]}`}>
              {formatScore(point.average)}
            </span>
            <div className="flex h-32 w-full items-end rounded bg-foreground/5">
              <div
                className="w-full rounded-t bg-accent/40 transition-all"
                style={{ height: `${Math.max(heightPct, 5)}%` }}
              />
            </div>
            <span className="text-xs text-foreground/50">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
