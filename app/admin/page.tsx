"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { RotationEditor } from "@/components/RotationEditor";
import { MemberManager } from "@/components/MemberManager";
import { PickManager } from "@/components/PickManager";
import type { PickWithMovie } from "@/components/PickManager";
import { ContentManager } from "@/components/ContentManager";
import type { AdminMovie, AdminReview } from "@/components/ContentManager";
import { PastPickForm } from "@/components/PastPickForm";
import { PageHeading } from "@/components/PageHeading";
import { StatusBanner } from "@/components/StatusBanner";
import { LoadingState } from "@/components/LoadingState";
import { getActiveRotation } from "@/lib/rotation";
import { createMovieAndPick } from "@/lib/supabase/picks";
import type { RotationEntry } from "@/types/rotation";
import type { Member } from "@/types/member";
import type { TmdbSearchResult } from "@/types/movie";

type Tab = "rotation" | "members" | "picks" | "pastpick" | "content";

export default function AdminPage() {
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("rotation");
  const [rotation, setRotation] = useState<RotationEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [picks, setPicks] = useState<PickWithMovie[]>([]);
  const [movies, setMovies] = useState<AdminMovie[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submittingPastPick, setSubmittingPastPick] = useState(false);
  const [status, setStatus] = useState<{
    msg: string;
    variant: "error" | "success";
  } | null>(null);

  const loadData = useCallback(async () => {
    const [
      { data: rotData },
      { data: memberData },
      { data: picksData },
      { data: moviesData },
      { data: reviewsData },
    ] = await Promise.all([
      supabase.from("rotation").select("*").order("order_index"),
      supabase.from("members").select("*").order("name"),
      supabase
        .from("picks")
        .select("*, movies(title, poster_url), members(name)")
        .order("year", { ascending: false })
        .order("month", { ascending: false }),
      supabase.from("movies").select("*").order("title"),
      supabase
        .from("reviews")
        .select("*, members(name), picks(movie_id, movies(title))")
        .order("created_at", { ascending: false }),
    ]);

    setRotation((rotData ?? []) as RotationEntry[]);
    setMembers((memberData ?? []) as Member[]);

    // Build picks with movie + picker info
    setPicks(
      (picksData ?? []).map((p) => ({
        id: p.id,
        movie_id: p.movie_id,
        picker_member_id: p.picker_member_id,
        picker_name: (p as { members?: { name?: string } }).members?.name ?? "Unknown",
        month: p.month,
        year: p.year,
        watch_date: p.watch_date,
        status: p.status,
        movie_title:
          (p as { movies?: { title?: string } | null }).movies?.title ?? "Unknown",
        movie_poster_url:
          (p as { movies?: { poster_url?: string } | null }).movies?.poster_url ?? null,
      })),
    );

    // Build movies with review counts
    const reviewCounts = new Map<string, number>();
    for (const r of reviewsData ?? []) {
      const pick = (r as { picks?: { movie_id?: string } | null }).picks;
      if (pick?.movie_id) {
        reviewCounts.set(pick.movie_id, (reviewCounts.get(pick.movie_id) ?? 0) + 1);
      }
    }
    setMovies(
      (moviesData ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        poster_url: m.poster_url,
        review_count: reviewCounts.get(m.id) ?? 0,
      })),
    );

    // Build reviews with member + movie names
    setReviews(
      (reviewsData ?? []).map((r) => ({
        id: r.id,
        score: r.score,
        review_text: r.review_text,
        member_name: (r as { members?: { name?: string } }).members?.name ?? "Unknown",
        movie_title:
          (r as { picks?: { movies?: { title?: string } } }).picks?.movies?.title ??
          "Unknown",
        pick_id: r.pick_id,
      })),
    );

    setLoadingData(false);
  }, [supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !member) return router.push("/login");
    if (!member.is_admin) return router.push("/");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [authLoading, user, member, router, loadData]);

  /** Helper: run a mutation, reload data, and set success/error status. */
  async function mutate(
    op: () => Promise<{ error: { message: string } | null }>,
    successMsg: string,
  ) {
    setStatus(null);
    const result = await op();
    if (result.error) {
      setStatus({ msg: result.error.message ?? "Operation failed", variant: "error" });
      return;
    }
    await loadData();
    setStatus({ msg: successMsg, variant: "success" });
  }

  // === Rotation handlers ===
  async function handleReorder(index: number, direction: "up" | "down") {
    const active = getActiveRotation(rotation);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= active.length) return;

    const entryA = active[index];
    const entryB = active[swapIndex];

    await mutate(async () => {
      for (const { id, order_index } of [
        { id: entryA.id, order_index: entryB.order_index },
        { id: entryB.id, order_index: entryA.order_index },
      ]) {
        const { error } = await supabase
          .from("rotation")
          .update({ order_index })
          .eq("id", id);
        if (error) return { error };
      }
      return { error: null };
    }, "Rotation order updated");
  }

  async function handleToggleActive(memberId: string, isActive: boolean) {
    await mutate(
      async () =>
        supabase
          .from("rotation")
          .update({ is_active: isActive })
          .eq("member_id", memberId),
      isActive ? "Member activated" : "Member deactivated",
    );
  }

  async function handleAdd(memberId: string) {
    const maxOrder = Math.max(0, ...rotation.map((r) => r.order_index));
    await mutate(
      async () =>
        supabase.from("rotation").insert({
          member_id: memberId,
          order_index: maxOrder + 1,
          is_active: true,
        }),
      "Member added to rotation",
    );
  }

  // === Member handlers ===
  async function handleApprove(memberId: string) {
    await mutate(
      async () =>
        supabase.from("members").update({ is_approved: true }).eq("id", memberId),
      "Member approved",
    );
  }

  async function handleRemoveMember(memberId: string) {
    await mutate(
      async () => supabase.from("members").delete().eq("id", memberId),
      "Member removed",
    );
  }

  async function handleToggleAdmin(memberId: string, isAdmin: boolean) {
    await mutate(
      async () =>
        supabase.from("members").update({ is_admin: isAdmin }).eq("id", memberId),
      isAdmin ? "Admin privileges granted" : "Admin privileges removed",
    );
  }

  // === Pick handlers ===
  async function handleLock(pickId: string) {
    await mutate(
      async () => supabase.from("picks").update({ status: "locked" }).eq("id", pickId),
      "Pick locked — reviews frozen",
    );
  }

  async function handleUnlock(pickId: string) {
    await mutate(
      async () => supabase.from("picks").update({ status: "current" }).eq("id", pickId),
      "Pick unlocked — reviews reopened",
    );
  }

  // === Content handlers ===
  async function handleDeleteMovie(movieId: string) {
    await mutate(
      async () => supabase.from("movies").delete().eq("id", movieId),
      "Movie deleted",
    );
  }

  async function handleDeleteReview(reviewId: string) {
    await mutate(
      async () => supabase.from("reviews").delete().eq("id", reviewId),
      "Review deleted",
    );
  }

  // === Past Pick handler ===
  async function handleCreatePastPick(data: {
    movie: TmdbSearchResult;
    pickerMemberId: string;
    month: number;
    year: number;
    watchDate: string;
    pickerNote: string;
  }) {
    setStatus(null);
    setSubmittingPastPick(true);
    try {
      const result = await createMovieAndPick(supabase, {
        movie: {
          tmdb_id: data.movie.tmdb_id,
          title: data.movie.title,
          year: data.movie.year ?? null,
          director: null,
          runtime: null,
          poster_url: data.movie.poster_url,
          synopsis: null,
          genres: [],
        },
        pickerMemberId: data.pickerMemberId,
        month: data.month,
        year: data.year,
        watchDate: data.watchDate || null,
        pickerNote: data.pickerNote || null,
        status: "current",
      });
      await loadData();
      setStatus({
        msg: `Past pick created — ${data.movie.title} for ${data.month}/${data.year}`,
        variant: "success",
      });
      // Switch to picks tab so admin can see the new pick
      setTab("picks");
      void result;
    } catch (err) {
      setStatus({
        msg: err instanceof Error ? err.message : "Failed to create past pick",
        variant: "error",
      });
    } finally {
      setSubmittingPastPick(false);
    }
  }

  if (authLoading || loadingData) return <LoadingState />;

  if (!member?.is_admin) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-md text-center">
          <PageHeading centered className="mb-4">
            Access Denied
          </PageHeading>
          <p className="mb-6 text-foreground/70">Only admins can access this page.</p>
          <Link href="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "rotation", label: "Rotation" },
    { key: "members", label: "Members" },
    { key: "picks", label: "Picks" },
    { key: "pastpick", label: "Past Pick" },
    { key: "content", label: "Content" },
  ];

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeading className="mb-6">Admin Dashboard</PageHeading>

        {status && <StatusBanner message={status.msg} variant={status.variant} />}

        {/* Tab navigation */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-accent text-background" : "border border-border text-foreground/60 hover:bg-foreground/5"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "rotation" && (
          <RotationEditor
            rotation={rotation}
            members={members}
            onReorder={handleReorder}
            onToggleActive={handleToggleActive}
            onAdd={handleAdd}
          />
        )}

        {tab === "members" && (
          <MemberManager
            members={members}
            onApprove={handleApprove}
            onRemove={handleRemoveMember}
            onToggleAdmin={handleToggleAdmin}
          />
        )}

        {tab === "picks" && (
          <PickManager picks={picks} onLock={handleLock} onUnlock={handleUnlock} />
        )}

        {tab === "pastpick" && (
          <PastPickForm
            members={members}
            onSubmit={handleCreatePastPick}
            submitting={submittingPastPick}
          />
        )}

        {tab === "content" && (
          <ContentManager
            movies={movies}
            reviews={reviews}
            onDeleteMovie={handleDeleteMovie}
            onDeleteReview={handleDeleteReview}
          />
        )}
      </div>
    </main>
  );
}
