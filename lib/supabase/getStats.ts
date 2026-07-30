import { createClient } from "@/lib/supabase/server";
import type { StatsMovie } from "@/lib/stats-aggregate";

export async function getStats(): Promise<StatsMovie[]> {
  const supabase = await createClient();

  // Fetch all picks with movies
  const { data: picksData } = await supabase
    .from("picks")
    .select("id, movie_id, month, year")
    .not("movie_id", "is", null)
    .order("year", { ascending: true })
    .order("month", { ascending: true });

  if (!picksData || picksData.length === 0) return [];

  const movieIds = picksData.map((p) => p.movie_id!);
  const pickIds = picksData.map((p) => p.id);

  const [{ data: moviesData }, { data: reviewsData }] = await Promise.all([
    supabase.from("movies").select("*").in("id", movieIds),
    supabase.from("reviews").select("pick_id, score").in("pick_id", pickIds),
  ]);

  const movies = moviesData ?? [];
  const movieMap = new Map(movies.map((m) => [m.id, m]));
  const reviewsByPick = new Map<string, number[]>();
  for (const r of reviewsData ?? []) {
    const arr = reviewsByPick.get(r.pick_id) ?? [];
    arr.push(r.score);
    reviewsByPick.set(r.pick_id, arr);
  }

  const result: StatsMovie[] = [];
  for (const pick of picksData) {
    const movie = movieMap.get(pick.movie_id!);
    if (!movie) continue;
    result.push({
      movie_id: movie.id,
      title: movie.title,
      year: movie.year,
      poster_url: movie.poster_url,
      genres: movie.genres ?? [],
      pick_id: pick.id,
      pick_month: pick.month,
      pick_year: pick.year,
      scores: reviewsByPick.get(pick.id) ?? [],
    });
  }
  return result;
}
