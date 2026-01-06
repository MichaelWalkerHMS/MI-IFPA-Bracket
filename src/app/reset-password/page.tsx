"use client";

import { useState } from "react";
import { resetPassword } from "@/app/auth/actions";
import SettingsButton from "@/components/SettingsButton";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await resetPassword(formData);

    // If we get here, there was an error (success redirects)
    if (result?.error) {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <SettingsButton />
      </div>

      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">
          Set New Password
        </h1>
        <p className="text-center text-[rgb(var(--color-text-secondary))] mb-8">
          Enter your new password below.
        </p>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              New Password
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border border-[rgb(var(--color-border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] bg-[rgb(var(--color-bg-primary))]"
              placeholder="Type your password again"
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
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
