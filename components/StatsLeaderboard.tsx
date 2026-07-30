import Link from "next/link";
import { PosterImage } from "@/components/PosterImage";
import { formatScore } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import { SCORE_BADGE_TEXT } from "@/lib/ui";
import type { LeaderboardEntry } from "@/lib/stats-aggregate";

type StatsLeaderboardProps = {
  top: LeaderboardEntry[];
  bottom: LeaderboardEntry[];
};

function LeaderboardColumn({
  title,
  entries,
  accentClass,
}: {
  title: string;
  entries: LeaderboardEntry[];
  accentClass: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-medium uppercase tracking-wide ${accentClass}`}>
        {title}
      </h3>
      {entries.length > 0 ? (
        entries.map((entry) => {
          const badgeColor = scoreBadgeColor(entry.average);
          return (
            <Link
              key={entry.movie_id}
              href={`/movies/${entry.movie_id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent/50"
            >
              <PosterImage
                src={entry.poster_url}
                alt={entry.title}
                className="h-16 w-11 flex-shrink-0 rounded object-cover"
                fallbackClassName="flex h-16 w-11 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{entry.title}</p>
                <p className="text-xs text-foreground/50">{entry.reviewCount} reviews</p>
              </div>
              <span className={`text-xl font-bold ${SCORE_BADGE_TEXT[badgeColor]}`}>
                {formatScore(entry.average)}
              </span>
            </Link>
          );
        })
      ) : (
        <p className="text-sm italic text-foreground/40">
          Need at least 3 reviews per movie.
        </p>
      )}
    </div>
  );
}

export function StatsLeaderboard({ top, bottom }: StatsLeaderboardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <LeaderboardColumn
        title="Highest Rated"
        entries={top}
        accentClass="text-cyan-400"
      />
      <LeaderboardColumn
        title="Lowest Rated"
        entries={bottom}
        accentClass="text-accent-secondary"
      />
    </div>
  );
}
