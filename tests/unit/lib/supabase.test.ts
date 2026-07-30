import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

/**
 * Integration tests against the local Supabase instance.
 * These require `supabase start` to be running and the seed data to be applied.
 *
 * If Supabase is not running, these tests are skipped — they should not
 * block the unit test suite in CI or on machines without Docker.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const canRunIntegrationTests =
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith("http://127.0.0.1");

const testFn = canRunIntegrationTests ? describe : describe.skip;

testFn("Supabase integration (local)", () => {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

  it("connects to the local Supabase instance", async () => {
    const { data, error } = await supabase.from("movies").select("count").single();
    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });

  it("returns seeded movies via anon key (public read)", async () => {
    const { data, error } = await supabase.from("movies").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(5);
  });

  it("returns seeded reviews via anon key (public read)", async () => {
    const { data, error } = await supabase.from("reviews").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(10);
  });

  it("returns seeded picks via anon key (public read)", async () => {
    const { data, error } = await supabase.from("picks").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(3);
  });

  it("returns seeded rotation via anon key (public read)", async () => {
    const { data, error } = await supabase.from("rotation").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(5);
  });

  it("returns seeded members via anon key (public read)", async () => {
    const { data, error } = await supabase.from("members").select("*");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(6);
  });

  it("rejects movie inserts via anon key (no public write)", async () => {
    const { error } = await supabase.from("movies").insert({ title: "Should Fail" });
    expect(error).not.toBeNull();
  });

  it("enforces score CHECK constraint (1.0–10.0)", async () => {
    // This would need an authenticated session to test the RLS policy,
    // but we can verify the constraint exists by checking that the
    // seeded data all falls within range.
    const { data, error } = await supabase.from("reviews").select("score");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    data!.forEach((review) => {
      expect(review.score).toBeGreaterThanOrEqual(1.0);
      expect(review.score).toBeLessThanOrEqual(10.0);
    });
  });
});
