import { getHistory } from "@/lib/supabase/getHistory";
import { HistoryControls } from "@/components/HistoryControls";
import { PageHeading } from "@/components/PageHeading";

export default async function HistoryPage() {
  const { entries, pickers, genres } = await getHistory();

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-7xl">
        <PageHeading className="mb-8">History</PageHeading>

        {entries.length > 0 ? (
          <HistoryControls entries={entries} pickers={pickers} genres={genres} />
        ) : (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-foreground/60">
              No movies in the archive yet. Once picks are locked, they&apos;ll appear
              here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
