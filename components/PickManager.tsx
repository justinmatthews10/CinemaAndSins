"use client";

import { PosterImage } from "@/components/PosterImage";
import { formatMonthYear } from "@/lib/utils";
import type { PickStatus } from "@/types/pick";

export type PickWithMovie = {
  id: string;
  movie_id: string;
  picker_member_id: string;
  picker_name: string;
  month: number;
  year: number;
  watch_date: string | null;
  status: PickStatus;
  movie_title: string;
  movie_poster_url: string | null;
};

type PickManagerProps = {
  picks: PickWithMovie[];
  onLock: (pickId: string) => void;
  onUnlock: (pickId: string) => void;
};

export function PickManager({ picks, onLock, onUnlock }: PickManagerProps) {
  if (picks.length === 0) {
    return <p className="text-sm italic text-foreground/40">No picks yet.</p>;
  }

  const sorted = [...picks].sort((a, b) => b.year - a.year || b.month - a.month);

  return (
    <div className="space-y-3">
      {sorted.map((pick) => (
        <div
          key={pick.id}
          className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"
        >
          <PosterImage
            src={pick.movie_poster_url}
            alt={pick.movie_title}
            className="h-16 w-11 flex-shrink-0 rounded object-cover"
            fallbackClassName="flex h-16 w-11 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
          />
          <div className="flex-1">
            <p className="font-medium text-foreground">{pick.movie_title}</p>
            <p className="text-xs text-foreground/50">
              {formatMonthYear(pick.month, pick.year)} · Picked by {pick.picker_name}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                pick.status === "locked"
                  ? "bg-foreground/10 text-foreground/50"
                  : pick.status === "current"
                    ? "bg-accent/20 text-accent"
                    : "bg-foreground/5 text-foreground/40"
              }`}
            >
              {pick.status}
            </span>
          </div>
          {pick.status === "locked" ? (
            <button
              onClick={() => onUnlock(pick.id)}
              className="rounded border border-border px-4 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/5"
            >
              Unlock
            </button>
          ) : (
            <button
              onClick={() => onLock(pick.id)}
              className="rounded border border-border px-4 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/5"
            >
              Lock
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
