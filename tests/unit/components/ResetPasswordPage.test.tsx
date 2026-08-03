import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "@/app/reset-password/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

// Mock Supabase client
const mockUpdateUser = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders password and confirm password inputs", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/^password$/i), "12345");
    await user.type(screen.getByLabelText(/confirm password/i), "12345");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("shows error when passwords don't match", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("calls updateUser with new password on valid submit", async () => {
    const user = userEvent.setup();
    mockUpdateUser.mockResolvedValue({ error: null });
    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/^password$/i), "newpassword123");
    await user.type(screen.getByLabelText(/confirm password/i), "newpassword123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: "newpassword123" });
    });
  });

  it("redirects to /login after successful reset", async () => {
    const user = userEvent.setup();
    mockUpdateUser.mockResolvedValue({ error: null });
    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/^password$/i), "newpassword123");
    await user.type(screen.getByLabelText(/confirm password/i), "newpassword123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows error message on API failure", async () => {
    const user = userEvent.setup();
    mockUpdateUser.mockResolvedValue({
      error: { message: "Token expired" },
    });
    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/^password$/i), "newpassword123");
    await user.type(screen.getByLabelText(/confirm password/i), "newpassword123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    expect(await screen.findByText(/token expired/i)).toBeInTheDocument();
  });

  it("disables button while loading", async () => {
    const user = userEvent.setup();
    mockUpdateUser.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/^password$/i), "newpassword123");
    await user.type(screen.getByLabelText(/confirm password/i), "newpassword123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
