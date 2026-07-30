import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Guards against environment-variable drift: every variable the app reads at
 * runtime must be documented in `.env.example` so a fresh clone can be
 * configured without reading source code.
 */
const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "TMDB_API_KEY",
] as const;

function readEnvExample(): string {
  return readFileSync(resolve(process.cwd(), ".env.example"), "utf-8");
}

describe(".env.example", () => {
  it("exists and is readable", () => {
    expect(() => readEnvExample()).not.toThrow();
  });

  it.each(REQUIRED_ENV_VARS)("documents %s", (key) => {
    const lines = readEnvExample()
      .split("\n")
      .filter((line) => !line.trim().startsWith("#"));
    expect(lines.some((line) => line.startsWith(`${key}=`))).toBe(true);
  });

  it("does not contain real secret values", () => {
    const content = readEnvExample();
    // Supabase keys are JWTs; TMDB tokens are long bearer strings. Placeholders
    // should be short, hyphenated, human-readable hints.
    expect(content).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}/);
  });
});
