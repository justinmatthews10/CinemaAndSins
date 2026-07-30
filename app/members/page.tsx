import { getMembers } from "@/lib/supabase/getMembers";
import { MemberCard } from "@/components/MemberCard";
import { PageHeading } from "@/components/PageHeading";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <PageHeading className="mb-8">Members</PageHeading>

        {members.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <MemberCard key={member.id} summary={member} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-foreground/60">No approved members yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
