import type { RotationEntry } from "@/types/rotation";

/** Returns active rotation entries sorted by order_index. */
export function getActiveRotation(rotation: RotationEntry[]): RotationEntry[] {
  return rotation
    .filter((r) => r.is_active)
    .sort((a, b) => a.order_index - b.order_index);
}

export function getNextPicker(rotation: RotationEntry[]): string | null {
  const active = getActiveRotation(rotation);
  return active.length === 0 ? null : active[0].member_id;
}

export function advanceRotation(rotation: RotationEntry[]): RotationEntry[] {
  const active = getActiveRotation(rotation);
  if (active.length === 0) return rotation;

  const first = active[0];
  return rotation.map((r) =>
    r.id === first.id ? { ...r, order_index: r.order_index + active.length } : r,
  );
}

export function skipMember(rotation: RotationEntry[], memberId: string): RotationEntry[] {
  const active = getActiveRotation(rotation);
  const target = active.find((r) => r.member_id === memberId);
  if (!target) return rotation;

  return rotation.map((r) =>
    r.id === target.id ? { ...r, order_index: r.order_index + active.length } : r,
  );
}
