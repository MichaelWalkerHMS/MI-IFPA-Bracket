import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Tournament, Player, Bracket, Pick } from "@/lib/types";
import BracketView from "@/components/bracket/Bracket";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentPage({ params }: PageProps) {
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

  // Fetch players for this tournament
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("tournament_id", id)
    .order("seed", { ascending: true });

  // Fetch user's bracket and picks if logged in
  let userBracket: Bracket | null = null;
  let userPicks: Pick[] = [];

  if (user) {
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
            href="/"
            className="text-blue-600 hover:underline text-sm mb-2 inline-block"
          >
            &larr; Back to Tournaments
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-600">
            {tournament.player_count} players &bull;{" "}
            <span
              className={
                isLocked ? "text-red-600 font-medium" : "text-green-600"
              }
            >
              {isLocked ? "Predictions Locked" : "Predictions Open"}
            </span>
          </p>
          {!isLocked && (
            <p className="text-sm text-gray-500 mt-1">
              Lock date: {formattedLockDate}
            </p>
          )}
        </div>

        {/* Auth status */}
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Log Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Login prompt for guests */}
      {!user && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
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

      {/* Bracket */}
      <BracketView
        tournament={tournament as Tournament}
        players={(players || []) as Player[]}
        existingBracket={userBracket}
        existingPicks={userPicks}
        isLocked={isLocked}
        isLoggedIn={!!user}
      />
    </main>
  );
}
