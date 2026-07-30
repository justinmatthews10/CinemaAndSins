"use client";

import { useState } from "react";
import { TmdbSearch } from "@/components/TmdbSearch";
import { PosterImage } from "@/components/PosterImage";
import { inputClass, primaryButtonClass } from "@/lib/ui";
import type { Member } from "@/types/member";
import type { TmdbSearchResult } from "@/types/movie";

type PastPickFormProps = {
  members: Member[];
  membersApproved?: Member[];
  onSubmit: (data: {
    movie: TmdbSearchResult;
    pickerMemberId: string;
    month: number;
    year: number;
    watchDate: string;
    pickerNote: string;
  }) => Promise<void>;
  submitting: boolean;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i);

export function PastPickForm({
  members,
  membersApproved,
  onSubmit,
  submitting,
}: PastPickFormProps) {
  const approved = membersApproved ?? members.filter((m) => m.is_approved);

  const [selectedMovie, setSelectedMovie] = useState<TmdbSearchResult | null>(null);
  const [pickerId, setPickerId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [watchDate, setWatchDate] = useState("");
  const [pickerNote, setPickerNote] = useState("");

  const canSubmit =
    selectedMovie !== null &&
    pickerId !== "" &&
    month !== "" &&
    year !== "" &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMovie || !canSubmit) return;
    await onSubmit({
      movie: selectedMovie,
      pickerMemberId: pickerId,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      watchDate,
      pickerNote,
    });
    // Reset form
    setSelectedMovie(null);
    setPickerId("");
    setMonth("");
    setYear("");
    setWatchDate("");
    setPickerNote("");
  }

  if (approved.length === 0) {
    return (
      <p className="text-sm italic text-foreground/40">
        No approved members yet. Approve members first before creating past picks.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Movie search */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground/70">Movie</label>
        {selectedMovie ? (
          <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
            <PosterImage
              src={selectedMovie.poster_url}
              alt={selectedMovie.title}
              className="h-20 w-14 flex-shrink-0 rounded object-cover"
              fallbackClassName="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">{selectedMovie.title}</p>
              {selectedMovie.year && (
                <p className="text-sm text-foreground/60">{selectedMovie.year}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedMovie(null)}
              className="rounded border border-border px-4 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/5"
            >
              Change
            </button>
          </div>
        ) : (
          <TmdbSearch onSelect={setSelectedMovie} />
        )}
      </div>

      {/* Picker */}
      <div>
        <label
          htmlFor="picker"
          className="mb-2 block text-sm font-medium text-foreground/70"
        >
          Picker
        </label>
        <select
          id="picker"
          value={pickerId}
          onChange={(e) => setPickerId(e.target.value)}
          className={inputClass}
        >
          <option value="">Select a member...</option>
          {approved.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Month + Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="month"
            className="mb-2 block text-sm font-medium text-foreground/70"
          >
            Month
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={inputClass}
          >
            <option value="">Month...</option>
            {MONTHS.map((label, i) => (
              <option key={i + 1} value={i + 1}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="year"
            className="mb-2 block text-sm font-medium text-foreground/70"
          >
            Year
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={inputClass}
          >
            <option value="">Year...</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Watch date */}
      <div>
        <label
          htmlFor="watch-date"
          className="mb-2 block text-sm font-medium text-foreground/70"
        >
          Watch Date
        </label>
        <input
          id="watch-date"
          type="date"
          value={watchDate}
          onChange={(e) => setWatchDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Picker note */}
      <div>
        <label
          htmlFor="picker-note"
          className="mb-2 block text-sm font-medium text-foreground/70"
        >
          Picker Note
        </label>
        <textarea
          id="picker-note"
          value={pickerNote}
          onChange={(e) => setPickerNote(e.target.value)}
          rows={3}
          placeholder="Why did you pick this movie?"
          className={inputClass}
        />
      </div>

      {/* Submit */}
      <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
        {submitting ? "Creating..." : "Create Past Pick"}
      </button>
    </form>
  );
}
