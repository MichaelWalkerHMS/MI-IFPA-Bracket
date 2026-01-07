import Link from "next/link";
import type { DashboardBracket } from "@/lib/types";
import BracketStatusBadge from "./BracketStatusBadge";

interface MyBracketsTableProps {
  brackets: DashboardBracket[];
}

export default function MyBracketsTable({ brackets }: MyBracketsTableProps) {
  if (brackets.length === 0) {
    return (
      <div className="text-center py-8 text-[rgb(var(--color-text-secondary))]">
        <p>You haven&apos;t created any brackets yet.</p>
        <p className="text-sm mt-1">Use the form below to create your first bracket!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-[rgb(var(--color-text-secondary))] border-b border-[rgb(var(--color-border-primary))]">
            <th className="pb-2 font-medium">Tournament</th>
            <th className="pb-2 font-medium">Players</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Rank</th>
            <th className="pb-2 font-medium">Score</th>
            <th className="pb-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
          {brackets.map((bracket) => (
            <tr key={bracket.id} className="group">
              <td className="py-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-[rgb(var(--color-text-muted))] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-[rgb(var(--color-text-primary))]">
                      {bracket.tournament_state} {bracket.tournament_year}
                    </div>
                    {bracket.name && (
                      <div className="text-xs text-[rgb(var(--color-text-muted))]">
                        {bracket.name}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {bracket.player_count} players
                </span>
              </td>
              <td className="py-3">
                <BracketStatusBadge isComplete={bracket.is_complete} />
              </td>
              <td className="py-3">
                {bracket.rank !== null ? (
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    #{bracket.rank}
                  </span>
                ) : (
                  <span className="text-[rgb(var(--color-text-muted))]">-</span>
                )}
              </td>
              <td className="py-3">
                {bracket.score > 0 ? (
                  <span className="font-semibold text-[rgb(var(--color-accent-primary))]">
                    {bracket.score} pts
                  </span>
                ) : (
                  <span className="text-[rgb(var(--color-text-muted))]">-</span>
                )}
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-3 text-sm">
                  {!bracket.is_locked && (
                    <Link
                      href={`/bracket/${bracket.id}/edit`}
                      className="text-[rgb(var(--color-accent-primary))] hover:underline"
                    >
                      Edit
                    </Link>
                  )}
                  <Link
                    href={`/bracket/${bracket.id}`}
                    className="text-[rgb(var(--color-accent-primary))] hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    href={`/tournament/${bracket.tournament_id}`}
                    className="text-[rgb(var(--color-accent-primary))] hover:underline"
                  >
                    Leaderboard
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
