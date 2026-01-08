"use client";

import { useState } from "react";
import { signIn } from "@/app/auth/actions";
import Link from "next/link";
import SettingsButton from "@/components/SettingsButton";
import NavLinks from "@/components/NavLinks";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await signIn(formData);

    // If we get here, there was an error (success redirects)
    if (result?.error) {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <NavLinks />
        <SettingsButton />
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Log In
        </h1>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[rgb(var(--color-border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] bg-[rgb(var(--color-bg-primary))]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-[rgb(var(--color-border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] bg-[rgb(var(--color-bg-primary))]"
              placeholder="Your password"
            />
          </div>

          {error && (
            <div className="p-3 bg-[rgb(var(--color-error-bg))] border border-[rgb(var(--color-error-border))] text-[rgb(var(--color-error-text))] rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[rgb(var(--color-accent-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-accent-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-[rgb(var(--color-accent-primary))] hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-[rgb(var(--color-text-secondary))]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[rgb(var(--color-accent-primary))] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
