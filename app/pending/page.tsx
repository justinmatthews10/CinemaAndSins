"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingPage() {
  const { user, member, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    // If approved, redirect home
    if (!loading && member?.is_approved) {
      router.push("/");
    }
  }, [user, member, loading, router]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <p className="text-foreground/60">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 font-[family-name:var(--font-playfair)] text-3xl font-bold">
          Pending Approval
        </h1>
        <p className="mb-8 text-foreground/70">
          Your account is waiting for an admin to approve your membership. You&apos;ll get
          access once approved.
        </p>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-surface-hover"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
