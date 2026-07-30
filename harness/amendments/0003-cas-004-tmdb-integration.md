# Amendment 0003 — CAS-004: TMDB Integration

**Date:** 2026-07-30
**Story:** CAS-004 — TMDB Integration
**Status:** Complete

## What was built

- `lib/tmdb.ts` — server-side TMDB client with `searchMovies` and `getMovieDetails` functions
  - Uses `TMDB_API_KEY` env var (server-side only, never exposed to client)
  - Normalizes TMDB API responses to `TmdbSearchResult` and `TmdbMovieDetails` types
  - Handles missing fields (null poster, null runtime, null director, missing release date)
  - Throws on API errors (401, 404, 429, network)
- `app/api/tmdb/search/route.ts` — `GET /api/tmdb/search?query={query}` route handler
  - 400 on missing/empty query
  - 500 on TMDB API errors
- `app/api/tmdb/[id]/route.ts` — `GET /api/tmdb/{id}` route handler
  - 400 on non-numeric id
  - 404 on movie not found
  - 500 on other TMDB API errors
- `types/movie.ts` — already existed with `TmdbSearchResult` and `TmdbMovieDetails` types

## Tests

- `tests/unit/lib/tmdb.test.ts` — 11 tests (search normalization, missing fields, API errors, URL construction)
- `tests/unit/api/tmdb.test.ts` — 8 tests (route handlers: valid input, missing params, error responses)

## Decisions

- TMDB client uses `fetch` with `api_key` query param (simpler than Bearer token for v3 API)
- Movie details endpoint uses `append_to_response=credits` to get director in a single call
- Poster URLs are built with `https://image.tmdb.org/t/p/w500` prefix
- Route handlers return JSON error objects with `{ error: string }` shape

## What changed from plan

- Nothing significant. Types already existed from scaffolding phase.
