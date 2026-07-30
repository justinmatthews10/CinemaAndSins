import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const results = await searchMovies(query.trim());
    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search TMDB";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
