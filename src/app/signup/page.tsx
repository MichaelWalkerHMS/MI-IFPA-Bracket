"use client";

import { useState } from "react";
import { signUp } from "@/app/auth/actions";
import Link from "next/link";
import SettingsButton from "@/components/SettingsButton";
import NavLinks from "@/components/NavLinks";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await signUp(formData);

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
          Create an Account
        </h1>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-1">
              <span className="flex items-center gap-1">
                Your Name
                <span
                  className="inline-flex items-center justify-center w-4 h-4 text-xs text-[rgb(var(--color-text-muted))] bg-[rgb(var(--color-bg-tertiary))] rounded-full cursor-help"
                  title="This is how your bracket will be identified on the public leaderboard if your bracket is made public."
                >
                  ?
                </span>
              </span>
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="w-full px-3 py-2 border border-[rgb(var(--color-border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] bg-[rgb(var(--color-bg-primary))]"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
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
              minLength={6}
              className="w-full px-3 py-2 border border-[rgb(var(--color-border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] bg-[rgb(var(--color-bg-primary))]"
              placeholder="At least 6 characters"
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[rgb(var(--color-text-secondary))]">
          Already have an account?{" "}
          <Link href="/login" className="text-[rgb(var(--color-accent-primary))] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
