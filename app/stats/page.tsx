import { getStats } from "@/lib/supabase/getStats";
import {
  leaderboard,
  mostDivisive,
  genreBreakdown,
  averageOverTime,
} from "@/lib/stats-aggregate";
import { StatsLeaderboard } from "@/components/StatsLeaderboard";
import { StatsDivisive } from "@/components/StatsDivisive";
import { StatsGenreBreakdown } from "@/components/StatsGenreBreakdown";
import { StatsTrendChart } from "@/components/StatsTrendChart";
import { PageHeading } from "@/components/PageHeading";

export default async function StatsPage() {
  const movies = await getStats();

  const { top, bottom } = leaderboard(movies, 5);
  const divisive = mostDivisive(movies, 5);
  const genres = genreBreakdown(movies);
  const trend = averageOverTime(movies);

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <PageHeading className="mb-0">Club Stats</PageHeading>

        {/* Leaderboard */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Leaderboard</h2>
          <StatsLeaderboard top={top} bottom={bottom} />
        </section>

        {/* Most Divisive */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Most Divisive</h2>
          <StatsDivisive entries={divisive} />
        </section>

        {/* Genre Breakdown */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Genre Breakdown</h2>
          <StatsGenreBreakdown genres={genres} />
        </section>

        {/* Average Over Time */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Club Average Over Time</h2>
          <StatsTrendChart points={trend} />
        </section>
      </div>
    </main>
  );
}
