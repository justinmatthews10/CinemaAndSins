"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateSignupForm, mapAuthError } from "@/lib/supabase/auth";
import { AuthFormShell } from "@/components/AuthFormShell";
import { FormField } from "@/components/FormField";
import { primaryButtonClass } from "@/lib/ui";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);

    const validation = validateSignupForm({ email, password, name });
    if (Object.keys(validation).length > 0) {
      setErrors(validation as Record<string, string>);
      return;
    }
    setErrors({});

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    setLoading(false);

    if (error) {
      setAuthError(mapAuthError(error));
      return;
    }

    // After signup, redirect to home.
    // The handle_new_user trigger creates a member row with is_approved = FALSE.
    // The user will see the pending approval screen.
    router.push("/");
    router.refresh();
  }

  return (
    <AuthFormShell
      title="Join the Club"
      error={authError}
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkText="Log in"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          id="signup-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          error={errors.name}
        />
        <FormField
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <FormField
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
          error={errors.password}
        />
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </AuthFormShell>
  );
}
