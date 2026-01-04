import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Tournament, Player } from "@/lib/types";
import TournamentOverview from "./TournamentOverview";
import PlayerManagement from "./PlayerManagement";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function TournamentAdminPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;

  const supabase = await createClient();

  // Fetch tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (tournamentError || !tournament) {
    notFound();
  }

  // Fetch players
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("tournament_id", id)
    .order("seed", { ascending: true });

  // Fetch bracket count
  const { count: bracketCount } = await supabase
    .from("brackets")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", id);

  const typedTournament = tournament as Tournament;
  const typedPlayers = (players || []) as Player[];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "players", label: "Players" },
    { id: "results", label: "Results" },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/admin" className="text-blue-600 hover:underline text-sm">
          &larr; Back to Tournaments
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {typedTournament.name}
          </h1>
          <StatusBadge status={typedTournament.status} />
          {!typedTournament.is_active && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Hidden
            </span>
          )}
        </div>
        <p className="text-gray-600 mt-1">
          {typedTournament.player_count} players &bull; {bracketCount || 0}{" "}
          bracket(s) submitted
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={`/admin/tournament/${id}?tab=${t.id}`}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <TournamentOverview
          tournament={typedTournament}
          bracketCount={bracketCount || 0}
        />
      )}

      {tab === "players" && (
        <PlayerManagement
          tournament={typedTournament}
          players={typedPlayers}
        />
      )}

      {tab === "results" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">Results entry coming soon...</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    upcoming: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
