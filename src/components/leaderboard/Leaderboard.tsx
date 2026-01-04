import type { LeaderboardEntry } from "@/lib/types";
import LeaderboardRow from "./LeaderboardRow";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
}

export default function Leaderboard({
  entries,
  currentUserId,
}: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No brackets have been created yet.</p>
        <p className="text-gray-400 text-sm mt-1">
          Be the first to make your predictions!
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between">
        <span className="text-sm font-medium text-gray-700">LEADERBOARD</span>
        <span className="text-sm font-medium text-gray-700">Score</span>
      </div>
      <div>
        {entries.map((entry, index) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            isCurrentUser={entry.owner_id === currentUserId}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
