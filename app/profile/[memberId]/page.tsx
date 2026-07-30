import { getProfile } from "@/lib/supabase/getProfile";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileStats } from "@/components/ProfileStats";
import { ProfilePickHistory } from "@/components/ProfilePickHistory";
import { ProfileReviewHistory } from "@/components/ProfileReviewHistory";
import { PageHeading } from "@/components/PageHeading";
import Link from "next/link";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const data = await getProfile(memberId);

  if (!data) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-24">
        <div className="w-full max-w-md text-center">
          <PageHeading centered className="mb-4">
            Member Not Found
          </PageHeading>
          <Link href="/members" className="text-accent hover:underline">
            Back to members
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <ProfileHeader
          name={data.member.name}
          avatarUrl={data.member.avatar_url}
          createdAt={data.member.created_at}
          averageScore={data.averageScore}
          clubAverage={data.clubAverage}
          graderBadge={data.graderBadge}
        />

        <ProfileStats
          reviewCount={data.reviewCount}
          averageScore={data.averageScore}
          clubAverage={data.clubAverage}
          mostRatedGenre={data.mostRatedGenre}
        />

        {/* Pick history */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
            Pick History ({data.picks.length})
          </h2>
          <ProfilePickHistory picks={data.picks} />
        </div>

        {/* Review history */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
            Review History ({data.reviews.length})
          </h2>
          <ProfileReviewHistory reviews={data.reviews} />
        </div>
      </div>
    </main>
  );
}
