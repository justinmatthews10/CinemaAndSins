"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { RotationEditor } from "@/components/RotationEditor";
import { PageHeading } from "@/components/PageHeading";
import type { RotationEntry } from "@/types/rotation";
import type { Member } from "@/types/member";

export default function AdminPage() {
  const router = useRouter();
  const { user, member, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [rotation, setRotation] = useState<RotationEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    if (!user || !member) {
      router.push("/login");
      return;
    }

    if (!member.is_admin) {
      router.push("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [authLoading, user, member, router, loadData]);

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    clearMessages();
    const sorted = [...rotation].sort((a, b) => a.order_index - b.order_index);
    const active = sorted.filter((r) => r.is_active);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= active.length) return;

    const entryA = active[index];
    const entryB = active[swapIndex];

    // Swap order_index values
    const updates = [
      { id: entryA.id, order_index: entryB.order_index },
      { id: entryB.id, order_index: entryA.order_index },
    ];

    for (const u of updates) {
      const { error: err } = await supabase
        .from("rotation")
        .update({ order_index: u.order_index })
        .eq("id", u.id);
      if (err) {
        setError("Failed to reorder rotation");
        return;
      }
    }

    await loadData();
    setSuccess("Rotation order updated");
  }

  async function handleToggleActive(memberId: string, isActive: boolean) {
    clearMessages();
    const { error: err } = await supabase
      .from("rotation")
      .update({ is_active: isActive })
      .eq("member_id", memberId);

    if (err) {
      setError("Failed to update rotation status");
      return;
    }

    await loadData();
    setSuccess(isActive ? "Member activated" : "Member deactivated");
  }

  async function handleSkip(memberId: string) {
    clearMessages();
    const sorted = [...rotation].sort((a, b) => a.order_index - b.order_index);
    const active = sorted.filter((r) => r.is_active);
    const entry = active.find((r) => r.member_id === memberId);
    if (!entry) return;

    // Bump to end of current cycle by adding active.length to order_index
    const { error: err } = await supabase
      .from("rotation")
      .update({ order_index: entry.order_index + active.length })
      .eq("id", entry.id);

    if (err) {
      setError("Failed to skip member");
      return;
    }

    await loadData();
    setSuccess(`${members.find((m) => m.id === memberId)?.name} skipped to next cycle`);
  }

  async function handleAdd(memberId: string) {
    clearMessages();
    // Add at the end of the rotation
    const maxOrder = Math.max(0, ...rotation.map((r) => r.order_index));
    const { error: err } = await supabase.from("rotation").insert({
      member_id: memberId,
      order_index: maxOrder + 1,
      is_active: true,
    });

    if (err) {
      setError("Failed to add member to rotation");
      return;
    }

    await loadData();
    setSuccess("Member added to rotation");
  }

  if (authLoading || loadingData) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="text-foreground/60">Loading...</p>
      </main>
    );
  }

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

        {error && (
          <div className="mb-4 rounded-lg border border-accent-secondary/30 bg-accent-secondary/10 p-4 text-sm text-accent-secondary">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </div>
        )}

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
