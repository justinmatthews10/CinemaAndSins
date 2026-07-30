import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock the Supabase browser client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(
    () =>
      ({
        auth: {
          getSession: vi.fn(() =>
            Promise.resolve({ data: { session: null }, error: null }),
          ),
          onAuthStateChange: vi.fn(
            (callback: (event: string, session: unknown) => void) => {
              // Simulate no session initially
              callback("INITIAL_SESSION", null);
              return {
                data: {
                  subscription: {
                    unsubscribe: vi.fn(),
                  },
                },
              };
            },
          ),
          signInWithPassword: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      }) as unknown as SupabaseClient,
  ),
}));

function TestConsumer() {
  const { user, member, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : "none"}</span>
      <span data-testid="member">{member ? member.name : "none"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children", () => {
    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("starts in loading state, then settles to no user", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    // Eventually settles
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("member").textContent).toBe("none");
  });

  it("provides auth context to children via useAuth hook", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    // The hook returned values, not threw
    expect(screen.getByTestId("user")).toBeInTheDocument();
  });
});
