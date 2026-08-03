"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateResetPasswordForm, mapAuthError } from "@/lib/supabase/auth";
import { AuthFormShell } from "@/components/AuthFormShell";
import { FormField } from "@/components/FormField";
import { primaryButtonClass } from "@/lib/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);

    const validation = validateResetPasswordForm({ password, confirmPassword });
    if (Object.keys(validation).length > 0) {
      setErrors(validation as Record<string, string>);
      return;
    }
    setErrors({});

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setAuthError(mapAuthError(error));
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <AuthFormShell
      title="Reset Password"
      error={authError}
      footerText="Remembered your password?"
      footerHref="/login"
      footerLinkText="Log in"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          id="reset-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          error={errors.password}
        />
        <FormField
          id="reset-confirm-password"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthFormShell>
  );
}
