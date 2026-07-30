import { createClient } from "@/lib/supabase/server";
import type { Pick } from "@/types/pick";
import type { Movie } from "@/types/movie";
import type { Member } from "@/types/member";
import type { RotationEntry } from "@/types/rotation";
import { getAssignedPicker } from "@/lib/supabase/picks";
import { getActiveRotation } from "@/lib/rotation";

export type ScheduleSlot = {
  month: number;
  year: number;
  picker: Member;
  pick: Pick | null;
  movie: Movie | null;
  status: "not_picked" | "movie_selected" | "locked";
};

export type ScheduleData = {
  upcoming: ScheduleSlot[];
  past: ScheduleSlot[];
};

export async function getSchedule(): Promise<ScheduleData> {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [{ data: rotationData }, { data: membersData }, { data: picksData }] =
    await Promise.all([
      supabase.from("rotation").select("*").order("order_index"),
      supabase.from("members").select("*"),
      supabase.from("picks").select("*").order("created_at"),
    ]);

  const rotation = (rotationData ?? []) as RotationEntry[];
  const members = (membersData ?? []) as Member[];
  const allPicks = (picksData ?? []) as Pick[];

  const active = getActiveRotation(rotation);
  if (active.length === 0) {
    return { upcoming: [], past: [] };
  }

  // Fetch movies for all existing picks
  const movieIds = allPicks.map((p) => p.movie_id);
  const movieMap = new Map<string, Movie>();
  if (movieIds.length > 0) {
    const { data: moviesData } = await supabase
      .from("movies")
      .select("*")
      .in("id", movieIds);
    for (const m of moviesData ?? []) {
      movieMap.set(m.id, m as Movie);
    }
  }

  // Determine how many months to show: full rotation cycle, min 12
  const monthsToShow = Math.max(12, active.length);
  const upcoming: ScheduleSlot[] = [];
  const past: ScheduleSlot[] = [];

  // Past months: from earliest pick to current month - 1
  const earliestPick =
    allPicks.length > 0
      ? allPicks.reduce((e, p) =>
          p.year < e.year || (p.year === e.year && p.month < e.month) ? p : e,
        )
      : null;

  if (earliestPick) {
    // Show past months from earliest pick to current month - 1
    let m = earliestPick.month;
    let y = earliestPick.year;
    while (y < currentYear || (y === currentYear && m < currentMonth)) {
      const slot = buildSlot(m, y, rotation, allPicks, members, movieMap);
      if (slot.picker) past.push(slot);
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
  }

  // Upcoming months: current month through monthsToShow ahead
  for (let i = 0; i < monthsToShow; i++) {
    const d = new Date(currentYear, currentMonth - 1 + i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const slot = buildSlot(m, y, rotation, allPicks, members, movieMap);
    if (slot.picker) upcoming.push(slot);
  }

  return { upcoming, past };
}

function buildSlot(
  month: number,
  year: number,
  rotation: RotationEntry[],
  picks: Pick[],
  members: Member[],
  movieMap: Map<string, Movie>,
): ScheduleSlot {
  const pickerId = getAssignedPicker(rotation, picks, month, year);
  const picker = pickerId ? (members.find((m) => m.id === pickerId) ?? null) : null;

  // If no picker (shouldn't happen if rotation exists), return a slot with a dummy
  if (!picker) {
    // This shouldn't happen, but handle gracefully
    return {
      month,
      year,
      picker: members[0] ?? ({} as Member),
      pick: null,
      movie: null,
      status: "not_picked",
    };
  }

  const pick = picks.find((p) => p.month === month && p.year === year) ?? null;
  const movie = pick ? (movieMap.get(pick.movie_id) ?? null) : null;

  let status: ScheduleSlot["status"] = "not_picked";
  if (pick) {
    status = pick.status === "locked" ? "locked" : "movie_selected";
  }

  return { month, year, picker, pick, movie, status };
}
