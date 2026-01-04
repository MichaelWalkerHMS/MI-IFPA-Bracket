import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  rank: number;
}

function getBracketDisplayName(entry: LeaderboardEntry): {
  primary: string;
  secondary: string | null;
} {
  if (entry.name && entry.name.trim()) {
    return {
      primary: entry.name,
      secondary: `by ${entry.owner_display_name}`,
    };
  }
  return {
    primary: `${entry.owner_display_name}'s Bracket`,
    secondary: null,
  };
}

export default function LeaderboardRow({
  entry,
  isCurrentUser,
  rank,
}: LeaderboardRowProps) {
  const displayName = getBracketDisplayName(entry);

  return (
    <Link
      href={`/bracket/${entry.id}`}
      className={`block border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${
        isCurrentUser ? "bg-blue-50 hover:bg-blue-100" : ""
      }`}
    >
      <div className="flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm w-6">{rank}</span>
          <div>
            <div className="flex items-center gap-2">
              {isCurrentUser && (
                <span className="text-blue-600 text-sm">★</span>
              )}
              <span
                className={`font-medium ${isCurrentUser ? "text-blue-800" : "text-gray-900"}`}
              >
                {displayName.primary}
              </span>
            </div>
            {displayName.secondary && (
              <p className="text-sm text-gray-500">{displayName.secondary}</p>
            )}
          </div>
        </div>
        <div className="text-gray-400 font-mono">
          {entry.score !== null ? entry.score : "--"}
        </div>
      </div>
    </Link>
  );
}
