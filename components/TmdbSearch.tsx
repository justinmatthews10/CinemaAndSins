"use client";

import { useState, useEffect, useRef } from "react";
import { PosterImage } from "@/components/PosterImage";
import { inputClass } from "@/lib/ui";
import type { TmdbSearchResult } from "@/types/movie";

type TmdbSearchProps = {
  onSelect: (result: TmdbSearchResult) => void;
};

export function TmdbSearch({ onSelect }: TmdbSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();

    if (trimmed.length === 0) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(trimmed)}`);
        if (!res.ok) {
          throw new Error("Search failed");
        }
        const data = await res.json();
        setResults(data);
        setError(null);
        setHasSearched(true);
      } catch {
        setError("Error searching TMDB. Please try again.");
        setResults([]);
        setHasSearched(false);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const showResults = query.trim().length > 0 && hasSearched && !loading && !error;
  const showNoResults =
    query.trim().length > 0 && hasSearched && !loading && !error && results.length === 0;

  function handleSelect(result: TmdbSearchResult) {
    onSelect(result);
    setQuery("");
    setResults([]);
    setHasSearched(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a movie on TMDB..."
        className={inputClass}
        aria-label="Search for a movie"
      />

      {loading && <p className="mt-2 text-sm text-foreground/60">Searching TMDB...</p>}

      {error && <p className="mt-2 text-sm text-accent-secondary">{error}</p>}

      {showNoResults && (
        <p className="mt-2 text-sm text-foreground/60">
          No results found. You can enter movie details manually below.
        </p>
      )}

      {showResults && results.length > 0 && (
        <ul className="mt-2 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface">
          {results.map((result) => (
            <li key={result.tmdb_id}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/5"
              >
                <PosterImage
                  src={result.poster_url}
                  alt={result.title}
                  className="h-16 w-12 flex-shrink-0 rounded object-cover"
                  fallbackClassName="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded bg-foreground/10 text-xs text-foreground/40"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{result.title}</p>
                  {result.year && (
                    <p className="text-sm text-foreground/60">{result.year}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
