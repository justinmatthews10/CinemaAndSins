"use client";

import type { RotationEntry } from "@/types/rotation";
import type { Member } from "@/types/member";

type RotationEditorProps = {
  rotation: RotationEntry[];
  members: Member[];
  onReorder: (index: number, direction: "up" | "down") => void;
  onToggleActive: (memberId: string, isActive: boolean) => void;
  onAdd?: (memberId: string) => void;
};

export function RotationEditor({
  rotation,
  members,
  onReorder,
  onToggleActive,
  onAdd,
}: RotationEditorProps) {
  const sorted = [...rotation].sort((a, b) => a.order_index - b.order_index);
  const active = sorted.filter((r) => r.is_active);
  const inactive = sorted.filter((r) => !r.is_active);

  // Members not in rotation at all
  const inRotationIds = new Set(rotation.map((r) => r.member_id));
  const notInRotation = members.filter((m) => !inRotationIds.has(m.id) && m.is_approved);

  function memberName(id: string): string {
    return members.find((m) => m.id === id)?.name ?? "Unknown";
  }

  return (
    <div className="space-y-6">
      {/* Active rotation */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
          Active Rotation ({active.length})
        </h2>
        {active.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"
          >
            {/* Order number */}
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
              {index + 1}
            </span>

            {/* Name */}
            <span className="flex-1 font-medium text-foreground">
              {memberName(entry.member_id)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onReorder(index, "up")}
                disabled={index === 0}
                aria-label={`Move ${memberName(entry.member_id)} up`}
                className="rounded border border-border px-2 py-1 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => onReorder(index, "down")}
                disabled={index === active.length - 1}
                aria-label={`Move ${memberName(entry.member_id)} down`}
                className="rounded border border-border px-2 py-1 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => onToggleActive(entry.member_id, false)}
                aria-label={`Deactivate ${memberName(entry.member_id)}`}
                className="rounded border border-border px-3 py-1 text-sm text-foreground/60 transition-colors hover:bg-foreground/5"
              >
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inactive members */}
      {inactive.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
            Inactive ({inactive.length})
          </h2>
          {inactive.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface/50 p-4 opacity-60"
            >
              <span className="flex-1 font-medium text-foreground">
                {memberName(entry.member_id)}
              </span>
              <button
                onClick={() => onToggleActive(entry.member_id, true)}
                aria-label={`Activate ${memberName(entry.member_id)}`}
                className="rounded border border-border px-3 py-1 text-sm text-foreground/70 transition-colors hover:bg-foreground/5"
              >
                Activate
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Members not in rotation */}
      {notInRotation.length > 0 && onAdd && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-foreground/50">
            Not in Rotation ({notInRotation.length})
          </h2>
          {notInRotation.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 rounded-lg border border-dashed border-border p-4"
            >
              <span className="flex-1 font-medium text-foreground">{member.name}</span>
              <button
                onClick={() => onAdd(member.id)}
                aria-label={`Add ${member.name} to rotation`}
                className="rounded bg-accent px-3 py-1 text-sm font-medium text-background transition-colors hover:bg-accent/80"
              >
                Add to rotation
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
