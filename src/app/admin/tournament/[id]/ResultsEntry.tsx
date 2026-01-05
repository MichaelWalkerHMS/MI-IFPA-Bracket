"use client";

import { useState, useMemo } from "react";
import type { Tournament, Player, Result } from "@/lib/types";
import {
  ROUNDS,
  ROUND_NAMES,
  MATCHES_PER_ROUND,
  OPENING_ROUND_MATCHES,
  ROUND_OF_16_MATCHES,
  QUARTERS_MATCHES,
  SEMIS_MATCHES,
  FINALS_MATCH,
  CONSOLATION_MATCH,
  getPickKey,
} from "@/lib/bracket/constants";
import { saveResult, deleteResult, clearDownstreamResults } from "./actions";

interface ResultsEntryProps {
  tournament: Tournament;
  players: Player[];
  results: Result[];
}

export default function ResultsEntry({
  tournament,
  players,
  results: initialResults,
}: ResultsEntryProps) {
  const [results, setResults] = useState(initialResults);
  const [activeRound, setActiveRound] = useState<number>(ROUNDS.OPENING);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create a map for quick player lookup
  const playerMap = useMemo(() => {
    const map = new Map<number, Player>();
    players.forEach((p) => map.set(p.seed, p));
    return map;
  }, [players]);

  // Create a map for quick result lookup
  const resultMap = useMemo(() => {
    const map = new Map<string, Result>();
    results.forEach((r) => map.set(getPickKey(r.round, r.match_position), r));
    return map;
  }, [results]);

  // Get the winner of a match from results
  function getResultWinner(round: number, position: number): number | null {
    const result = resultMap.get(getPickKey(round, position));
    return result?.winner_seed ?? null;
  }

  // Get the loser of a match from results
  function getResultLoser(round: number, position: number): number | null {
    const result = resultMap.get(getPickKey(round, position));
    return result?.loser_seed ?? null;
  }

  // Get participants for a match based on round and position
  function getMatchParticipants(
    round: number,
    position: number
  ): { topSeed: number | null; bottomSeed: number | null } {
    switch (round) {
      case ROUNDS.OPENING: {
        const match = OPENING_ROUND_MATCHES[position];
        return { topSeed: match.topSeed, bottomSeed: match.bottomSeed };
      }

      case ROUNDS.ROUND_OF_16: {
        const match = ROUND_OF_16_MATCHES[position];
        const openingWinner = getResultWinner(
          ROUNDS.OPENING,
          match.openingWinnerPosition
        );
        return { topSeed: match.byeSeed, bottomSeed: openingWinner };
      }

      case ROUNDS.QUARTERS: {
        const match = QUARTERS_MATCHES[position];
        const topWinner = getResultWinner(
          ROUNDS.ROUND_OF_16,
          match.topSourcePosition
        );
        const bottomWinner = getResultWinner(
          ROUNDS.ROUND_OF_16,
          match.bottomSourcePosition
        );
        return { topSeed: topWinner, bottomSeed: bottomWinner };
      }

      case ROUNDS.SEMIS: {
        const match = SEMIS_MATCHES[position];
        const topWinner = getResultWinner(
          ROUNDS.QUARTERS,
          match.topSourcePosition
        );
        const bottomWinner = getResultWinner(
          ROUNDS.QUARTERS,
          match.bottomSourcePosition
        );
        return { topSeed: topWinner, bottomSeed: bottomWinner };
      }

      case ROUNDS.FINALS: {
        const topWinner = getResultWinner(
          ROUNDS.SEMIS,
          FINALS_MATCH.topSourcePosition
        );
        const bottomWinner = getResultWinner(
          ROUNDS.SEMIS,
          FINALS_MATCH.bottomSourcePosition
        );
        return { topSeed: topWinner, bottomSeed: bottomWinner };
      }

      case ROUNDS.CONSOLATION: {
        const topLoser = getResultLoser(
          ROUNDS.SEMIS,
          CONSOLATION_MATCH.topSourcePosition
        );
        const bottomLoser = getResultLoser(
          ROUNDS.SEMIS,
          CONSOLATION_MATCH.bottomSourcePosition
        );
        return { topSeed: topLoser, bottomSeed: bottomLoser };
      }

      default:
        return { topSeed: null, bottomSeed: null };
    }
  }

  // Get player name by seed
  function getPlayerName(seed: number | null): string {
    if (seed === null) return "TBD";
    const player = playerMap.get(seed);
    return player?.name ?? `Seed ${seed}`;
  }

  // Check if any downstream results exist
  function hasDownstreamResults(round: number): boolean {
    return results.some((r) => r.round > round);
  }

  // Handle saving a result
  async function handleSaveResult(
    position: number,
    winnerSeed: number,
    loserSeed: number,
    winnerGames?: number,
    loserGames?: number
  ) {
    const key = getPickKey(activeRound, position);
    setSaving(key);
    setError(null);

    // Check if there are downstream results that need clearing
    if (hasDownstreamResults(activeRound)) {
      const confirmed = confirm(
        "Changing this result will clear all results in later rounds. Continue?"
      );
      if (!confirmed) {
        setSaving(null);
        return;
      }
      // Clear downstream results
      const clearResult = await clearDownstreamResults(
        tournament.id,
        activeRound
      );
      if (clearResult.error) {
        setError(clearResult.error);
        setSaving(null);
        return;
      }
      // Update local state to remove downstream results
      setResults((prev) => prev.filter((r) => r.round <= activeRound));
    }

    const result = await saveResult(
      tournament.id,
      activeRound,
      position,
      winnerSeed,
      loserSeed,
      winnerGames,
      loserGames
    );

    if (result.error) {
      setError(result.error);
    } else {
      // Update local state
      setResults((prev) => {
        const filtered = prev.filter(
          (r) => !(r.round === activeRound && r.match_position === position)
        );
        return [
          ...filtered,
          {
            id: crypto.randomUUID(),
            tournament_id: tournament.id,
            round: activeRound,
            match_position: position,
            winner_seed: winnerSeed,
            loser_seed: loserSeed,
            winner_games: winnerGames ?? 0,
            loser_games: loserGames ?? 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      });
    }

    setSaving(null);
  }

  // Handle deleting a result
  async function handleDeleteResult(position: number) {
    const key = getPickKey(activeRound, position);

    // Check if there are downstream results
    if (hasDownstreamResults(activeRound)) {
      const confirmed = confirm(
        "Deleting this result will also clear all results in later rounds. Continue?"
      );
      if (!confirmed) return;

      const clearResult = await clearDownstreamResults(
        tournament.id,
        activeRound
      );
      if (clearResult.error) {
        setError(clearResult.error);
        return;
      }
      setResults((prev) => prev.filter((r) => r.round <= activeRound));
    }

    setSaving(key);
    setError(null);

    const result = await deleteResult(tournament.id, activeRound, position);

    if (result.error) {
      setError(result.error);
    } else {
      setResults((prev) =>
        prev.filter(
          (r) => !(r.round === activeRound && r.match_position === position)
        )
      );
    }

    setSaving(null);
  }

  // Get rounds to display (based on player count)
  const rounds =
    tournament.player_count === 24
      ? [
          ROUNDS.OPENING,
          ROUNDS.ROUND_OF_16,
          ROUNDS.QUARTERS,
          ROUNDS.SEMIS,
          ROUNDS.FINALS,
          ROUNDS.CONSOLATION,
        ]
      : [
          ROUNDS.ROUND_OF_16,
          ROUNDS.QUARTERS,
          ROUNDS.SEMIS,
          ROUNDS.FINALS,
          ROUNDS.CONSOLATION,
        ];

  // Count completed matches per round
  function getCompletedCount(round: number): number {
    return results.filter((r) => r.round === round).length;
  }

  return (
    <div className="space-y-6">
      {/* Round selector */}
      <div className="flex flex-wrap gap-2">
        {rounds.map((round) => {
          const total = MATCHES_PER_ROUND[round];
          const completed = getCompletedCount(round);
          const isComplete = completed === total;

          return (
            <button
              key={round}
              onClick={() => setActiveRound(round)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeRound === round
                  ? "bg-blue-600 text-white"
                  : isComplete
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {ROUND_NAMES[round]}
              <span className="ml-2 text-xs opacity-75">
                ({completed}/{total})
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Matches for selected round */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {ROUND_NAMES[activeRound]}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Select the winner for each match.{" "}
            {activeRound === ROUNDS.FINALS && "Enter game scores for the final."}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {Array.from({ length: MATCHES_PER_ROUND[activeRound] }).map(
            (_, position) => (
              <MatchResultInput
                key={position}
                position={position}
                round={activeRound}
                participants={getMatchParticipants(activeRound, position)}
                existingResult={resultMap.get(
                  getPickKey(activeRound, position)
                )}
                getPlayerName={getPlayerName}
                onSave={handleSaveResult}
                onDelete={handleDeleteResult}
                isSaving={saving === getPickKey(activeRound, position)}
                isFinal={activeRound === ROUNDS.FINALS}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

interface MatchResultInputProps {
  position: number;
  round: number;
  participants: { topSeed: number | null; bottomSeed: number | null };
  existingResult?: Result;
  getPlayerName: (seed: number | null) => string;
  onSave: (
    position: number,
    winnerSeed: number,
    loserSeed: number,
    winnerGames?: number,
    loserGames?: number
  ) => void;
  onDelete: (position: number) => void;
  isSaving: boolean;
  isFinal: boolean;
}

function MatchResultInput({
  position,
  participants,
  existingResult,
  getPlayerName,
  onSave,
  onDelete,
  isSaving,
  isFinal,
}: MatchResultInputProps) {
  const { topSeed, bottomSeed } = participants;
  const [winnerGames, setWinnerGames] = useState<number | undefined>(
    existingResult?.winner_games
  );
  const [loserGames, setLoserGames] = useState<number | undefined>(
    existingResult?.loser_games
  );

  const canEnterResult = topSeed !== null && bottomSeed !== null;
  const hasResult = existingResult !== undefined;

  function handleSelectWinner(winnerSeed: number) {
    if (!canEnterResult || isSaving) return;

    const loserSeed = winnerSeed === topSeed ? bottomSeed! : topSeed!;
    onSave(position, winnerSeed, loserSeed, winnerGames, loserGames);
  }

  function handleUpdateScores() {
    if (!existingResult || isSaving) return;
    onSave(
      position,
      existingResult.winner_seed,
      existingResult.loser_seed,
      winnerGames,
      loserGames
    );
  }

  return (
    <div className={`p-4 ${!canEnterResult ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-4">
        {/* Match number */}
        <span className="w-8 text-center text-sm font-mono text-gray-400">
          #{position + 1}
        </span>

        {/* Participants */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Top seed */}
          <button
            onClick={() => topSeed && handleSelectWinner(topSeed)}
            disabled={!canEnterResult || isSaving}
            className={`p-3 rounded-lg border text-left transition-colors ${
              existingResult?.winner_seed === topSeed
                ? "bg-green-100 border-green-500 text-green-800"
                : canEnterResult
                  ? "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  : "bg-gray-50 border-gray-200 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-2">
              {topSeed && (
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {topSeed}
                </span>
              )}
              <span className="font-medium">{getPlayerName(topSeed)}</span>
              {existingResult?.winner_seed === topSeed && (
                <span className="ml-auto text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
          </button>

          {/* Bottom seed */}
          <button
            onClick={() => bottomSeed && handleSelectWinner(bottomSeed)}
            disabled={!canEnterResult || isSaving}
            className={`p-3 rounded-lg border text-left transition-colors ${
              existingResult?.winner_seed === bottomSeed
                ? "bg-green-100 border-green-500 text-green-800"
                : canEnterResult
                  ? "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  : "bg-gray-50 border-gray-200 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-2">
              {bottomSeed && (
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {bottomSeed}
                </span>
              )}
              <span className="font-medium">{getPlayerName(bottomSeed)}</span>
              {existingResult?.winner_seed === bottomSeed && (
                <span className="ml-auto text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Game scores (for finals) */}
        {isFinal && hasResult && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="4"
              value={winnerGames ?? ""}
              onChange={(e) =>
                setWinnerGames(e.target.value ? parseInt(e.target.value) : undefined)
              }
              onBlur={handleUpdateScores}
              className="w-14 px-2 py-1 border border-gray-200 rounded text-center"
              placeholder="W"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min="0"
              max="3"
              value={loserGames ?? ""}
              onChange={(e) =>
                setLoserGames(e.target.value ? parseInt(e.target.value) : undefined)
              }
              onBlur={handleUpdateScores}
              className="w-14 px-2 py-1 border border-gray-200 rounded text-center"
              placeholder="L"
            />
          </div>
        )}

        {/* Delete button */}
        {hasResult && (
          <button
            onClick={() => onDelete(position)}
            disabled={isSaving}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Clear result"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Saving indicator */}
        {isSaving && (
          <span className="text-sm text-gray-400">Saving...</span>
        )}
      </div>
    </div>
  );
}
