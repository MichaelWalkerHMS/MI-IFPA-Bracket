"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { DashboardBracket } from "@/lib/types";
import BracketStatusBadge from "./BracketStatusBadge";

interface MyBracketsTableProps {
  brackets: DashboardBracket[];
}

interface TournamentGroup {
  tournamentId: string;
  tournamentName: string;
  playerCount: number;
  isLocked: boolean;
  brackets: DashboardBracket[];
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
          playerCount: bracket.player_count,
          isLocked: bracket.is_locked,
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
    <div className="space-y-3">
      {tournamentGroups.map((group) => {
        const isExpanded = expandedTournaments.has(group.tournamentId);

        return (
          <div
            key={group.tournamentId}
            className="border border-[rgb(var(--color-border-primary))] rounded-lg overflow-hidden"
          >
            {/* Tournament Header (Parent) */}
            <button
              onClick={() => toggleTournament(group.tournamentId)}
              className="w-full px-4 py-3 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                {/* Chevron */}
                <svg
                  className={`w-5 h-5 text-[rgb(var(--color-text-muted))] transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>

                {/* Tournament Info */}
                <div>
                  <div className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {group.tournamentName}
                  </div>
                  <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {group.playerCount} players
                    {" · "}
                    {group.brackets.length} bracket{group.brackets.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Leaderboard button */}
              <Link
                href={`/tournament/${group.tournamentId}`}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-[rgb(var(--color-accent-primary))] text-white hover:bg-[rgb(var(--color-accent-hover))] transition-colors"
              >
                Leaderboard
              </Link>
            </button>

            {/* Brackets List (Children) */}
            {isExpanded && (
              <div className="divide-y divide-[rgb(var(--color-border-primary))]">
                {group.brackets.map((bracket) => (
                  <div
                    key={bracket.id}
                    className="px-4 py-3 bg-[rgb(var(--color-bg-primary))] flex items-center justify-between gap-4"
                  >
                    {/* Bracket Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Indent indicator */}
                      <div className="w-5 flex justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-border-secondary))]" />
                      </div>

                      {/* Bracket name as link */}
                      <Link
                        href={`/bracket/${bracket.id}`}
                        className="font-medium text-[rgb(var(--color-accent-primary))] hover:underline truncate"
                      >
                        {bracket.name || "Unnamed Bracket"}
                      </Link>

                      {/* Status badge */}
                      <BracketStatusBadge isComplete={bracket.is_complete} />

                      {/* Private badge */}
                      {!bracket.is_public && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border-secondary))]">
                          Private
                        </span>
                      )}
                    </div>

                    {/* Score/Rank */}
                    <div className="flex items-center gap-4 text-sm shrink-0">
                      {bracket.rank !== null && (
                        <span className="text-[rgb(var(--color-text-secondary))]">
                          Rank <span className="font-semibold text-[rgb(var(--color-text-primary))]">#{bracket.rank}</span>
                        </span>
                      )}
                      {bracket.score > 0 && (
                        <span className="font-semibold text-[rgb(var(--color-accent-primary))]">
                          {bracket.score} pts
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!bracket.is_locked && (
                        <Link
                          href={`/bracket/${bracket.id}/edit`}
                          className="px-3 py-1.5 text-sm font-medium rounded-md bg-[rgb(var(--color-accent-primary))] text-white hover:bg-[rgb(var(--color-accent-hover))] transition-colors"
                        >
                          Edit
                        </Link>
                      )}
                      <Link
                        href={`/bracket/${bracket.id}`}
                        className="px-3 py-1.5 text-sm font-medium rounded-md bg-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-border-secondary))] transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
