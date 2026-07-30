import { formatScore } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import { SCORE_BADGE_TEXT } from "@/lib/ui";
import type { GenreStat } from "@/lib/stats-aggregate";

type StatsGenreBreakdownProps = {
  genres: GenreStat[];
};

export function StatsGenreBreakdown({ genres }: StatsGenreBreakdownProps) {
  if (genres.length === 0) {
    return <p className="text-sm italic text-foreground/40">No genres to show yet.</p>;
  }

  const maxCount = Math.max(...genres.map((g) => g.count));

  return (
    <div className="space-y-3">
      {genres.map((g) => {
        const badgeColor = scoreBadgeColor(g.averageScore);
        const barWidth = `${(g.count / maxCount) * 100}%`;
        return (
          <div key={g.genre} className="flex items-center gap-3">
            <div className="w-28 flex-shrink-0 text-sm text-foreground/70">{g.genre}</div>
            <div className="relative h-6 flex-1 overflow-hidden rounded bg-foreground/5">
              <div
                className="flex h-full items-center justify-end rounded bg-accent/30 px-2 transition-all"
                style={{ width: barWidth }}
              >
                <span className="text-xs font-medium text-foreground/60">{g.count}</span>
              </div>
            </div>
            <span
              className={`w-12 text-right text-sm font-bold ${SCORE_BADGE_TEXT[badgeColor]}`}
            >
              {formatScore(g.averageScore)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
