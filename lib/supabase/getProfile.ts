import { createClient } from "@/lib/supabase/server";
import { calculateAverage, harshEasyGrader, mostRatedGenre } from "@/lib/stats";
import type { ReviewWithMovie } from "@/lib/stats";
import type { ProfileData } from "@/types/member-summary";
import type { Review } from "@/types/review";
import type { Movie } from "@/types/movie";
import type { Pick } from "@/types/pick";

export async function getProfile(memberId: string): Promise<ProfileData> {
  const supabase = await createClient();

  const { data: memberData } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();

  if (!memberData) return null;

  // Fetch member's picks and reviews in parallel
  const [{ data: picksData }, { data: reviewsData }] = await Promise.all([
    supabase.from("picks").select("*").eq("picker_member_id", memberId),
    supabase.from("reviews").select("*").eq("member_id", memberId),
  ]);

  const picks = (picksData ?? []) as Pick[];
  const reviews = (reviewsData ?? []) as Review[];

  // Fetch all movies for picks and reviews
  const movieIds = [
    ...(picks.map((p) => p.movie_id).filter(Boolean) as string[]),
    ...reviews.map((r) => r.pick_id),
  ];

  // Need pick IDs to map reviews to movies
  const pickIds = reviews.map((r) => r.pick_id);
  let reviewMovieMap = new Map<string, string>();
  if (pickIds.length > 0) {
    const { data: reviewPicks } = await supabase
      .from("picks")
      .select("id, movie_id")
      .in("id", pickIds);
    reviewMovieMap = new Map((reviewPicks ?? []).map((p) => [p.id, p.movie_id]));
  }

  // Fetch all needed movies
  const allMovieIds = [
    ...(picks.map((p) => p.movie_id).filter(Boolean) as string[]),
    ...([...reviewMovieMap.values()].filter(Boolean) as string[]),
  ];
  const uniqueMovieIds = [...new Set(allMovieIds)];

  let movieMap = new Map<string, Movie>();
  if (uniqueMovieIds.length > 0) {
    const { data: moviesData } = await supabase
      .from("movies")
      .select("*")
      .in("id", uniqueMovieIds);
    movieMap = new Map((moviesData ?? []).map((m) => [m.id, m as Movie]));
  }

  // Build reviews with movie data
  const reviewsWithMovies: ReviewWithMovie[] = reviews
    .map((r) => {
      const movieId = reviewMovieMap.get(r.pick_id);
      if (!movieId) return null;
      const movie = movieMap.get(movieId);
      if (!movie) return null;
      return {
        ...r,
        movie_id: movie.id,
        movie_title: movie.title,
        movie_year: movie.year,
        movie_poster_url: movie.poster_url,
        movie_genres: movie.genres,
      };
    })
    .filter((r): r is ReviewWithMovie => r !== null);

  // Calculate club average (all reviews, not just this member's)
  const { data: allReviewsData } = await supabase.from("reviews").select("score");
  const clubAverage = calculateAverage((allReviewsData ?? []) as { score: number }[]);

  const averageScore = calculateAverage(reviewsWithMovies);
  const graderBadge = harshEasyGrader(averageScore, clubAverage);
  const topGenre = mostRatedGenre(reviewsWithMovies);

  // Build pick history
  const pickHistory = picks
    .filter((p) => p.movie_id && movieMap.has(p.movie_id))
    .map((p) => {
      const movie = movieMap.get(p.movie_id!)!;
      return {
        id: p.id,
        movie_id: movie.id,
        title: movie.title,
        movie_year: movie.year,
        poster_url: movie.poster_url,
        month: p.month,
        year: p.year,
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);

  return {
    member: {
      id: memberData.id,
      name: memberData.name,
      avatar_url: memberData.avatar_url,
      created_at: memberData.created_at,
    },
    reviewCount: reviewsWithMovies.length,
    averageScore,
    clubAverage,
    graderBadge,
    mostRatedGenre: topGenre,
    picks: pickHistory,
    reviews: reviewsWithMovies,
  };
}
