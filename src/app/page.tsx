import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AuthHeader from "@/components/AuthHeader";
import SettingsButton from "@/components/SettingsButton";
import { MyBracketsTable, CreateBracketWizard } from "@/components/dashboard";
import { loadUserBrackets } from "@/app/tournament/[id]/actions";
import type { Tournament } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch tournaments
  const { data: tournaments, error } = await supabase
    .from("tournaments")
    .select("*");

  // Fetch user brackets if logged in
  const userBrackets = user ? await loadUserBrackets() : [];

  // Logged-in user sees dashboard
  if (user) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">IFPA Bracket Predictor</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Predict the outcomes of IFPA Pinball State Championships
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SettingsButton />
            <AuthHeader />
          </div>
        </div>

        {/* My Brackets Section */}
        <div className="mb-8 p-6 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            My Brackets
          </h2>
          <MyBracketsTable brackets={userBrackets} />
        </div>

        {/* Create New Bracket Section */}
        <div className="p-6 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Bracket
          </h2>
          {error ? (
            <div className="text-[rgb(var(--color-error-icon))]">
              <p className="font-medium">Error loading tournaments:</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ) : tournaments && tournaments.length > 0 ? (
            <CreateBracketWizard tournaments={tournaments as Tournament[]} />
          ) : (
            <p className="text-[rgb(var(--color-text-secondary))]">No tournaments available yet.</p>
          )}
        </div>
      </main>
    );
  }

  // Logged-out user sees landing page with tournament list
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Auth status bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <SettingsButton />
        <AuthHeader />
      </div>

      <h1 className="text-4xl font-bold mb-4">
        IFPA Bracket Predictor
      </h1>
      <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-8">
        Predict the outcomes of IFPA Pinball State Championships
      </p>

      {/* Tournament list */}
      <div className="mt-4 p-6 border border-[rgb(var(--color-border-primary))] rounded-lg max-w-md w-full bg-[rgb(var(--color-bg-primary))]">
        <h2 className="text-xl font-semibold mb-4">Tournaments</h2>

        {error ? (
          <div className="text-[rgb(var(--color-error-icon))]">
            <p className="font-medium">Error loading tournaments:</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : tournaments && tournaments.length > 0 ? (
          <ul className="space-y-2">
            {tournaments.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tournament/${t.id}`}
                  className="block p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
                >
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {t.status} • {t.player_count} players
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[rgb(var(--color-text-secondary))]">No tournaments available yet.</p>
        )}
      </div>

      {/* Call to action for logged out users */}
      <div className="mt-8 text-center">
        <p className="text-[rgb(var(--color-text-secondary))] mb-4">
          Create an account to start predicting!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-2 bg-[rgb(var(--color-accent-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-accent-hover))] font-medium"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 border border-[rgb(var(--color-accent-primary))] text-[rgb(var(--color-accent-primary))] rounded-lg hover:bg-[rgb(var(--color-accent-light))] font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
