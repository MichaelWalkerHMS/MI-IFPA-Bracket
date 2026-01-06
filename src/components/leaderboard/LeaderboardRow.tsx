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
      <div className="flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-[rgb(var(--color-text-muted))] text-sm w-6">{rank}</span>
          <div>
            <div className="flex items-center gap-2">
              {isCurrentUser && (
                <span className="text-[rgb(var(--color-accent-primary))] text-sm">★</span>
              )}
              <span
                className={`font-medium ${isCurrentUser ? "text-[rgb(var(--color-accent-text))]" : "text-[rgb(var(--color-text-primary))]"}`}
              >
                {displayName.primary}
                {isCurrentUser && !entry.is_public && (
                  <span className="ml-2 text-xs font-normal text-[rgb(var(--color-text-muted))]">(private)</span>
                )}
              </span>
            </div>
            {displayName.secondary && (
              <p className="text-sm text-[rgb(var(--color-text-muted))]">{displayName.secondary}</p>
            )}
          </div>
        </div>
        <div className="text-[rgb(var(--color-text-muted))] font-mono">
          {entry.score !== null ? entry.score : "--"}
        </div>
      </div>
    </Link>
  );
}
