import { describe, it, expect } from "vitest";
import { getAssignedPicker } from "@/lib/supabase/picks";
import type { RotationEntry } from "@/types/rotation";
import type { Pick } from "@/types/pick";

function makeRotation(memberIds: string[]): RotationEntry[] {
  return memberIds.map((id, i) => ({
    id: `rot-${i}`,
    order_index: i,
    member_id: id,
    is_active: true,
    updated_at: "2026-01-01",
  }));
}

function makePicks(pickers: { memberId: string; month: number; year: number }[]): Pick[] {
  return pickers.map((p, i) => ({
    id: `pick-${i}`,
    movie_id: `movie-${i}`,
    picker_member_id: p.memberId,
    month: p.month,
    year: p.year,
    watch_date: null,
    picker_note: null,
    status: "upcoming",
    created_at: "2026-01-01",
  }));
}

describe("getAssignedPicker", () => {
  it("returns first active rotation member when no picks exist (current month)", () => {
    const rotation = makeRotation(["member-a", "member-b", "member-c"]);
    const picks: Pick[] = [];

    // Current month should get the first member
    const now = new Date();
    const result = getAssignedPicker(
      rotation,
      picks,
      now.getMonth() + 1,
      now.getFullYear(),
    );
    expect(result).toBe("member-a");
  });

  it("advances rotation by month when no picks exist", () => {
    const rotation = makeRotation(["member-a", "member-b", "member-c"]);
    const picks: Pick[] = [];

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Next month should get the second member
    const nextDate = new Date(currentYear, currentMonth, 1); // currentMonth is 0-indexed here
    const nextResult = getAssignedPicker(
      rotation,
      picks,
      nextDate.getMonth() + 1,
      nextDate.getFullYear(),
    );
    expect(nextResult).toBe("member-b");

    // Month after that should get the third member
    const afterDate = new Date(currentYear, currentMonth + 1, 1);
    const afterResult = getAssignedPicker(
      rotation,
      picks,
      afterDate.getMonth() + 1,
      afterDate.getFullYear(),
    );
    expect(afterResult).toBe("member-c");

    // Third month should wrap back to first
    const wrapDate = new Date(currentYear, currentMonth + 2, 1);
    const wrapResult = getAssignedPicker(
      rotation,
      picks,
      wrapDate.getMonth() + 1,
      wrapDate.getFullYear(),
    );
    expect(wrapResult).toBe("member-a");
  });

  it("returns second member when first member already picked", () => {
    const rotation = makeRotation(["member-a", "member-b", "member-c"]);
    const picks = makePicks([{ memberId: "member-a", month: 6, year: 2026 }]);

    const result = getAssignedPicker(rotation, picks, 7, 2026);
    expect(result).toBe("member-b");
  });

  it("wraps around to first member after all have picked", () => {
    const rotation = makeRotation(["member-a", "member-b", "member-c"]);
    const picks = makePicks([
      { memberId: "member-a", month: 4, year: 2026 },
      { memberId: "member-b", month: 5, year: 2026 },
      { memberId: "member-c", month: 6, year: 2026 },
    ]);

    const result = getAssignedPicker(rotation, picks, 7, 2026);
    expect(result).toBe("member-a");
  });

  it("skips inactive rotation members", () => {
    const rotation: RotationEntry[] = [
      {
        id: "rot-0",
        order_index: 0,
        member_id: "member-a",
        is_active: true,
        updated_at: "",
      },
      {
        id: "rot-1",
        order_index: 1,
        member_id: "member-b",
        is_active: false,
        updated_at: "",
      },
      {
        id: "rot-2",
        order_index: 2,
        member_id: "member-c",
        is_active: true,
        updated_at: "",
      },
    ];
    const picks: Pick[] = [];

    // Current month with no picks → first active member
    const now = new Date();
    const result = getAssignedPicker(
      rotation,
      picks,
      now.getMonth() + 1,
      now.getFullYear(),
    );
    expect(result).toBe("member-a");
  });

  it("skips inactive member when advancing", () => {
    const rotation: RotationEntry[] = [
      {
        id: "rot-0",
        order_index: 0,
        member_id: "member-a",
        is_active: true,
        updated_at: "",
      },
      {
        id: "rot-1",
        order_index: 1,
        member_id: "member-b",
        is_active: false,
        updated_at: "",
      },
      {
        id: "rot-2",
        order_index: 2,
        member_id: "member-c",
        is_active: true,
        updated_at: "",
      },
    ];
    const picks = makePicks([{ memberId: "member-a", month: 6, year: 2026 }]);

    const result = getAssignedPicker(rotation, picks, 7, 2026);
    expect(result).toBe("member-c");
  });

  it("returns null when no active rotation members", () => {
    const rotation: RotationEntry[] = [
      {
        id: "rot-0",
        order_index: 0,
        member_id: "member-a",
        is_active: false,
        updated_at: "",
      },
    ];
    const picks: Pick[] = [];

    const result = getAssignedPicker(rotation, picks, 7, 2026);
    expect(result).toBeNull();
  });

  it("only counts picks before the target month", () => {
    const rotation = makeRotation(["member-a", "member-b"]);
    // Pick for August (after target July) should not affect July's assignment
    const picks = makePicks([{ memberId: "member-b", month: 8, year: 2026 }]);

    const result = getAssignedPicker(rotation, picks, 7, 2026);
    expect(result).toBe("member-a");
  });

  it("handles year boundary correctly", () => {
    const rotation = makeRotation(["member-a", "member-b"]);
    const picks = makePicks([
      { memberId: "member-a", month: 11, year: 2025 },
      { memberId: "member-b", month: 12, year: 2025 },
    ]);

    const result = getAssignedPicker(rotation, picks, 1, 2026);
    expect(result).toBe("member-a");
  });

  it("advances correctly when months are skipped (gaps in picks)", () => {
    // Rotation: a, b, c, d, e
    // Picks: a picks month 5, b picks month 6, then no pick for month 7
    // Month 7 should be c (not b again), month 8 should be d, month 9 should be e
    const rotation = makeRotation(["a", "b", "c", "d", "e"]);
    const picks = makePicks([
      { memberId: "a", month: 5, year: 2026 },
      { memberId: "b", month: 6, year: 2026 },
    ]);

    // Month 7 (skipped) should still advance to c
    expect(getAssignedPicker(rotation, picks, 7, 2026)).toBe("c");
    // Month 8 should be d
    expect(getAssignedPicker(rotation, picks, 8, 2026)).toBe("d");
    // Month 9 should be e
    expect(getAssignedPicker(rotation, picks, 9, 2026)).toBe("e");
    // Month 10 should wrap to a
    expect(getAssignedPicker(rotation, picks, 10, 2026)).toBe("a");
  });

  it("handles target month before earliest pick (negative offset)", () => {
    const rotation = makeRotation(["a", "b", "c"]);
    // Only pick is for month 8 by member b
    const picks = makePicks([{ memberId: "b", month: 8, year: 2026 }]);

    // Month 7 is before the anchor (month 8), should go backwards in rotation
    // anchor is b (index 1), monthsSinceAnchor = -1, offset = (1-1+3)%3 = 0 = a
    expect(getAssignedPicker(rotation, picks, 7, 2026)).toBe("a");
    // Month 6: monthsSinceAnchor = -2, offset = (1-2+3)%3 = 2 = c
    expect(getAssignedPicker(rotation, picks, 6, 2026)).toBe("c");
  });
});
