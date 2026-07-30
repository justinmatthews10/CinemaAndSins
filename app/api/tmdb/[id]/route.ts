import { NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/tmdb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const movieId = parseInt(id, 10);

  if (isNaN(movieId) || movieId <= 0) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const details = await getMovieDetails(movieId);
    return NextResponse.json(details);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch movie details";

    if (message.includes("404")) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
