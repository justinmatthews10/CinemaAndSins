"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  createMovieAndPick,
  updatePick,
  deletePick,
  getAssignedPicker,
} from "@/lib/supabase/picks";
import { TmdbSearch } from "@/components/TmdbSearch";
import { FormField } from "@/components/FormField";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PosterImage } from "@/components/PosterImage";
import { PageHeading } from "@/components/PageHeading";
import { primaryButtonClass, inputClass } from "@/lib/ui";
import { formatDate } from "@/lib/utils";
import type { TmdbSearchResult, TmdbMovieDetails, Movie } from "@/types/movie";
import type { RotationEntry } from "@/types/rotation";
import type { Pick } from "@/types/pick";

type MovieFormData = {
  tmdb_id: number | null;
  title: string;
  year: number | null;
  director: string | null;
  runtime: number | null;
  poster_url: string | null;
  synopsis: string | null;
  genres: string[];
};

const EMPTY_FORM: MovieFormData = {
  tmdb_id: null,
  title: "",
  year: null,
  director: null,
  runtime: null,
  poster_url: null,
  synopsis: null,
  genres: [],
};

type ExistingPick = {
  pick: Pick;
  movie: Movie;
};

export default function AddMoviePage() {
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [loadingData, setLoadingData] = useState(true);
  const [assignedMonth, setAssignedMonth] = useState<{
    month: number;
    year: number;
  } | null>(null);
  const [existingPick, setExistingPick] = useState<ExistingPick | null>(null);

  const [formData, setFormData] = useState<MovieFormData>(EMPTY_FORM);
  const [manualMode, setManualMode] = useState(false);
  const [watchDate, setWatchDate] = useState("");
  const [pickerNote, setPickerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !member) {
      router.push("/login");
      return;
    }

    if (!member.is_approved) {
      router.push("/pending");
      return;
    }

    async function loadData() {
      const [{ data: rotData }, { data: pickData }] = await Promise.all([
        supabase.from("rotation").select("*").order("order_index"),
        supabase.from("picks").select("*").order("created_at"),
      ]);

      const rot = (rotData ?? []) as RotationEntry[];
      const pks = (pickData ?? []) as Pick[];

      // Find the next month where this user is the assigned picker
      // (regardless of whether a pick already exists for that month).
      const activeCount = rot.filter((r) => r.is_active).length;
      const searchRange = Math.max(12, activeCount * 2);
      const now = new Date();
      let foundMonth: { month: number; year: number } | null = null;

      for (let i = 0; i < searchRange; i++) {
        const checkDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const m = checkDate.getMonth() + 1;
        const y = checkDate.getFullYear();

        const pickerId = getAssignedPicker(rot, pks, m, y);
        if (pickerId === member?.id) {
          foundMonth = { month: m, year: y };
          break;
        }
      }

      setAssignedMonth(foundMonth);

      // If we found an assigned month, check if a pick already exists
      if (foundMonth) {
        const existing = pks.find(
          (p) => p.month === foundMonth.month && p.year === foundMonth.year,
        );
        if (existing) {
          const { data: movieData } = await supabase
            .from("movies")
            .select("*")
            .eq("id", existing.movie_id)
            .single();
          if (movieData) {
            setExistingPick({ pick: existing, movie: movieData as Movie });
            setWatchDate(existing.watch_date ?? "");
            setPickerNote(existing.picker_note ?? "");
          }
        }
      }

      setLoadingData(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, member]);

  async function reloadExistingPick() {
    if (!assignedMonth) return;
    const { data: pickData } = await supabase
      .from("picks")
      .select("*")
      .eq("month", assignedMonth.month)
      .eq("year", assignedMonth.year)
      .maybeSingle();

    if (pickData) {
      const { data: movieData } = await supabase
        .from("movies")
        .select("*")
        .eq("id", pickData.movie_id)
        .single();
      if (movieData) {
        setExistingPick({ pick: pickData as Pick, movie: movieData as Movie });
        setWatchDate(pickData.watch_date ?? "");
        setPickerNote(pickData.picker_note ?? "");
      }
    } else {
      setExistingPick(null);
    }
  }

  async function handleSearchSelect(result: TmdbSearchResult) {
    setError(null);
    try {
      const res = await fetch(`/api/tmdb/${result.tmdb_id}`);
      if (!res.ok) throw new Error("Failed to fetch movie details");
      const details: TmdbMovieDetails = await res.json();
      setFormData({
        tmdb_id: details.tmdb_id,
        title: details.title,
        year: details.year,
        director: details.director,
        runtime: details.runtime,
        poster_url: details.poster_url,
        synopsis: details.synopsis,
        genres: details.genres,
      });
      setManualMode(false);
    } catch {
      setFormData({
        tmdb_id: result.tmdb_id,
        title: result.title,
        year: result.year,
        director: null,
        runtime: null,
        poster_url: result.poster_url,
        synopsis: result.synopsis,
        genres: [],
      });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Movie title is required");
      return;
    }

    if (!member) {
      setError("You must be logged in to submit a pick");
      return;
    }

    if (!assignedMonth) {
      setError("You don't have an assigned month to pick for");
      return;
    }

    setSubmitting(true);
    try {
      if (existingPick && editing) {
        // Update existing pick with new movie
        await updatePick(supabase, {
          pickId: existingPick.pick.id,
          movie: formData,
          watchDate: watchDate || null,
          pickerNote: pickerNote.trim() || null,
        });
      } else {
        // Create new pick
        await createMovieAndPick(supabase, {
          movie: formData,
          pickerMemberId: member.id,
          month: assignedMonth.month,
          year: assignedMonth.year,
          watchDate: watchDate || null,
          pickerNote: pickerNote.trim() || null,
        });
      }
      setEditing(false);
      setFormData(EMPTY_FORM);
      setManualMode(false);
      await reloadExistingPick();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit pick";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!existingPick) return;
    setDeleting(true);
    try {
      await deletePick(supabase, existingPick.pick.id);
      setExistingPick(null);
      setConfirmingDelete(false);
      setEditing(false);
      setFormData(EMPTY_FORM);
      setWatchDate("");
      setPickerNote("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove pick";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  function handleStartChange() {
    setEditing(true);
    setFormData(EMPTY_FORM);
    setManualMode(false);
  }

  function handleCancelChange() {
    setEditing(false);
    setFormData(EMPTY_FORM);
    setManualMode(false);
  }

  // Loading state
  if (authLoading || loadingData) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="text-foreground/60">Loading...</p>
      </main>
    );
  }

  // No assigned month
  if (!assignedMonth) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-md text-center">
          <PageHeading centered className="mb-4">
            Not Your Turn
          </PageHeading>
          <p className="mb-6 text-foreground/70">
            You don&apos;t have an assigned month to pick for right now. Check back when
            it&apos;s your turn in the rotation.
          </p>
          <Link href="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const showForm = !existingPick || editing;

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <PageHeading className="">
            Your Pick for {assignedMonth.month}/{assignedMonth.year}
          </PageHeading>
          <p className="mt-2 text-sm text-foreground/60">
            {existingPick && !editing
              ? "You can change or remove your pick below."
              : "Search for a movie on TMDB or enter one manually."}
          </p>
        </div>

        {error && <ErrorBanner message={error} />}

        {/* Existing pick display */}
        {existingPick && !editing && (
          <div className="space-y-6">
            <div className="flex gap-6 rounded-2xl border border-border bg-surface p-6">
              <PosterImage
                src={existingPick.movie.poster_url}
                alt={existingPick.movie.title}
                className="h-48 w-32 flex-shrink-0 rounded object-cover"
                fallbackClassName="flex h-48 w-32 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
              />
              <div className="flex flex-1 flex-col gap-2">
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
                  {existingPick.movie.title}
                </h2>
                {existingPick.movie.year && (
                  <p className="text-sm text-foreground/60">{existingPick.movie.year}</p>
                )}
                {existingPick.movie.director && (
                  <p className="text-sm text-foreground/70">
                    Directed by {existingPick.movie.director}
                  </p>
                )}
                {existingPick.movie.runtime && (
                  <p className="text-sm text-foreground/70">
                    {existingPick.movie.runtime} min
                  </p>
                )}
                {existingPick.movie.synopsis && (
                  <p className="mt-2 text-sm text-foreground/60">
                    {existingPick.movie.synopsis}
                  </p>
                )}
                {existingPick.pick.picker_note && (
                  <p className="mt-2 border-t border-border pt-2 text-sm italic text-foreground/70">
                    &ldquo;{existingPick.pick.picker_note}&rdquo;
                  </p>
                )}
                {existingPick.pick.watch_date && (
                  <p className="text-sm text-foreground/60">
                    Watch by: {formatDate(existingPick.pick.watch_date)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartChange}
                className="rounded-lg bg-accent px-6 py-3 font-medium text-background transition-colors hover:bg-accent/80"
              >
                Change Movie
              </button>

              {confirmingDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground/70">Remove this pick?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-accent-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-secondary/80 disabled:opacity-50"
                  >
                    {deleting ? "Removing..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-foreground/5"
                >
                  Remove Pick
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form (no pick yet, or editing) */}
        {showForm && (
          <>
            {editing && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Choose a new movie</h2>
                <button
                  onClick={handleCancelChange}
                  className="text-sm text-accent hover:underline"
                >
                  ← Back to current pick
                </button>
              </div>
            )}

            {!manualMode && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium">Search TMDB</label>
                <TmdbSearch onSelect={handleSearchSelect} />
                <button
                  type="button"
                  onClick={() => {
                    setManualMode(true);
                    setFormData(EMPTY_FORM);
                  }}
                  className="mt-2 text-sm text-accent hover:underline"
                >
                  Can&apos;t find it? Enter manually
                </button>
              </div>
            )}

            {manualMode && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setManualMode(false);
                    setFormData(EMPTY_FORM);
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  ← Back to TMDB search
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Movie metadata (auto-filled or manual) */}
              {formData.title || manualMode ? (
                <div className="space-y-5 rounded-lg border border-border p-4">
                  <h2 className="text-sm font-medium text-foreground/80">
                    Movie Details
                  </h2>

                  {formData.poster_url && (
                    <PosterImage src={formData.poster_url} alt={formData.title} />
                  )}

                  <FormField
                    id="movie-title"
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Movie title"
                  />

                  {manualMode && (
                    <>
                      <FormField
                        id="movie-year"
                        label="Year"
                        type="number"
                        value={formData.year?.toString() ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            year: e.target.value ? parseInt(e.target.value, 10) : null,
                          })
                        }
                        placeholder="2026"
                      />
                      <FormField
                        id="movie-director"
                        label="Director"
                        value={formData.director ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            director: e.target.value || null,
                          })
                        }
                        placeholder="Director name"
                      />
                      <FormField
                        id="movie-runtime"
                        label="Runtime (minutes)"
                        type="number"
                        value={formData.runtime?.toString() ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            runtime: e.target.value ? parseInt(e.target.value, 10) : null,
                          })
                        }
                        placeholder="120"
                      />
                    </>
                  )}

                  {!manualMode && (
                    <div className="space-y-1 text-sm text-foreground/70">
                      {formData.year && <p>Year: {formData.year}</p>}
                      {formData.director && <p>Director: {formData.director}</p>}
                      {formData.runtime && <p>Runtime: {formData.runtime} min</p>}
                      {formData.genres.length > 0 && (
                        <p>Genres: {formData.genres.join(", ")}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              <div>
                <label htmlFor="watch-date" className="mb-2 block text-sm font-medium">
                  Watch Date (optional)
                </label>
                <input
                  id="watch-date"
                  type="date"
                  value={watchDate}
                  onChange={(e) => setWatchDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="picker-note" className="mb-2 block text-sm font-medium">
                  Why I Picked This (optional)
                </label>
                <textarea
                  id="picker-note"
                  value={pickerNote}
                  onChange={(e) => setPickerNote(e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Tell the club why you chose this movie..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !formData.title.trim()}
                className={primaryButtonClass}
              >
                {submitting ? "Saving..." : editing ? "Update Pick" : "Submit Pick"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
