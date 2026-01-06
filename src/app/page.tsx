import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AuthHeader from "@/components/AuthHeader";
import SettingsButton from "@/components/SettingsButton";

export default async function Home() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch tournaments
  const { data: tournaments, error } = await supabase
    .from("tournaments")
    .select("*");

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

      {/* Welcome message for logged in users */}
      {user && (
        <div className="mb-8 p-4 bg-[rgb(var(--color-success-bg))] border border-[rgb(var(--color-success-icon))] rounded-lg">
          <p className="text-[rgb(var(--color-success-text))]">
            Welcome! You&apos;re logged in as <strong>{user.email}</strong>
          </p>
        </div>
      )}

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
    </main>
  );
}
