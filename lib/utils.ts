export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | null): string {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatScore(score: number): string {
  return score % 1 === 0 ? score.toFixed(0) : score.toFixed(1);
}
