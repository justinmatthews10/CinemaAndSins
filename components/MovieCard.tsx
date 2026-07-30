import Link from "next/link";
import { PosterImage } from "@/components/PosterImage";
import { formatScore, formatMonthYear } from "@/lib/utils";
import { scoreBadgeColor } from "@/lib/scoring";
import { SCORE_BADGE_TEXT } from "@/lib/ui";
import { DIVISIVE_MIN_REVIEWS } from "@/types/history";
import type { HistoryEntry } from "@/types/history";

type MovieCardProps = {
  entry: HistoryEntry;
};

const DIVISIVE_THRESHOLD = 4;

export function MovieCard({ entry }: MovieCardProps) {
  const badgeColor = scoreBadgeColor(entry.average_score);
  const isDivisive =
    entry.review_count >= DIVISIVE_MIN_REVIEWS &&
    entry.score_variance > DIVISIVE_THRESHOLD;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50">
      {/* Poster */}
      <Link href={`/movies/${entry.movie_id}`} className="block">
        <div className="aspect-[2/3] overflow-hidden">
          <PosterImage
            src={entry.poster_url}
            alt={entry.title}
            className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
            fallbackClassName="flex h-full w-full items-center justify-center bg-foreground/10 text-xs text-foreground/40"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/movies/${entry.movie_id}`} className="hover:opacity-80">
          <h3 className="font-medium text-foreground">{entry.title}</h3>
          {entry.year && <p className="text-sm text-foreground/50">{entry.year}</p>}
        </Link>

        {entry.genres.length > 0 && (
          <p className="text-xs text-foreground/40">{entry.genres.join(", ")}</p>
        )}

        {/* Score + reviews */}
        {entry.review_count > 0 ? (
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${SCORE_BADGE_TEXT[badgeColor]}`}>
              {formatScore(entry.average_score)}
            </span>
            <span className="text-xs text-foreground/50">
              {entry.review_count} {entry.review_count === 1 ? "review" : "reviews"}
            </span>
            {isDivisive && (
              <span className="rounded-full bg-accent-secondary/20 px-2 py-0.5 text-xs font-medium text-accent-secondary">
                Hot Takes
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs italic text-foreground/40">No reviews yet</p>
        )}

        {/* Picker */}
        <p className="mt-auto text-xs text-foreground/50">
          Picked by{" "}
          <Link
            href={`/profile/${entry.picker_id}`}
            className="text-foreground/60 hover:text-accent hover:underline"
          >
            {entry.picker_name}
          </Link>{" "}
          · {formatMonthYear(entry.pick_month, entry.pick_year)}
        </p>
      </div>
    </div>
  );
}
