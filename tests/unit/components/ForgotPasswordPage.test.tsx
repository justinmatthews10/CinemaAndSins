import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "@/app/forgot-password/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

// Mock Supabase client
const mockResetPasswordForEmail = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email input and submit button", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("renders 'Back to login' link", () => {
    render(<ForgotPasswordPage />);
    const link = screen.getByRole("link", { name: /log in/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);
    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    await user.type(input, "notanemail");
    expect(input.value).toBe("notanemail");
    const form = screen
      .getByRole("button", { name: /send reset link/i })
      .closest("form")!;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("calls resetPasswordForEmail with valid email and redirect URL", async () => {
    const user = userEvent.setup();
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
        redirectTo: expect.stringContaining("/reset-password"),
      });
    });
  });

  it("shows success message after email sent", async () => {
    const user = userEvent.setup();
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
  });

  it("hides form after successful submission", async () => {
    const user = userEvent.setup();
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /send reset link/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows error message on API failure", async () => {
    const user = userEvent.setup();
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "Rate limit exceeded" },
    });
    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
  });

  it("disables button while loading", async () => {
    const user = userEvent.setup();
    mockResetPasswordForEmail.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
