import { createClient } from "@/lib/supabase/server";
import { calculateAverage, scoreVariance } from "@/lib/scoring";
import type { Movie } from "@/types/movie";
import type { Pick } from "@/types/pick";
import type { Review } from "@/types/review";
import type { Member } from "@/types/member";

export type MovieDetailData = {
  movie: Movie;
  pick: Pick;
  picker: Member;
  reviews: (Review & { member: Member })[];
  averageScore: number;
  scoreVariance: number;
  isDivisive: boolean;
} | null;

/** Threshold for "most divisive" — variance above this means hot takes. */
const DIVISIVE_THRESHOLD = 4;

export async function getMovieDetail(movieId: string): Promise<MovieDetailData> {
  const supabase = await createClient();

  const { data: movieData } = await supabase
    .from("movies")
    .select("*")
    .eq("id", movieId)
    .single();

  if (!movieData) return null;
  const movie = movieData as Movie;

  // Find the pick for this movie
  const { data: pickData } = await supabase
    .from("picks")
    .select("*")
    .eq("movie_id", movieId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pickData) return null;
  const pick = pickData as Pick;

  // Get picker and reviews in parallel
  const [{ data: pickerData }, { data: reviewData }, { data: membersData }] =
    await Promise.all([
      supabase.from("members").select("*").eq("id", pick.picker_member_id).single(),
      supabase.from("reviews").select("*").eq("pick_id", pick.id),
      supabase.from("members").select("*"),
    ]);

  const picker = pickerData as Member;
  const reviews = (reviewData ?? []) as Review[];
  const members = (membersData ?? []) as Member[];

  // Join reviews with member data
  const reviewsWithMembers = reviews
    .map((review) => {
      const member = members.find((m) => m.id === review.member_id);
      return member ? { ...review, member } : null;
    })
    .filter((r): r is Review & { member: Member } => r !== null);

  // Calculate scoring stats
  const averageScore = calculateAverage(reviews);
  const variance = scoreVariance(reviews);

  return {
    movie,
    pick,
    picker,
    reviews: reviewsWithMembers,
    averageScore,
    scoreVariance: variance,
    isDivisive: variance > DIVISIVE_THRESHOLD,
  };
}
