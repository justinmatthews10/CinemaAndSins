import { getSchedule } from "@/lib/supabase/getSchedule";
import { ScheduleTimeline } from "@/components/ScheduleTimeline";
import { createClient } from "@/lib/supabase/server";

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { upcoming, past } = await getSchedule();

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-8 font-[family-name:var(--font-playfair)] text-3xl font-bold">
          Schedule
        </h1>
        <ScheduleTimeline
          slots={upcoming}
          pastSlots={past}
          currentUserId={user?.id ?? null}
        />
      </div>
    </main>
  );
}
