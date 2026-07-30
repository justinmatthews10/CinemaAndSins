import { createClient } from "@/lib/supabase/server";
import { calculateAverage, harshEasyGrader, topAndWorstMovies } from "@/lib/stats";
import type { ReviewWithMovie } from "@/lib/stats";
import type { MemberSummary } from "@/types/member-summary";
import type { Review } from "@/types/review";
import type { Movie } from "@/types/movie";

export async function getMembers(): Promise<MemberSummary[]> {
  const supabase = await createClient();

  const { data: membersData } = await supabase
    .from("members")
    .select("*")
    .eq("is_approved", true)
    .order("name", { ascending: true });

  if (!membersData || membersData.length === 0) return [];

  const memberIds = membersData.map((m) => m.id);

  const [{ data: reviewsData }, { data: moviesData }] = await Promise.all([
    supabase.from("reviews").select("*").in("member_id", memberIds),
    supabase.from("movies").select("*"),
  ]);

  const reviews = (reviewsData ?? []) as Review[];
  const movies = (moviesData ?? []) as Movie[];
  const movieMap = new Map(movies.map((m) => [m.id, m]));

  // Build reviews-with-movie for each member
  const reviewsByMember = new Map<string, ReviewWithMovie[]>();
  for (const r of reviews) {
    // Need the movie for each review — get it via the pick
    const arr = reviewsByMember.get(r.member_id) ?? [];
    reviewsByMember.set(r.member_id, arr);
  }

  // We need picks to join reviews to movies
  const pickIds = reviews.map((r) => r.pick_id);
  let reviewMovieMap = new Map<string, string>(); // pick_id -> movie_id
  if (pickIds.length > 0) {
    const { data: picksData } = await supabase
      .from("picks")
      .select("id, movie_id")
      .in("id", pickIds);
    reviewMovieMap = new Map((picksData ?? []).map((p) => [p.id, p.movie_id]));
  }

  // Now build full review-with-movie entries
  reviewsByMember.clear();
  for (const r of reviews) {
    const movieId = reviewMovieMap.get(r.pick_id);
    if (!movieId) continue;
    const movie = movieMap.get(movieId);
    if (!movie) continue;
    const arr = reviewsByMember.get(r.member_id) ?? [];
    arr.push({
      ...r,
      movie_id: movie.id,
      movie_title: movie.title,
      movie_year: movie.year,
      movie_poster_url: movie.poster_url,
      movie_genres: movie.genres,
    });
    reviewsByMember.set(r.member_id, arr);
  }

  // Calculate club average across all reviews
  const clubAverage = calculateAverage(reviews);

  // Build summaries
  return membersData.map((member) => {
    const memberReviews = reviewsByMember.get(member.id) ?? [];
    const averageScore = calculateAverage(memberReviews);
    const { top, worst } = topAndWorstMovies(memberReviews);

    return {
      id: member.id,
      name: member.name,
      avatar_url: member.avatar_url,
      created_at: member.created_at,
      review_count: memberReviews.length,
      average_score: averageScore,
      club_average: clubAverage,
      top_movie: top,
      worst_movie: worst,
    };
  });
}
