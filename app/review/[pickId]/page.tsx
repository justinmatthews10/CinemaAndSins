"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { ReviewForm } from "@/components/ReviewForm";
import { PageHeading } from "@/components/PageHeading";
import { StatusBanner } from "@/components/StatusBanner";
import { LoadingState } from "@/components/LoadingState";
import { PosterImage } from "@/components/PosterImage";
import type { Pick } from "@/types/pick";
import type { Movie } from "@/types/movie";
import type { Review } from "@/types/review";

export default function ReviewPage() {
  const params = useParams<{ pickId: string }>();
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [pick, setPick] = useState<Pick | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    msg: string;
    variant: "error" | "success";
  } | null>(null);

  const loadData = useCallback(async () => {
    const { data: pickData } = await supabase
      .from("picks")
      .select("*")
      .eq("id", params.pickId)
      .maybeSingle();

    if (!pickData) {
      setLoadingData(false);
      return;
    }

    setPick(pickData as Pick);

    const [{ data: movieData }, { data: reviewData }] = await Promise.all([
      supabase.from("movies").select("*").eq("id", pickData.movie_id).single(),
      supabase
        .from("reviews")
        .select("*")
        .eq("pick_id", params.pickId)
        .eq("member_id", user!.id)
        .maybeSingle(),
    ]);

    setMovie((movieData as Movie) ?? null);
    setExistingReview((reviewData as Review) ?? null);
    setLoadingData(false);
  }, [supabase, params.pickId, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !member) return router.push("/login");
    if (!member.is_approved) return router.push("/pending");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [authLoading, user, member, router, loadData]);

  async function handleSubmit({
    score,
    reviewText,
    tags,
  }: {
    score: number;
    reviewText: string;
    tags: string[];
  }) {
    setSubmitting(true);
    setStatus(null);

    try {
      if (existingReview) {
        const { error } = await supabase
          .from("reviews")
          .update({
            score,
            review_text: reviewText || null,
            tags: tags.length > 0 ? tags : null,
          })
          .eq("id", existingReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews").insert({
          pick_id: params.pickId,
          member_id: user!.id,
          score,
          review_text: reviewText || null,
          tags: tags.length > 0 ? tags : null,
        });

        if (error) throw error;
      }

      setStatus({ msg: "Review saved!", variant: "success" });
      await loadData();
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save review";
      setStatus({ msg, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loadingData) return <LoadingState />;

  if (!pick || !movie) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-24">
        <div className="w-full max-w-md text-center">
          <PageHeading centered className="mb-4">
            Pick Not Found
          </PageHeading>
          <Link href="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const isLocked = pick.status === "locked";

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Movie context */}
        <div className="mb-8 flex gap-4">
          <PosterImage
            src={movie.poster_url}
            alt={movie.title}
            className="h-28 w-20 flex-shrink-0 rounded object-cover"
            fallbackClassName="flex h-28 w-20 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
          />
          <div>
            <PageHeading className="mb-1">{movie.title}</PageHeading>
            {movie.year && <p className="text-sm text-foreground/60">{movie.year}</p>}
          </div>
        </div>

        {isLocked && (
          <StatusBanner
            message="This pick is locked. Reviews can no longer be edited."
            variant="error"
            className="mb-6"
          />
        )}

        {status && (
          <StatusBanner message={status.msg} variant={status.variant} className="mb-6" />
        )}

        <ReviewForm
          initialScore={existingReview?.score ?? 5}
          initialReviewText={existingReview?.review_text ?? ""}
          initialTags={existingReview?.tags ?? []}
          locked={isLocked || submitting}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
