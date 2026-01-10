import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Tournament, Player, Bracket, Pick, Result } from "@/lib/types";
import BracketView from "@/components/bracket/Bracket";
import ResponsiveHeader from "@/components/ResponsiveHeader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BracketEditPage({ params }: PageProps) {
  const { id: bracketId } = await params;
  const supabase = await createClient();

  // Get current user - require authentication for editing
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch bracket (must belong to current user)
  const { data: bracket, error: bracketError } = await supabase
    .from("brackets")
    .select("*")
    .eq("id", bracketId)
    .eq("user_id", user.id)
    .single();

  if (bracketError || !bracket) {
    notFound();
  }

  const userBracket = bracket as Bracket;

  // Fetch tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", bracket.tournament_id)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  // Fetch players for this tournament
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("tournament_id", bracket.tournament_id)
    .order("seed", { ascending: true });

  // Fetch picks for this bracket
  const { data: picks } = await supabase
    .from("picks")
    .select("*")
    .eq("bracket_id", bracketId);

  const userPicks = (picks || []) as Pick[];

  // Fetch results for this tournament (for display purposes)
  const { data: results } = await supabase
    .from("results")
    .select("*")
    .eq("tournament_id", bracket.tournament_id);

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

  // Get bracket display name
  const bracketDisplayName = userBracket.name || "My Bracket";

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <Link
            href="/"
            className="text-[rgb(var(--color-accent-primary))] hover:underline text-sm mb-2 inline-block"
          >
            <span className="hidden sm:inline">&larr; Back to Dashboard</span>
            <span className="sm:hidden">&larr; Back</span>
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{tournament.name}</h1>
          <p className="text-sm sm:text-base text-[rgb(var(--color-text-secondary))]">
            {bracketDisplayName} &bull; {tournament.player_count} players &bull;{" "}
            <span
              className={
                isLocked ? "text-[rgb(var(--color-error-icon))] font-medium" : "text-[rgb(var(--color-success-icon))]"
              }
            >
              {isLocked ? "Predictions Locked" : "Predictions Open"}
            </span>
          </p>
          {!isLocked && (
            <p className="text-xs sm:text-sm text-[rgb(var(--color-text-muted))] mt-1">
              Lock date: {formattedLockDate}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0">
          <ResponsiveHeader />
        </div>
      </div>

      {/* Bracket Editor */}
      <BracketView
        tournament={tournament as Tournament}
        players={(players || []) as Player[]}
        existingBracket={userBracket}
        existingPicks={userPicks}
        results={(results || []) as Result[]}
        isLocked={isLocked}
        isLoggedIn={true}
      />
    </main>
  );
}
