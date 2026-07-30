"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateLoginForm, mapAuthError } from "@/lib/supabase/auth";

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
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center font-[family-name:var(--font-playfair)] text-3xl font-bold">
          Log In
        </h1>

        {authError && (
          <div className="mb-6 rounded-lg border border-accent-secondary/50 bg-accent-secondary/10 px-4 py-3 text-sm text-accent-secondary">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-accent-secondary">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-accent-secondary">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-background transition-colors hover:bg-accent/80 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
