"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateLoginForm, mapAuthError } from "@/lib/supabase/auth";
import { AuthFormShell } from "@/components/AuthFormShell";
import { FormField } from "@/components/FormField";
import { primaryButtonClass } from "@/lib/ui";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);

    const validation = validateLoginForm({ email, password });
    if (Object.keys(validation).length > 0) {
      setErrors(validation as Record<string, string>);
      return;
    }
    setErrors({});

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setAuthError(mapAuthError(error));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthFormShell
      title="Log In"
      error={authError}
      footerText="Don't have an account?"
      footerHref="/signup"
      footerLinkText="Sign up"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <FormField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
        />
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </AuthFormShell>
  );
}
