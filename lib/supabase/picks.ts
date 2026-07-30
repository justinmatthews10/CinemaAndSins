import type { RotationEntry } from "@/types/rotation";
import type { Pick } from "@/types/pick";
import type { TmdbMovieDetails } from "@/types/movie";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Determines which member is assigned to pick for a given month/year.
 *
 * The rotation is a circular list. We use the earliest existing pick as an
 * anchor point: that pick's picker has a known position in the rotation,
 * and we advance by the number of months between the anchor and the target
 * (not the count of picks, which may have gaps).
 *
 * If no picks exist yet, the first active member in the rotation is assigned
 * to the current month.
 */
export function getAssignedPicker(
  rotation: RotationEntry[],
  picks: Pick[],
  targetMonth: number,
  targetYear: number,
): string | null {
  const active = rotation
    .filter((r) => r.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  if (active.length === 0) return null;

  // If no picks exist yet, the first active member picks for the target month
  if (picks.length === 0) {
    return active[0].member_id;
  }

  // Find the earliest pick as the anchor
  const earliestPick = picks.reduce((earliest, p) => {
    if (
      p.year < earliest.year ||
      (p.year === earliest.year && p.month < earliest.month)
    ) {
      return p;
    }
    return earliest;
  }, picks[0]);

  // Find the anchor picker's position in the active rotation
  const anchorPickerIndex = active.findIndex(
    (r) => r.member_id === earliestPick.picker_member_id,
  );

  // If the anchor picker is no longer in the active rotation, fall back to
  // counting months from the anchor and using that as the offset directly
  if (anchorPickerIndex === -1) {
    const monthsSinceAnchor = monthsBetween(
      earliestPick.month,
      earliestPick.year,
      targetMonth,
      targetYear,
    );
    const offset = ((monthsSinceAnchor % active.length) + active.length) % active.length;
    return active[offset].member_id;
  }

  // Calculate months between anchor and target
  const monthsSinceAnchor = monthsBetween(
    earliestPick.month,
    earliestPick.year,
    targetMonth,
    targetYear,
  );

  // Use proper modulo (JS % can return negative for negative operands)
  const offset =
    (((anchorPickerIndex + monthsSinceAnchor) % active.length) + active.length) %
    active.length;
  return active[offset].member_id;
}

/**
 * Calculates the number of months between two month/year points.
 * Returns a positive number if target is after anchor, negative if before.
 */
function monthsBetween(
  anchorMonth: number,
  anchorYear: number,
  targetMonth: number,
  targetYear: number,
): number {
  return (targetYear - anchorYear) * 12 + (targetMonth - anchorMonth);
}

/**
 * Creates a movie record (if it doesn't already exist) and a pick record.
 * Returns the created pick, or throws on error.
 */
export async function createMovieAndPick(
  supabase: SupabaseClient,
  params: {
    movie:
      | TmdbMovieDetails
      | {
          tmdb_id: null;
          title: string;
          year: number | null;
          director: string | null;
          runtime: number | null;
          poster_url: string | null;
          synopsis: string | null;
          genres: string[];
        };
    pickerMemberId: string;
    month: number;
    year: number;
    watchDate: string | null;
    pickerNote: string | null;
  },
): Promise<{ movieId: string; pickId: string }> {
  const { movie, pickerMemberId, month, year, watchDate, pickerNote } = params;

  // Check if movie already exists (by tmdb_id if available)
  let movieId: string;

  if (movie.tmdb_id) {
    const { data: existing } = await supabase
      .from("movies")
      .select("id")
      .eq("tmdb_id", movie.tmdb_id)
      .maybeSingle();

    if (existing) {
      movieId = existing.id;
    }
  }

  // Create movie if not found
  if (!movieId!) {
    const { data: newMovie, error: movieError } = await supabase
      .from("movies")
      .insert({
        tmdb_id: movie.tmdb_id,
        title: movie.title,
        year: movie.year,
        director: movie.director,
        runtime: movie.runtime,
        poster_url: movie.poster_url,
        synopsis: movie.synopsis,
        genres: movie.genres,
      })
      .select("id")
      .single();

    if (movieError) throw movieError;
    movieId = newMovie!.id;
  }

  // Create the pick
  const { data: pick, error: pickError } = await supabase
    .from("picks")
    .insert({
      movie_id: movieId,
      picker_member_id: pickerMemberId,
      month,
      year,
      watch_date: watchDate,
      picker_note: pickerNote,
      status: "upcoming",
    })
    .select("id")
    .single();

  if (pickError) throw pickError;

  return { movieId, pickId: pick.id };
}
