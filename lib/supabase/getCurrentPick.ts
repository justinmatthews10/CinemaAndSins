import { createClient } from "@/lib/supabase/server";
import type { Pick } from "@/types/pick";
import type { Movie } from "@/types/movie";
import type { Member } from "@/types/member";
import type { Review } from "@/types/review";
import type { RotationEntry } from "@/types/rotation";
import { getAssignedPicker } from "@/lib/supabase/picks";

export type CurrentPickData = {
  pick: Pick;
  movie: Movie;
  picker: Member;
  reviews: Review[];
  reviewStats: { reviewed: number; total: number };
  userReview: { score: number; review_text: string | null } | null;
  nextPicker: Member | null;
} | null;

export async function getCurrentPick(userId: string | null): Promise<CurrentPickData> {
  const supabase = await createClient();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Get current month's pick (prefer "current" status, fall back to any)
  const { data: picksData } = await supabase
    .from("picks")
    .select("*")
    .eq("month", month)
    .eq("year", year)
    .order("status", { ascending: false });

  if (!picksData || picksData.length === 0) return null;

  const pickData = picksData[0];

  const pick = pickData as Pick;

  // Get movie, picker, and reviews in parallel
  const [
    { data: movieData },
    { data: pickerData },
    { data: reviewData },
    { data: rotationData },
    { data: membersData },
    { data: allPicksData },
  ] = await Promise.all([
    supabase.from("movies").select("*").eq("id", pick.movie_id).single(),
    supabase.from("members").select("*").eq("id", pick.picker_member_id).single(),
    supabase.from("reviews").select("*").eq("pick_id", pick.id),
    supabase.from("rotation").select("*").order("order_index"),
    supabase.from("members").select("*"),
    supabase.from("picks").select("*").order("created_at"),
  ]);

  const movie = movieData as Movie;
  const picker = pickerData as Member;
  const reviews = (reviewData ?? []) as Review[];
  const rotation = (rotationData ?? []) as RotationEntry[];
  const members = (membersData ?? []) as Member[];
  const allPicks = (allPicksData ?? []) as Pick[];

  // Get total member count for review stats
  const approvedMembers = members.filter((m) => m.is_approved);
  const total = approvedMembers.length;
  const reviewed = reviews.length;

  // Find user's review
  let userReview: { score: number; review_text: string | null } | null = null;
  if (userId) {
    const userRev = reviews.find((r) => r.member_id === userId);
    if (userRev) {
      userReview = {
        score: Number(userRev.score),
        review_text: userRev.review_text,
      };
    }
  }

  // Get next month's assigned picker
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextPickerId = getAssignedPicker(rotation, allPicks, nextMonth, nextYear);
  const nextPicker = nextPickerId
    ? (members.find((m) => m.id === nextPickerId) ?? null)
    : null;

  return {
    pick,
    movie,
    picker,
    reviews,
    reviewStats: { reviewed, total },
    userReview,
    nextPicker,
  };
}
