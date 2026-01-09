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
            <div className="px-4 py-3 bg-[rgb(var(--color-bg-secondary))] flex items-center justify-between">
              <button
                onClick={() => toggleTournament(group.tournamentId)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
              >
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
              </button>

              {/* Leaderboard button */}
              <Link
                href={`/tournament/${group.tournamentId}`}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-[rgb(var(--color-accent-primary))] text-white hover:bg-[rgb(var(--color-accent-hover))] transition-colors"
              >
                Leaderboard
              </Link>
            </div>

            {/* Brackets List (Children) */}
            {isExpanded && (
              <div className="divide-y divide-[rgb(var(--color-border-primary))]">
                {group.brackets.map((bracket) => (
                  <div
                    key={bracket.id}
                    className="px-3 sm:px-4 py-3 bg-[rgb(var(--color-bg-primary))]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      {/* Row 1 on mobile: Name + badges */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Indent indicator - hide on mobile to save space */}
                        <div className="hidden sm:flex w-5 justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-border-secondary))]" />
                        </div>

                        {/* Bracket name - allow truncation */}
                        <Link
                          href={`/bracket/${bracket.id}`}
                          className="font-medium text-[rgb(var(--color-accent-primary))] hover:underline truncate min-w-0"
                        >
                          {bracket.name || "Unnamed Bracket"}
                        </Link>

                        {/* Badges - prevent shrinking */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <BracketStatusBadge isComplete={bracket.is_complete} />
                          {!bracket.is_public && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border-secondary))]">
                              Private
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Row 2 on mobile: Score + Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        {/* Score/Rank - abbreviated on mobile */}
                        <div className="flex items-center gap-2 sm:gap-4 text-sm">
                          {bracket.rank !== null && (
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              <span className="sm:hidden">#</span>
                              <span className="hidden sm:inline">Rank #</span>
                              <span className="font-semibold text-[rgb(var(--color-text-primary))]">{bracket.rank}</span>
                            </span>
                          )}
                          {bracket.score > 0 && (
                            <span className="font-semibold text-[rgb(var(--color-accent-primary))]">
                              {bracket.score}
                              <span className="hidden sm:inline"> pts</span>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
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
