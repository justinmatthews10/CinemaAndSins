"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { RotationEditor } from "@/components/RotationEditor";
import { PageHeading } from "@/components/PageHeading";
import { StatusBanner } from "@/components/StatusBanner";
import { LoadingState } from "@/components/LoadingState";
import { getActiveRotation } from "@/lib/rotation";
import type { RotationEntry } from "@/types/rotation";
import type { Member } from "@/types/member";

export default function AdminPage() {
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [rotation, setRotation] = useState<RotationEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [status, setStatus] = useState<{
    msg: string;
    variant: "error" | "success";
  } | null>(null);

  const loadData = useCallback(async () => {
    const [{ data: rotData }, { data: memberData }] = await Promise.all([
      supabase.from("rotation").select("*").order("order_index"),
      supabase.from("members").select("*").order("name"),
    ]);
    setRotation((rotData ?? []) as RotationEntry[]);
    setMembers((memberData ?? []) as Member[]);
    setLoadingData(false);
  }, [supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !member) return router.push("/login");
    if (!member.is_admin) return router.push("/");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [authLoading, user, member, router, loadData]);

  /** Helper: run a mutation, reload data, and set success/error status. */
  async function mutate(
    op: () => Promise<{ error: { message: string } | null }>,
    successMsg: string,
  ) {
    setStatus(null);
    const result = await op();
    if (result.error) {
      setStatus({ msg: result.error.message ?? "Operation failed", variant: "error" });
      return;
    }
    await loadData();
    setStatus({ msg: successMsg, variant: "success" });
  }

  function memberName(id: string) {
    return members.find((m) => m.id === id)?.name ?? "Unknown";
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const active = getActiveRotation(rotation);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= active.length) return;

    const entryA = active[index];
    const entryB = active[swapIndex];

    await mutate(async () => {
      for (const { id, order_index } of [
        { id: entryA.id, order_index: entryB.order_index },
        { id: entryB.id, order_index: entryA.order_index },
      ]) {
        const { error } = await supabase
          .from("rotation")
          .update({ order_index })
          .eq("id", id);
        if (error) return { error };
      }
      return { error: null };
    }, "Rotation order updated");
  }

  async function handleToggleActive(memberId: string, isActive: boolean) {
    await mutate(
      async () =>
        supabase
          .from("rotation")
          .update({ is_active: isActive })
          .eq("member_id", memberId),
      isActive ? "Member activated" : "Member deactivated",
    );
  }

  async function handleSkip(memberId: string) {
    const active = getActiveRotation(rotation);
    const entry = active.find((r) => r.member_id === memberId);
    if (!entry) return;

    await mutate(
      async () =>
        supabase
          .from("rotation")
          .update({ order_index: entry.order_index + active.length })
          .eq("id", entry.id),
      `${memberName(memberId)} skipped to next cycle`,
    );
  }

  async function handleAdd(memberId: string) {
    const maxOrder = Math.max(0, ...rotation.map((r) => r.order_index));
    await mutate(
      async () =>
        supabase.from("rotation").insert({
          member_id: memberId,
          order_index: maxOrder + 1,
          is_active: true,
        }),
      "Member added to rotation",
    );
  }

  if (authLoading || loadingData) return <LoadingState />;

  if (!member?.is_admin) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="w-full max-w-md text-center">
          <PageHeading centered className="mb-4">
            Access Denied
          </PageHeading>
          <p className="mb-6 text-foreground/70">Only admins can manage the rotation.</p>
          <Link href="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeading>Rotation Management</PageHeading>

        {status && <StatusBanner message={status.msg} variant={status.variant} />}

        <RotationEditor
          rotation={rotation}
          members={members}
          onReorder={handleReorder}
          onToggleActive={handleToggleActive}
          onSkip={handleSkip}
          onAdd={handleAdd}
        />
      </div>
    </main>
  );
}
