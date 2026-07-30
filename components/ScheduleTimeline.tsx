import Link from "next/link";
import { PosterImage } from "@/components/PosterImage";
import { formatMonthYear } from "@/lib/utils";
import type { ScheduleSlot } from "@/lib/supabase/getSchedule";

type ScheduleTimelineProps = {
  slots: ScheduleSlot[];
  currentUserId: string | null;
  pastSlots: ScheduleSlot[];
};

const STATUS_LABELS: Record<ScheduleSlot["status"], string> = {
  not_picked: "Not picked yet",
  movie_selected: "Movie selected",
  locked: "Locked",
};

const STATUS_COLORS: Record<ScheduleSlot["status"], string> = {
  not_picked: "bg-foreground/10 text-foreground/50",
  movie_selected: "bg-accent/20 text-accent",
  locked: "bg-accent-secondary/20 text-accent-secondary",
};

export function ScheduleTimeline({
  slots,
  currentUserId,
  pastSlots,
}: ScheduleTimelineProps) {
  if (slots.length === 0 && pastSlots.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-foreground/60">No rotation has been set up yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upcoming */}
      {slots.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
            Upcoming
          </h2>
          <div className="space-y-3">
            {slots.map((slot) => {
              // Find the first upcoming slot that is the user's and has no pick.
              // Only that slot gets the "Pick a movie" link — the /add-movie page
              // only works for the user's next assigned month anyway.
              const isFirstUnpicked =
                slot.picker.id === currentUserId &&
                slot.status === "not_picked" &&
                !slots.some(
                  (s) =>
                    s.picker.id === currentUserId &&
                    s.status === "not_picked" &&
                    (s.year < slot.year ||
                      (s.year === slot.year && s.month < slot.month)),
                );
              return (
                <ScheduleSlotRow
                  key={`${slot.month}-${slot.year}`}
                  slot={slot}
                  canPick={isFirstUnpicked}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {pastSlots.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
            History ({pastSlots.length} past {pastSlots.length === 1 ? "pick" : "picks"})
          </h2>
          <div className="space-y-3">
            {pastSlots.map((slot) => (
              <ScheduleSlotRow
                key={`${slot.month}-${slot.year}`}
                slot={slot}
                canPick={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleSlotRow({ slot, canPick }: { slot: ScheduleSlot; canPick: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      {/* Poster or placeholder */}
      {slot.movie ? (
        <Link href={`/movies/${slot.movie.id}`} className="flex-shrink-0">
          <PosterImage
            src={slot.movie.poster_url}
            alt={slot.movie.title}
            className="h-20 w-14 flex-shrink-0 rounded object-cover transition-opacity hover:opacity-80"
            fallbackClassName="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
          />
        </Link>
      ) : (
        <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/30">
          —
        </div>
      )}

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-medium text-foreground">
          {formatMonthYear(slot.month, slot.year)}
        </p>
        <p className="text-sm text-foreground/60">Picked by {slot.picker.name}</p>
        {slot.movie && (
          <Link
            href={`/movies/${slot.movie.id}`}
            className="text-sm text-foreground/80 hover:text-accent hover:underline"
          >
            {slot.movie.title}
          </Link>
        )}
        {slot.pick?.picker_note && (
          <p className="text-xs italic text-foreground/50">
            &ldquo;{slot.pick.picker_note}&rdquo;
          </p>
        )}
      </div>

      {/* Status + action */}
      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[slot.status]}`}
        >
          {STATUS_LABELS[slot.status]}
        </span>
        {canPick && (
          <Link href="/add-movie" className="text-sm text-accent hover:underline">
            Pick a movie →
          </Link>
        )}
      </div>
    </div>
  );
}
