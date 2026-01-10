"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { DashboardBracket } from "@/lib/types";

interface MyBracketsTableProps {
  brackets: DashboardBracket[];
}

interface TournamentGroup {
  tournamentId: string;
  tournamentName: string;
  brackets: DashboardBracket[];
}

// Down chevron icon (rotates when expanded)
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Right chevron icon for bracket cards
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// Lock icon for private brackets
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z" />
    </svg>
  );
}

export default function MyBracketsTable({ brackets }: MyBracketsTableProps) {
  // Group brackets by tournament
  const tournamentGroups = useMemo(() => {
    const groups = new Map<string, TournamentGroup>();

    for (const bracket of brackets) {
      const existing = groups.get(bracket.tournament_id);
      if (existing) {
        existing.brackets.push(bracket);
      } else {
        groups.set(bracket.tournament_id, {
          tournamentId: bracket.tournament_id,
          tournamentName: bracket.tournament_name,
          brackets: [bracket],
        });
      }
    }

    return Array.from(groups.values());
  }, [brackets]);

  // Track expanded state for each tournament
  const [expandedTournaments, setExpandedTournaments] = useState<Set<string>>(
    () => new Set(tournamentGroups.map((g) => g.tournamentId))
  );

  const toggleTournament = (tournamentId: string) => {
    setExpandedTournaments((prev) => {
      const next = new Set(prev);
      if (next.has(tournamentId)) {
        next.delete(tournamentId);
      } else {
        next.add(tournamentId);
      }
      return next;
    });
  };

  if (brackets.length === 0) {
    return (
      <div className="text-center py-8 text-[rgb(var(--color-text-secondary))]">
        <p>You haven&apos;t created any brackets yet.</p>
        <p className="text-sm mt-1">Use the form below to create your first bracket!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tournamentGroups.map((group) => {
        const isExpanded = expandedTournaments.has(group.tournamentId);

        return (
          <div key={group.tournamentId}>
            {/* Tournament Header */}
            <div className="w-full mb-2 flex items-center justify-between">
              <button
                onClick={() => toggleTournament(group.tournamentId)}
                className="flex items-center gap-2"
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.tournamentName} brackets`}
              >
                <span
                  className={`text-[rgb(var(--color-text-muted))] transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown />
                </span>
                <span className="text-[rgb(var(--color-text-secondary))] font-medium text-sm">
                  {group.tournamentName}
                </span>
              </button>
              <Link
                href={`/tournament/${group.tournamentId}`}
                className="text-xs text-[rgb(var(--color-accent-primary))] hover:text-[rgb(var(--color-accent-hover))] font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Leaderboard
              </Link>
            </div>

            {/* Bracket Cards */}
            {isExpanded && (
              <div className="space-y-2 pl-1">
                {group.brackets.map((bracket) => (
                  <Link
                    key={bracket.id}
                    href={bracket.is_locked ? `/bracket/${bracket.id}` : `/bracket/${bracket.id}/edit`}
                    className="w-full bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-xl p-3 flex items-center gap-3 border border-[rgb(var(--color-border-primary))] transition-colors"
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[rgb(var(--color-accent-primary))] font-medium text-sm truncate">
                          {bracket.name || "Unnamed Bracket"}
                        </h3>
                        {!bracket.is_public && (
                          <span className="text-[rgb(var(--color-text-muted))]">
                            <LockIcon />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score box and Chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {bracket.score > 0 && (
                        <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
                          <span className="text-[rgb(var(--color-text-secondary))] font-bold text-sm">
                            {bracket.score}
                          </span>
                        </div>
                      )}
                      <span className="text-[rgb(var(--color-text-muted))]">
                        <ChevronRight />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
