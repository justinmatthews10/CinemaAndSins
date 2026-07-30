import { createClient } from "@/lib/supabase/server";
import type { Pick } from "@/types/pick";
import type { Movie } from "@/types/movie";
import type { Member } from "@/types/member";
import type { Review } from "@/types/review";
import type { RotationEntry } from "@/types/rotation";
import { getAssignedPicker } from "@/lib/supabase/picks";

export type CurrentPickData = {
  /** The assigned picker for this month (always present if rotation exists) */
  assignedPicker: Member | null;
  /** The pick for this month, or null if no movie has been picked yet */
  pick: Pick | null;
  /** The movie for the pick, or null if no pick exists */
  movie: Movie | null;
  /** The picker who made the pick (same as assignedPicker if pick exists) */
  picker: Member | null;
  reviews: Review[];
  reviewStats: { reviewed: number; total: number };
  userReview: { score: number; review_text: string | null } | null;
  nextPicker: Member | null;
  month: number;
  year: number;
};

export async function getCurrentPick(userId: string | null): Promise<CurrentPickData> {
  const supabase = await createClient();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Fetch rotation, members, and all picks in parallel (always needed)
  const [
    { data: rotationData },
    { data: membersData },
    { data: allPicksData },
    { data: pickData },
  ] = await Promise.all([
    supabase.from("rotation").select("*").order("order_index"),
    supabase.from("members").select("*"),
    supabase.from("picks").select("*").order("created_at"),
    supabase.from("picks").select("*").eq("month", month).eq("year", year).maybeSingle(),
  ]);

  const rotation = (rotationData ?? []) as RotationEntry[];
  const members = (membersData ?? []) as Member[];
  const allPicks = (allPicksData ?? []) as Pick[];
  const pick = (pickData as Pick) ?? null;

  // Determine the assigned picker for this month
  const assignedPickerId = getAssignedPicker(rotation, allPicks, month, year);
  const assignedPicker = assignedPickerId
    ? (members.find((m) => m.id === assignedPickerId) ?? null)
    : null;

  // If there's a pick, fetch movie, picker, and reviews
  let movie: Movie | null = null;
  let picker: Member | null = null;
  let reviews: Review[] = [];

  if (pick) {
    const [{ data: movieData }, { data: pickerData }, { data: reviewData }] =
      await Promise.all([
        supabase.from("movies").select("*").eq("id", pick.movie_id).single(),
        supabase.from("members").select("*").eq("id", pick.picker_member_id).single(),
        supabase.from("reviews").select("*").eq("pick_id", pick.id),
      ]);

    movie = (movieData as Movie) ?? null;
    picker = (pickerData as Member) ?? null;
    reviews = (reviewData ?? []) as Review[];
  }

  // Get total member count for review stats
  const approvedMembers = members.filter((m) => m.is_approved);
  const total = approvedMembers.length;
  const reviewed = reviews.length;

  // Find user's review
  let userReview: { score: number; review_text: string | null } | null = null;
  if (userId && pick) {
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
    assignedPicker,
    pick,
    movie,
    picker,
    reviews,
    reviewStats: { reviewed, total },
    userReview,
    nextPicker,
    month,
    year,
  };
}
