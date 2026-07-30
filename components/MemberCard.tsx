import Link from "next/link";
import { PosterImage } from "@/components/PosterImage";
import { formatScore } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import { SCORE_BADGE_TEXT } from "@/lib/ui";
import type { MemberSummary } from "@/types/member-summary";

type MemberCardProps = {
  summary: MemberSummary;
};

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
      {initial}
    </div>
  );
}

export function MemberCard({ summary }: MemberCardProps) {
  const badgeColor = scoreBadgeColor(summary.average_score);
  const hasReviews = summary.review_count > 0;
  const graderDiff = summary.average_score - summary.club_average;

  return (
    <Link
      href={`/profile/${summary.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50"
    >
      {/* Header: avatar + name + badge */}
      <div className="flex items-center gap-3">
        <Avatar name={summary.name} />
        <div className="flex-1">
          <p className="font-medium text-foreground">{summary.name}</p>
          {hasReviews && (
            <p className="text-xs text-foreground/50">
              {summary.review_count} {summary.review_count === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>
        {summary.average_score - summary.club_average >= 1 && (
          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
            Easy Grader
          </span>
        )}
        {summary.club_average - summary.average_score >= 1 && hasReviews && (
          <span className="rounded-full bg-accent-secondary/20 px-2 py-0.5 text-xs font-medium text-accent-secondary">
            Harsh Critic
          </span>
        )}
      </div>

      {/* Score */}
      {hasReviews ? (
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${SCORE_BADGE_TEXT[badgeColor]}`}>
            {formatScore(summary.average_score)}
          </span>
          <span className="text-xs text-foreground/50">
            avg (club: {formatScore(summary.club_average)})
          </span>
        </div>
      ) : (
        <p className="text-sm italic text-foreground/40">No reviews yet</p>
      )}

      {/* Top + worst movies */}
      {hasReviews && summary.top_movie && summary.worst_movie && (
        <div className="grid grid-cols-2 gap-3">
          {/* Top */}
          <div className="flex gap-2">
            <PosterImage
              src={summary.top_movie.poster_url}
              alt={summary.top_movie.title}
              className="h-16 w-11 flex-shrink-0 rounded object-cover"
              fallbackClassName="flex h-16 w-11 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
            />
            <div className="min-w-0">
              <p className="text-xs text-foreground/50">Top</p>
              <p className="truncate text-sm text-foreground">
                {summary.top_movie.title}
              </p>
              <p className="text-xs font-bold text-green-400">
                {formatScore(summary.top_movie.score)}
              </p>
            </div>
          </div>
          {/* Worst */}
          <div className="flex gap-2">
            <PosterImage
              src={summary.worst_movie.poster_url}
              alt={summary.worst_movie.title}
              className="h-16 w-11 flex-shrink-0 rounded object-cover"
              fallbackClassName="flex h-16 w-11 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
            />
            <div className="min-w-0">
              <p className="text-xs text-foreground/50">Worst</p>
              <p className="truncate text-sm text-foreground">
                {summary.worst_movie.title}
              </p>
              <p className="text-xs font-bold text-accent-secondary">
                {formatScore(summary.worst_movie.score)}
              </p>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
