import type { MovieSummary } from "@/lib/stats";

export type MemberSummary = {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  review_count: number;
  average_score: number;
  club_average: number;
  top_movie: MovieSummary;
  worst_movie: MovieSummary;
};

export type ProfileData = {
  member: {
    id: string;
    name: string;
    avatar_url: string | null;
    created_at: string;
  };
  reviewCount: number;
  averageScore: number;
  clubAverage: number;
  graderBadge: "harsh" | "easy" | null;
  mostRatedGenre: string | null;
  picks: {
    id: string;
    movie_id: string;
    title: string;
    movie_year: number | null;
    poster_url: string | null;
    month: number;
    year: number;
  }[];
  reviews: {
    id: string;
    score: number;
    review_text: string | null;
    tags: string[] | null;
    created_at: string;
    movie_id: string;
    movie_title: string;
    movie_year: number | null;
    movie_poster_url: string | null;
  }[];
} | null;
