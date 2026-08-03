import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  }),
}));

describe("LoginPage — forgot password link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Forgot password?' link below the Log In button", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: /forgot password/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/forgot-password");
  });

  it("link appears after the submit button", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /log in/i });
    const link = screen.getByRole("link", { name: /forgot password/i });
    // The link should come after the button in the DOM
    expect(link.compareDocumentPosition(button)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
  });
});
