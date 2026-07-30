import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, validateSignupForm } from "@/lib/supabase/auth";

describe("validateEmail", () => {
  it("accepts valid email addresses", () => {
    expect(validateEmail("justin@example.com")).toBe(true);
    expect(validateEmail("a.b+c@sub.domain.org")).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("notanemail")).toBe(false);
    expect(validateEmail("missing@domain")).toBe(false);
    expect(validateEmail("@nodomain.com")).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts passwords of at least 6 characters", () => {
    expect(validatePassword("abcdef")).toBe(true);
    expect(validatePassword("password123")).toBe(true);
  });

  it("rejects passwords shorter than 6 characters", () => {
    expect(validatePassword("")).toBe(false);
    expect(validatePassword("12345")).toBe(false);
    expect(validatePassword("abc")).toBe(false);
  });
});

describe("validateSignupForm", () => {
  it("returns no errors for valid input", () => {
    const result = validateSignupForm({
      email: "justin@example.com",
      password: "password123",
      name: "Justin",
    });
    expect(result).toEqual({});
  });

  it("returns email error for invalid email", () => {
    const result = validateSignupForm({
      email: "notanemail",
      password: "password123",
      name: "Justin",
    });
    expect(result.email).toBeDefined();
  });

  it("returns password error for short password", () => {
    const result = validateSignupForm({
      email: "justin@example.com",
      password: "12345",
      name: "Justin",
    });
    expect(result.password).toBeDefined();
  });

  it("returns name error for empty name", () => {
    const result = validateSignupForm({
      email: "justin@example.com",
      password: "password123",
      name: "",
    });
    expect(result.name).toBeDefined();
  });
});
