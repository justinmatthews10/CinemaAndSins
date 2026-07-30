import { getSchedule } from "@/lib/supabase/getSchedule";
import { ScheduleTimeline } from "@/components/ScheduleTimeline";
import { PageHeading } from "@/components/PageHeading";
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
        <PageHeading>Schedule</PageHeading>
        <ScheduleTimeline
          slots={upcoming}
          pastSlots={past}
          currentUserId={user?.id ?? null}
        />
      </div>
    </main>
  );
}
