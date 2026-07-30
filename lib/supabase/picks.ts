import type { RotationEntry } from "@/types/rotation";
import type { Pick } from "@/types/pick";
import type { TmdbMovieDetails } from "@/types/movie";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Determines which member is assigned to pick for a given month/year.
 *
 * The rotation is a circular list. We count how many picks exist before
 * the target month (in chronological order), then advance through the
 * active rotation by that count to find the assigned picker.
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

  // Count picks that occurred before the target month/year
  const pastPicks = picks.filter(
    (p) => p.year < targetYear || (p.year === targetYear && p.month < targetMonth),
  );

  const offset = pastPicks.length % active.length;
  return active[offset].member_id;
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
