"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateSignupForm, mapAuthError } from "@/lib/supabase/auth";

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
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center font-[family-name:var(--font-playfair)] text-3xl font-bold">
          Join the Club
        </h1>

        {authError && (
          <div className="mb-6 rounded-lg border border-accent-secondary/50 bg-accent-secondary/10 px-4 py-3 text-sm text-accent-secondary">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="signup-name" className="mb-2 block text-sm font-medium">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none"
              placeholder="Your name"
              autoComplete="name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-accent-secondary">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-accent focus:outline-none"
              placeholder="At least 6 characters"
              autoComplete="new-password"
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
