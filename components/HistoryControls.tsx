"use client";

import { useState, useMemo } from "react";
import { MovieCard } from "@/components/MovieCard";
import type { HistoryEntry } from "@/types/history";

type HistoryControlsProps = {
  entries: HistoryEntry[];
  pickers: string[];
  genres: string[];
};

type SortMode = "newest" | "year" | "score" | "genre" | "picker" | "divisive";

const PAGE_SIZE = 12;

const SORT_LABELS: Record<SortMode, string> = {
  newest: "Newest first",
  year: "Year",
  score: "Average score",
  genre: "Genre",
  picker: "Picker",
  divisive: "Most divisive",
};

export function HistoryControls({ entries, pickers, genres }: HistoryControlsProps) {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [genreFilter, setGenreFilter] = useState("");
  const [pickerFilter, setPickerFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = [...entries];

    // Search by title
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter((e) => e.title.toLowerCase().includes(query));
    }

    // Filter by genre
    if (genreFilter) {
      result = result.filter((e) => e.genres.includes(genreFilter));
    }

    // Filter by picker
    if (pickerFilter) {
      result = result.filter((e) => e.picker_name === pickerFilter);
    }

    // Sort
    switch (sortMode) {
      case "newest":
        result.sort((a, b) => b.pick_year - a.pick_year || b.pick_month - a.pick_month);
        break;
      case "year":
        result.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        break;
      case "score":
        result.sort((a, b) => b.average_score - a.average_score);
        break;
      case "genre":
        result.sort((a, b) => (a.genres[0] ?? "").localeCompare(b.genres[0] ?? ""));
        break;
      case "picker":
        result.sort((a, b) => a.picker_name.localeCompare(b.picker_name));
        break;
      case "divisive":
        result.sort((a, b) => b.score_variance - a.score_variance);
        break;
    }

    return result;
  }, [entries, search, genreFilter, pickerFilter, sortMode]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function resetFilters() {
    setSearch("");
    setSortMode("newest");
    setGenreFilter("");
    setPickerFilter("");
    setVisibleCount(PAGE_SIZE);
  }

  const hasActiveFilters = search || genreFilter || pickerFilter || sortMode !== "newest";

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="min-w-[140px] flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />

        <label className="flex items-center gap-2 text-sm text-foreground/60">
          Sort by
          <select
            value={sortMode}
            onChange={(e) => {
              setSortMode(e.target.value as SortMode);
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground/60">
          Genre
          <select
            value={genreFilter}
            onChange={(e) => {
              setGenreFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="">All</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground/60">
          Picker
          <select
            value={pickerFilter}
            onChange={(e) => {
              setPickerFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="">All</option>
            {pickers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="rounded-lg border border-border px-3 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/5"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-foreground/50">
        {filtered.length} {filtered.length === 1 ? "movie" : "movies"}
      </p>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visible.map((entry) => (
            <MovieCard key={entry.movie_id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-foreground/60">No movies found</p>
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            Load more ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
