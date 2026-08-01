import type { RotationEntry } from "@/types/rotation";
import type { Pick } from "@/types/pick";
import type { TmdbMovieDetails } from "@/types/movie";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getActiveRotation } from "@/lib/rotation";

type MovieInput =
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

/**
 * Finds an existing movie by tmdb_id, or creates a new record.
 * Used by both createMovieAndPick and updatePick.
 */
async function findOrCreateMovie(
  supabase: SupabaseClient,
  movie: MovieInput,
): Promise<string> {
  if (movie.tmdb_id) {
    const { data: existing } = await supabase
      .from("movies")
      .select("id")
      .eq("tmdb_id", movie.tmdb_id)
      .maybeSingle();

    if (existing) return existing.id;
  }

  const { data: newMovie, error } = await supabase
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

  if (error) throw error;
  return newMovie!.id;
}

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
  const active = getActiveRotation(rotation);

  if (active.length === 0) return null;

  // If no picks exist yet, use the current month as the anchor point.
  // The first active member picks for the current month, and we advance
  // by the month offset so each future month gets the next person.
  if (picks.length === 0) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthsSinceNow = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
    const offset = ((monthsSinceNow % active.length) + active.length) % active.length;
    return active[offset].member_id;
  }

  // Find the latest pick as the anchor (most recent by month/year).
  // Using the latest pick instead of the earliest ensures that manually
  // added historical past picks (which may not follow rotation order)
  // don't shift the anchor and break future month assignments.
  const latestPick = picks.reduce((latest, p) => {
    if (p.year > latest.year || (p.year === latest.year && p.month > latest.month)) {
      return p;
    }
    return latest;
  }, picks[0]);

  // Find the anchor picker's position in the active rotation
  const anchorPickerIndex = active.findIndex(
    (r) => r.member_id === latestPick.picker_member_id,
  );

  // If the anchor picker is no longer in the active rotation, fall back to
  // counting months from the anchor and using that as the offset directly
  if (anchorPickerIndex === -1) {
    const monthsSinceAnchor = monthsBetween(
      latestPick.month,
      latestPick.year,
      targetMonth,
      targetYear,
    );
    const offset = ((monthsSinceAnchor % active.length) + active.length) % active.length;
    return active[offset].member_id;
  }

  // Calculate months between anchor and target
  const monthsSinceAnchor = monthsBetween(
    latestPick.month,
    latestPick.year,
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
    movie: MovieInput;
    pickerMemberId: string;
    month: number;
    year: number;
    watchDate: string | null;
    pickerNote: string | null;
    status?: "upcoming" | "current" | "locked";
  },
): Promise<{ movieId: string; pickId: string }> {
  const {
    movie,
    pickerMemberId,
    month,
    year,
    watchDate,
    pickerNote,
    status = "upcoming",
  } = params;

  const movieId = await findOrCreateMovie(supabase, movie);

  const { data: pick, error: pickError } = await supabase
    .from("picks")
    .insert({
      movie_id: movieId,
      picker_member_id: pickerMemberId,
      month,
      year,
      watch_date: watchDate,
      picker_note: pickerNote,
      status,
    })
    .select("id")
    .single();

  if (pickError) throw pickError;

  return { movieId, pickId: pick.id };
}

/**
 * Updates an existing pick with a new movie, watch date, and picker note.
 * Creates the movie record if it doesn't already exist.
 */
export async function updatePick(
  supabase: SupabaseClient,
  params: {
    pickId: string;
    movie: MovieInput;
    watchDate: string | null;
    pickerNote: string | null;
  },
): Promise<{ movieId: string }> {
  const { pickId, movie, watchDate, pickerNote } = params;

  const movieId = await findOrCreateMovie(supabase, movie);

  const { error: pickError } = await supabase
    .from("picks")
    .update({
      movie_id: movieId,
      watch_date: watchDate,
      picker_note: pickerNote,
    })
    .eq("id", pickId);

  if (pickError) throw pickError;

  return { movieId };
}

/**
 * Deletes a pick by ID.
 */
export async function deletePick(
  supabase: SupabaseClient,
  pickId: string,
): Promise<void> {
  const { error } = await supabase.from("picks").delete().eq("id", pickId);
  if (error) throw error;
}
