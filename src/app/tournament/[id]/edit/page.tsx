import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Tournament, Player, Bracket, Pick } from "@/lib/types";
import BracketView from "@/components/bracket/Bracket";
import AuthHeader from "@/components/AuthHeader";
import SettingsButton from "@/components/SettingsButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BracketEditorPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user - require authentication for editing
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  // Fetch players for this tournament
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("tournament_id", id)
    .order("seed", { ascending: true });

  // Fetch user's bracket and picks
  let userBracket: Bracket | null = null;
  let userPicks: Pick[] = [];

  const { data: bracket } = await supabase
    .from("brackets")
    .select("*")
    .eq("tournament_id", id)
    .eq("user_id", user.id)
    .single();

  if (bracket) {
    userBracket = bracket as Bracket;

    const { data: picks } = await supabase
      .from("picks")
      .select("*")
      .eq("bracket_id", bracket.id);

    userPicks = (picks || []) as Pick[];
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

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            href={`/tournament/${id}`}
            className="text-[rgb(var(--color-accent-primary))] hover:underline text-sm mb-2 inline-block"
          >
            &larr; Back to Tournament
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

      {/* Bracket Editor */}
      <BracketView
        tournament={tournament as Tournament}
        players={(players || []) as Player[]}
        existingBracket={userBracket}
        existingPicks={userPicks}
        isLocked={isLocked}
        isLoggedIn={true}
      />
    </main>
  );
}
