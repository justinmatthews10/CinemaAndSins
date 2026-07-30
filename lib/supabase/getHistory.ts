import { createClient } from "@/lib/supabase/server";
import type { HistoryEntry, HistoryData } from "@/types/history";

export type { HistoryEntry, HistoryData };
export { DIVISIVE_MIN_REVIEWS } from "@/types/history";

export async function getHistory(): Promise<HistoryData> {
  const supabase = await createClient();

  // Fetch all picks that have a movie selected, ordered newest first
  const { data: picksData } = await supabase
    .from("picks")
    .select("id, movie_id, picker_member_id, month, year, status, watch_date")
    .not("movie_id", "is", null)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (!picksData || picksData.length === 0) {
    return { entries: [], pickers: [], genres: [] };
  }

  const movieIds = picksData.map((p) => p.movie_id!);
  const pickerIds = [...new Set(picksData.map((p) => p.picker_member_id))];

  // Fetch movies, pickers, and reviews in parallel
  const [{ data: moviesData }, { data: membersData }, { data: reviewsData }] =
    await Promise.all([
      supabase.from("movies").select("*").in("id", movieIds),
      supabase.from("members").select("*").in("id", pickerIds),
      supabase
        .from("reviews")
        .select("pick_id, score")
        .in(
          "pick_id",
          picksData.map((p) => p.id),
        ),
    ]);

  const movies = moviesData ?? [];
  const members = membersData ?? [];
  const reviews = reviewsData ?? [];

  // Build lookup maps
  const movieMap = new Map(movies.map((m) => [m.id, m]));
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const reviewsByPick = new Map<string, number[]>();
  for (const r of reviews) {
    const arr = reviewsByPick.get(r.pick_id) ?? [];
    arr.push(r.score);
    reviewsByPick.set(r.pick_id, arr);
  }

  // Build entries
  const entries: HistoryEntry[] = [];
  const pickers = new Set<string>();
  const genres = new Set<string>();

  for (const pick of picksData) {
    const movie = movieMap.get(pick.movie_id!);
    if (!movie) continue;

    const picker = memberMap.get(pick.picker_member_id);
    if (!picker) continue;

    const scores = reviewsByPick.get(pick.id) ?? [];
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const variance =
      scores.length > 1
        ? scores.reduce((acc, s) => acc + Math.pow(s - averageScore, 2), 0) /
          scores.length
        : 0;

    entries.push({
      movie_id: movie.id,
      title: movie.title,
      year: movie.year,
      poster_url: movie.poster_url,
      genres: movie.genres ?? [],
      picker_id: picker.id,
      picker_name: picker.name,
      pick_month: pick.month,
      pick_year: pick.year,
      average_score: averageScore,
      review_count: scores.length,
      score_variance: variance,
    });

    pickers.add(picker.name);
    for (const g of movie.genres ?? []) {
      genres.add(g);
    }
  }

  return {
    entries,
    pickers: [...pickers].sort(),
    genres: [...genres].sort(),
  };
}
