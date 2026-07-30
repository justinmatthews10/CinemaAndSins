import type { Review } from "@/types/review";

export function calculateAverage(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.score, 0);
  return sum / reviews.length;
}

export function scoreDistribution(reviews: Review[]): Record<number, number> {
  const dist: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) dist[i] = 0;
  reviews.forEach((r) => {
    const bucket = Math.floor(r.score);
    dist[bucket] = (dist[bucket] || 0) + 1;
  });
  return dist;
}

export function scoreVariance(reviews: Review[]): number {
  if (reviews.length < 2) return 0;
  const avg = calculateAverage(reviews);
  const sumSquares = reviews.reduce((acc, r) => acc + Math.pow(r.score - avg, 2), 0);
  return sumSquares / reviews.length;
}

export function scoreBadgeColor(score: number): "gold" | "green" | "yellow" | "red" {
  if (score >= 9) return "gold";
  if (score >= 7) return "green";
  if (score >= 5) return "yellow";
  return "red";
}
