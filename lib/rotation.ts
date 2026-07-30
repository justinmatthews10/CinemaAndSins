import type { RotationEntry } from "@/types/rotation";

export function getNextPicker(rotation: RotationEntry[]): string | null {
  const active = rotation
    .filter((r) => r.is_active)
    .sort((a, b) => a.order_index - b.order_index);
  if (active.length === 0) return null;
  return active[0].member_id;
}

export function advanceRotation(rotation: RotationEntry[]): RotationEntry[] {
  const active = rotation
    .filter((r) => r.is_active)
    .sort((a, b) => a.order_index - b.order_index);
  if (active.length === 0) return rotation;

  const first = active[0];
  return rotation.map((r) => {
    if (r.id === first.id) {
      return { ...r, order_index: r.order_index + active.length };
    }
    return r;
  });
}

export function skipMember(rotation: RotationEntry[], memberId: string): RotationEntry[] {
  const active = rotation
    .filter((r) => r.is_active)
    .sort((a, b) => a.order_index - b.order_index);
  const target = active.find((r) => r.member_id === memberId);
  if (!target) return rotation;

  return rotation.map((r) => {
    if (r.id === target.id) {
      return { ...r, order_index: r.order_index + active.length };
    }
    return r;
  });
}
