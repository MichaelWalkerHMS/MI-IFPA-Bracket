import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Tournament } from "@/lib/types";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all tournaments (admin can see all, including inactive)
  const { data: tournaments, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching tournaments:", error);
  }

  const tournamentList = (tournaments || []) as Tournament[];

  // Group by status
  const upcoming = tournamentList.filter((t) => t.status === "upcoming");
  const inProgress = tournamentList.filter((t) => t.status === "in_progress");
  const completed = tournamentList.filter((t) => t.status === "completed");

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-600 mt-1">
            Manage tournaments, players, and results
          </p>
        </div>
        <Link
          href="/admin/tournament/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + New Tournament
        </Link>
      </div>

      {/* Tournament Sections */}
      {inProgress.length > 0 && (
        <TournamentSection
          title="In Progress"
          tournaments={inProgress}
          badgeColor="bg-yellow-100 text-yellow-800"
        />
      )}

      {upcoming.length > 0 && (
        <TournamentSection
          title="Upcoming"
          tournaments={upcoming}
          badgeColor="bg-blue-100 text-blue-800"
        />
      )}

      {completed.length > 0 && (
        <TournamentSection
          title="Completed"
          tournaments={completed}
          badgeColor="bg-green-100 text-green-800"
        />
      )}

      {tournamentList.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No tournaments yet.</p>
          <Link
            href="/admin/tournament/new"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Create your first tournament
          </Link>
        </div>
      )}
    </div>
  );
}

function TournamentSection({
  title,
  tournaments,
  badgeColor,
}: {
  title: string;
  tournaments: Tournament[];
  badgeColor: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {tournaments.map((tournament) => (
          <TournamentRow
            key={tournament.id}
            tournament={tournament}
            badgeColor={badgeColor}
          />
        ))}
      </div>
    </div>
  );
}

function TournamentRow({
  tournament,
  badgeColor,
}: {
  tournament: Tournament;
  badgeColor: string;
}) {
  const startDate = new Date(tournament.start_date);
  const formattedDate = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/admin/tournament/${tournament.id}`}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div>
          <h3 className="font-medium text-gray-900">{tournament.name}</h3>
          <p className="text-sm text-gray-500">
            {formattedDate} &bull; {tournament.player_count} players
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
          {tournament.status.replace("_", " ")}
        </span>
        {!tournament.is_active && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Hidden
          </span>
        )}
        <span className="text-gray-400">&rarr;</span>
      </div>
    </Link>
  );
}
