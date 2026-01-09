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
      className={`block border-b border-[rgb(var(--color-border-primary))] last:border-b-0 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors bg-[rgb(var(--color-bg-primary))] ${
        isCurrentUser ? "bg-[rgb(var(--color-accent-light))] hover:bg-[rgb(var(--color-accent-light))]" : ""
      }`}
    >
      <div className="flex items-center justify-between py-3 px-3 sm:px-4 gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Rank - fixed width */}
          <span className="text-[rgb(var(--color-text-muted))] text-sm w-5 sm:w-6 flex-shrink-0 text-center">
            {rank}
          </span>

          {/* Name section */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {isCurrentUser && (
              <span className="text-[rgb(var(--color-accent-primary))] text-sm flex-shrink-0">★</span>
            )}
            <span className={`font-medium truncate ${isCurrentUser ? "text-[rgb(var(--color-accent-text))]" : "text-[rgb(var(--color-text-primary))]"}`}>
              {displayName.primary}
            </span>
            {/* Secondary text - hide on mobile */}
            {displayName.secondary && (
              <span className="hidden sm:inline text-sm text-[rgb(var(--color-text-muted))] truncate">
                {displayName.secondary}
              </span>
            )}
            {isCurrentUser && !entry.is_public && (
              <span className="text-xs text-[rgb(var(--color-text-muted))] flex-shrink-0">(private)</span>
            )}
          </div>
        </div>

        {/* Score - fixed size */}
        <div className="font-mono text-base sm:text-lg font-bold px-2 sm:px-3 py-1 rounded bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] flex-shrink-0">
          {entry.score !== null ? entry.score : "--"}
        </div>
      </div>
    </Link>
  );
}
