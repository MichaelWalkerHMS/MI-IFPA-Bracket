import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeaderboard } from "./actions";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import AuthHeader from "@/components/AuthHeader";
import SettingsButton from "@/components/SettingsButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentHubPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  // Check if predictions are locked
  const isLocked = new Date(tournament.lock_date) <= new Date();

  // Format dates for display
  const lockDate = new Date(tournament.lock_date);
  const formattedLockDate = lockDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  // Fetch leaderboard data
  const { entries, userBracketId } = await getLeaderboard(id);

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            href="/"
            className="text-[rgb(var(--color-accent-primary))] hover:underline text-sm mb-2 inline-block"
          >
            &larr; Back to Tournaments
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{tournament.name}</h1>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {tournament.player_count} players &bull;{" "}
            <span
              className={
                isLocked ? "text-[rgb(var(--color-error-icon))] font-medium" : "text-[rgb(var(--color-success-icon))]"
              }
            >
              {isLocked ? "Predictions Locked" : "Predictions Open"}
            </span>
          </p>
          {!isLocked && (
            <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">
              Lock date: {formattedLockDate}
            </p>
          )}
        </div>

        {/* Auth status */}
        <div className="flex items-center gap-2">
          <SettingsButton />
          <AuthHeader />
        </div>
      </div>

      {/* User CTA Section */}
      <div className="mb-6">
        {user ? (
          <div className="p-4 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg">
            {userBracketId ? (
              <div className="flex items-center justify-between">
                <p className="text-[rgb(var(--color-text-primary))]">
                  You have a bracket for this tournament.
                </p>
                <Link
                  href={`/tournament/${id}/edit`}
                  className="px-4 py-2 bg-[rgb(var(--color-accent-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-accent-hover))] font-medium"
                >
                  View/Edit Your Bracket
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-[rgb(var(--color-text-primary))]">
                  {isLocked
                    ? "Predictions are locked for this tournament."
                    : "You haven't created a bracket yet."}
                </p>
                {!isLocked && (
                  <Link
                    href={`/tournament/${id}/edit`}
                    className="px-4 py-2 bg-[rgb(var(--color-accent-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-accent-hover))] font-medium"
                  >
                    Create Your Bracket
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-[rgb(var(--color-accent-light))] border border-[rgb(var(--color-accent-primary))] rounded-lg">
            <p className="text-[rgb(var(--color-accent-text))]">
              <Link href="/login" className="font-medium hover:underline">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/signup" className="font-medium hover:underline">
                sign up
              </Link>{" "}
              to create your bracket prediction!
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <Leaderboard entries={entries} currentUserId={user?.id || null} />
    </main>
  );
}
