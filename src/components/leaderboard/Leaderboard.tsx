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
      <div className="border border-[rgb(var(--color-border-primary))] rounded-lg p-8 text-center bg-[rgb(var(--color-bg-primary))]">
        <p className="text-[rgb(var(--color-text-muted))]">No brackets have been created yet.</p>
        <p className="text-[rgb(var(--color-text-muted))] text-sm mt-1">
          Be the first to make your predictions!
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[rgb(var(--color-border-primary))] rounded-lg overflow-hidden">
      <div className="bg-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] px-4 py-2 flex justify-between">
        <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">LEADERBOARD</span>
        <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Score</span>
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
