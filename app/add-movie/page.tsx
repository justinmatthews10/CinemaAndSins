"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { createMovieAndPick, getAssignedPicker } from "@/lib/supabase/picks";
import { TmdbSearch } from "@/components/TmdbSearch";
import { FormField } from "@/components/FormField";
import { ErrorBanner } from "@/components/ErrorBanner";
import type { TmdbSearchResult, TmdbMovieDetails } from "@/types/movie";
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

export default function AddMoviePage() {
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [loadingData, setLoadingData] = useState(true);
  const [assignedPickerId, setAssignedPickerId] = useState<string | null>(null);

  const [formData, setFormData] = useState<MovieFormData>(EMPTY_FORM);
  const [manualMode, setManualMode] = useState(false);
  const [watchDate, setWatchDate] = useState("");
  const [pickerNote, setPickerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Default to current month/year
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    if (authLoading) return;

    console.log("ADD-MOVIE auth state:", { user: !!user, member: !!member, approved: member?.is_approved });

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
      setAssignedPickerId(getAssignedPicker(rot, pks, month, year));
      setLoadingData(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, member]);

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
      // Fall back to search result data
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

    setSubmitting(true);
    try {
      await createMovieAndPick(supabase, {
        movie: formData,
        pickerMemberId: member.id,
        month,
        year,
        watchDate: watchDate || null,
        pickerNote: pickerNote.trim() || null,
      });
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit pick";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setFormData(EMPTY_FORM);
    setWatchDate("");
    setPickerNote("");
    setError(null);
    setSuccess(false);
  }

  // Loading state
  if (authLoading || loadingData) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="text-foreground/60">Loading...</p>
      </main>
    );
  }

  // Not the assigned picker
  if (assignedPickerId && assignedPickerId !== member?.id) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-3xl font-bold">
            Not Your Turn
          </h1>
          <p className="mb-6 text-foreground/70">
            You&apos;re not the assigned picker for {month}/{year}. Check back when
            it&apos;s your turn in the rotation.
          </p>
          <Link href="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  // Success screen
  if (success) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-center font-[family-name:var(--font-playfair)] text-3xl font-bold">
            Pick Submitted!
          </h1>
          <p className="mb-8 text-foreground/70">
            &ldquo;{formData.title}&rdquo; has been added as your pick for {month}/{year}.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              Add Another
            </button>
            <Link
              href="/"
              className="rounded-lg bg-accent px-6 py-3 font-medium text-background transition-colors hover:bg-accent/80"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl">
        <h1 className="mb-8 text-center font-[family-name:var(--font-playfair)] text-3xl font-bold">
          Add a Movie Pick
        </h1>

        {error && <ErrorBanner message={error} />}

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
              <h2 className="text-sm font-medium text-foreground/80">Movie Details</h2>

              {formData.poster_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.poster_url}
                  alt={formData.title}
                  className="h-48 w-32 rounded object-cover"
                />
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
                      setFormData({ ...formData, director: e.target.value || null })
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

          {/* Pick details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pick-month" className="mb-2 block text-sm font-medium">
                Month
              </label>
              <input
                id="pick-month"
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="pick-year" className="mb-2 block text-sm font-medium">
                Year
              </label>
              <input
                id="pick-year"
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || 2026)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="watch-date" className="mb-2 block text-sm font-medium">
              Watch Date (optional)
            </label>
            <input
              id="watch-date"
              type="date"
              value={watchDate}
              onChange={(e) => setWatchDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none"
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
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none"
              placeholder="Tell the club why you chose this movie..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.title.trim()}
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-background transition-colors hover:bg-accent/80 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Pick"}
          </button>
        </form>
      </div>
    </main>
  );
}
