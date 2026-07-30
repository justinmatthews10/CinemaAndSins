import { describe, it, expect } from "vitest";
import { getNextPicker, advanceRotation, skipMember } from "@/lib/rotation";
import type { RotationEntry } from "@/types/rotation";

function makeEntry(
  id: string,
  memberId: string,
  orderIndex: number,
  active = true,
): RotationEntry {
  return {
    id,
    order_index: orderIndex,
    member_id: memberId,
    is_active: active,
    updated_at: "2026-01-01",
  };
}

const baseRotation: RotationEntry[] = [
  makeEntry("1", "member-a", 0),
  makeEntry("2", "member-b", 1),
  makeEntry("3", "member-c", 2),
];

describe("getNextPicker", () => {
  it("returns the first active member by order", () => {
    expect(getNextPicker(baseRotation)).toBe("member-a");
  });

  it("returns null for empty rotation", () => {
    expect(getNextPicker([])).toBe(null);
  });

  it("skips inactive members", () => {
    const rotation = [
      makeEntry("1", "member-a", 0, false),
      makeEntry("2", "member-b", 1),
    ];
    expect(getNextPicker(rotation)).toBe("member-b");
  });
});

describe("advanceRotation", () => {
  it("moves the first member to the end", () => {
    const advanced = advanceRotation(baseRotation);
    expect(advanced.find((r) => r.member_id === "member-a")?.order_index).toBe(3);
  });
});

describe("skipMember", () => {
  it("bumps the skipped member to the end of the cycle", () => {
    const skipped = skipMember(baseRotation, "member-a");
    expect(skipped.find((r) => r.member_id === "member-a")?.order_index).toBe(3);
  });

  it("does nothing if member not found", () => {
    const skipped = skipMember(baseRotation, "member-x");
    expect(skipped).toEqual(baseRotation);
  });
});
