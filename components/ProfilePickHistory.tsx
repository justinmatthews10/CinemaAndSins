import Link from "next/link";
import { PosterImage } from "@/components/PosterImage";
import { formatMonthYear } from "@/lib/utils";

type ProfilePickHistoryProps = {
  picks: {
    id: string;
    movie_id: string;
    title: string;
    movie_year: number | null;
    poster_url: string | null;
    month: number;
    year: number;
  }[];
};

export function ProfilePickHistory({ picks }: ProfilePickHistoryProps) {
  if (picks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-foreground/50">No picks yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {picks.map((pick) => (
        <Link
          key={pick.id}
          href={`/movies/${pick.movie_id}`}
          className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent/50"
        >
          <PosterImage
            src={pick.poster_url}
            alt={pick.title}
            className="h-20 w-14 flex-shrink-0 rounded object-cover"
            fallbackClassName="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
          />
          <div>
            <p className="font-medium text-foreground">{pick.title}</p>
            {pick.movie_year && (
              <p className="text-sm text-foreground/50">{pick.movie_year}</p>
            )}
            <p className="text-xs text-foreground/40">
              {formatMonthYear(pick.month, pick.year)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
