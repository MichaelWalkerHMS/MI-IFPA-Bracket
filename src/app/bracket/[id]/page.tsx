import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Tournament, Player, Bracket, Pick } from "@/lib/types";
import BracketView from "@/components/bracket/Bracket";
import SettingsButton from "@/components/SettingsButton";
import NavLinks from "@/components/NavLinks";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BracketPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch bracket by ID
  const { data: bracket, error: bracketError } = await supabase
    .from("brackets")
    .select("*")
    .eq("id", id)
    .single();

  if (bracketError || !bracket) {
    notFound();
  }

  // Check access: public brackets viewable by all, private only by owner
  const isOwner = user?.id === bracket.user_id;
  if (!bracket.is_public && !isOwner) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <NavLinks />
          <SettingsButton />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Private Bracket</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            This bracket is private and can only be viewed by its owner.
          </p>
          <Link
            href={`/tournament/${bracket.tournament_id}`}
            className="text-[rgb(var(--color-accent-primary))] hover:underline"
          >
            &larr; Back to Tournament
          </Link>
        </div>
      </main>
    );
  }

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
    .eq("bracket_id", bracket.id);

  // Query seeding changes AFTER the bracket was last saved
  const { data: seedingChanges } = await supabase
    .from("seeding_change_log")
    .select("affected_seeds, created_at")
    .eq("tournament_id", bracket.tournament_id)
    .gt("created_at", bracket.updated_at)
    .order("created_at", { ascending: false });

  // Collect unique affected seeds and count changes
  const affectedSeeds = seedingChanges
    ? [...new Set(seedingChanges.flatMap((c) => c.affected_seeds))]
    : [];
  const seedingChangeCount = seedingChanges?.length || 0;

  // Fetch owner's profile for display name
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", bracket.user_id)
    .single();

  const ownerName = ownerProfile?.display_name || "Anonymous";
  const bracketName = bracket.name || null;

  // Check if predictions are locked
  const isLocked = new Date(tournament.lock_date) <= new Date();

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Navigation and Settings */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <NavLinks />
        <SettingsButton />
      </div>

      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/tournament/${bracket.tournament_id}`}
          className="text-[rgb(var(--color-accent-primary))] hover:underline text-sm mb-2 inline-block"
        >
          &larr; Back to Tournament
        </Link>

        {/* Bracket title */}
        <h1 className="text-2xl md:text-3xl font-bold">
          {bracketName || `${ownerName}'s Bracket`}
        </h1>
        {bracketName && (
          <p className="text-[rgb(var(--color-text-secondary))]">by {ownerName}</p>
        )}

        {/* Tournament info */}
        <p className="text-[rgb(var(--color-text-muted))] text-sm mt-1">
          {tournament.name}
        </p>
      </div>

      {/* Bracket */}
      <BracketView
        tournament={tournament as Tournament}
        players={(players || []) as Player[]}
        existingBracket={bracket as Bracket}
        existingPicks={(picks || []) as Pick[]}
        isLocked={isLocked}
        isLoggedIn={isOwner}
        bracketName={bracketName}
        ownerName={ownerName}
        affectedSeeds={affectedSeeds}
        seedingChangeCount={seedingChangeCount}
      />

      {/* CTA for logged-out users */}
      {!user && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center max-w-2xl mx-auto">
          <p className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Want to make your own predictions?
          </p>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            Create your bracket and compete on the leaderboard!
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-[rgb(var(--color-accent-primary))] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Create Your Bracket
          </Link>
        </div>
      )}
    </main>
  );
}
