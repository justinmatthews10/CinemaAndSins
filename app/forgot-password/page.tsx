"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateEmail, mapAuthError } from "@/lib/supabase/auth";
import { AuthFormShell } from "@/components/AuthFormShell";
import { FormField } from "@/components/FormField";
import { primaryButtonClass } from "@/lib/ui";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError(null);

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      setAuthError(mapAuthError(error));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <AuthFormShell
        title="Check Your Email"
        footerText="Remembered your password?"
        footerHref="/login"
        footerLinkText="Log in"
      >
        <p className="text-center text-foreground/80">
          We sent a password reset link to <strong>{email}</strong>. Click the link in the
          email to set a new password.
        </p>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Forgot Password"
      error={authError}
      footerText="Remembered your password?"
      footerHref="/login"
      footerLinkText="Log in"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          id="forgot-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={emailError ?? undefined}
        />
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </AuthFormShell>
  );
}
