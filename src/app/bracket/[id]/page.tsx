import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Tournament, Player, Bracket, Pick } from "@/lib/types";
import BracketView from "@/components/bracket/Bracket";

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
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Private Bracket</h1>
          <p className="text-gray-600 mb-6">
            This bracket is private and can only be viewed by its owner.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            &larr; Back to Tournaments
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
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm mb-2 inline-block"
        >
          &larr; Back to Tournaments
        </Link>

        {/* Bracket title */}
        <h1 className="text-2xl md:text-3xl font-bold">
          {bracketName || `${ownerName}'s Bracket`}
        </h1>
        {bracketName && (
          <p className="text-gray-600">by {ownerName}</p>
        )}

        {/* Tournament info */}
        <p className="text-gray-500 text-sm mt-1">
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
      />
    </main>
  );
}
