"use client";

import type { Member } from "@/types/member";

type MemberManagerProps = {
  members: Member[];
  onApprove: (memberId: string) => void;
  onRemove: (memberId: string) => void;
  onToggleAdmin: (memberId: string, isAdmin: boolean) => void;
};

export function MemberManager({
  members,
  onApprove,
  onRemove,
  onToggleAdmin,
}: MemberManagerProps) {
  const pending = members.filter((m) => !m.is_approved);
  const approved = members.filter((m) => m.is_approved);

  if (members.length === 0) {
    return <p className="text-sm italic text-foreground/40">No members yet.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Pending approval */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-accent-secondary">
            Pending Approval ({pending.length})
          </h2>
          {pending.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 rounded-lg border border-accent-secondary/30 bg-surface p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-foreground/50">{member.email}</p>
              </div>
              <button
                onClick={() => onApprove(member.id)}
                className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-accent/80"
              >
                Approve
              </button>
              <button
                onClick={() => onRemove(member.id)}
                className="rounded border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:bg-foreground/5"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Approved members */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
          Approved ({approved.length})
        </h2>
        {approved.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {member.name}
                {member.is_admin && (
                  <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                    Admin
                  </span>
                )}
              </p>
              <p className="text-xs text-foreground/50">{member.email}</p>
            </div>
            <button
              onClick={() => onToggleAdmin(member.id, !member.is_admin)}
              className="rounded border border-border px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-foreground/5"
            >
              {member.is_admin ? "Remove admin" : "Make admin"}
            </button>
            <button
              onClick={() => onRemove(member.id)}
              className="rounded border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:bg-foreground/5"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
