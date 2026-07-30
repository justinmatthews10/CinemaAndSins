import { formatScore } from "@/lib/utils";

type ProfileStatsProps = {
  reviewCount: number;
  averageScore: number;
  clubAverage: number;
  mostRatedGenre: string | null;
};

export function ProfileStats({
  reviewCount,
  averageScore,
  clubAverage,
  mostRatedGenre,
}: ProfileStatsProps) {
  const diff = averageScore - clubAverage;
  const diffText =
    diff > 0
      ? `+${formatScore(diff)} vs club`
      : diff < 0
        ? `${formatScore(diff)} vs club`
        : "Same as club";

  const stats = [
    { label: "Reviews", value: reviewCount.toString() },
    { label: "Average Score", value: formatScore(averageScore) },
    {
      label: "vs Club Average",
      value: averageScore > 0 ? diffText : "—",
    },
    { label: "Most Rated Genre", value: mostRatedGenre ?? "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-foreground/50">
            {stat.label}
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
