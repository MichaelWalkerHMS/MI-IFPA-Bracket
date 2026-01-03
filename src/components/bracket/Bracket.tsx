"use client";

import { useState, useCallback } from "react";
import type { Tournament, Player, Bracket, Pick, PlayerMap } from "@/lib/types";
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
  OPENING_DISPLAY_ORDER,
  getPickKey,
} from "@/lib/bracket/constants";
import Round from "./Round";

interface BracketViewProps {
  tournament: Tournament;
  players: Player[];
  existingBracket: Bracket | null;
  existingPicks: Pick[];
  isLocked: boolean;
  isLoggedIn: boolean;
}

export default function BracketView({
  tournament,
  players,
  existingBracket,
  existingPicks,
  isLocked,
  isLoggedIn,
}: BracketViewProps) {
  // Create player lookup map (seed -> Player)
  const playerMap: PlayerMap = new Map(players.map((p) => [p.seed, p]));

  // Initialize picks from existing data
  const initialPicks = new Map<string, number>();
  for (const pick of existingPicks) {
    initialPicks.set(getPickKey(pick.round, pick.match_position), pick.winner_seed);
  }

  const [picks, setPicks] = useState<Map<string, number>>(initialPicks);
  const [isPublic, setIsPublic] = useState(existingBracket?.is_public ?? true);
  const [finalWinnerGames, setFinalWinnerGames] = useState<number | null>(
    existingBracket?.final_winner_games ?? null
  );
  const [finalLoserGames, setFinalLoserGames] = useState<number | null>(
    existingBracket?.final_loser_games ?? null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Get the winner of a specific match
  const getMatchWinner = useCallback(
    (round: number, position: number): number | null => {
      return picks.get(getPickKey(round, position)) ?? null;
    },
    [picks]
  );

  // Get the loser of a specific match (for consolation)
  const getMatchLoser = useCallback(
    (round: number, position: number): number | null => {
      const winner = getMatchWinner(round, position);
      if (winner === null) return null;

      // Find who was in that match
      const participants = getMatchParticipants(round, position);
      if (participants.topSeed === winner) return participants.bottomSeed;
      if (participants.bottomSeed === winner) return participants.topSeed;
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [picks]
  );

  // Get the two participants for a match based on round and position
  const getMatchParticipants = useCallback(
    (
      round: number,
      position: number
    ): { topSeed: number | null; bottomSeed: number | null } => {
      switch (round) {
        case ROUNDS.OPENING: {
          const match = OPENING_ROUND_MATCHES[position];
          return { topSeed: match.topSeed, bottomSeed: match.bottomSeed };
        }

        case ROUNDS.ROUND_OF_16: {
          const match = ROUND_OF_16_MATCHES[position];
          const openingWinner = getMatchWinner(
            ROUNDS.OPENING,
            match.openingWinnerPosition
          );
          return { topSeed: match.byeSeed, bottomSeed: openingWinner };
        }

        case ROUNDS.QUARTERS: {
          const match = QUARTERS_MATCHES[position];
          const topWinner = getMatchWinner(
            ROUNDS.ROUND_OF_16,
            match.topSourcePosition
          );
          const bottomWinner = getMatchWinner(
            ROUNDS.ROUND_OF_16,
            match.bottomSourcePosition
          );
          return { topSeed: topWinner, bottomSeed: bottomWinner };
        }

        case ROUNDS.SEMIS: {
          const match = SEMIS_MATCHES[position];
          const topWinner = getMatchWinner(
            ROUNDS.QUARTERS,
            match.topSourcePosition
          );
          const bottomWinner = getMatchWinner(
            ROUNDS.QUARTERS,
            match.bottomSourcePosition
          );
          return { topSeed: topWinner, bottomSeed: bottomWinner };
        }

        case ROUNDS.FINALS: {
          const topWinner = getMatchWinner(
            ROUNDS.SEMIS,
            FINALS_MATCH.topSourcePosition
          );
          const bottomWinner = getMatchWinner(
            ROUNDS.SEMIS,
            FINALS_MATCH.bottomSourcePosition
          );
          return { topSeed: topWinner, bottomSeed: bottomWinner };
        }

        case ROUNDS.CONSOLATION: {
          const topLoser = getMatchLoser(
            ROUNDS.SEMIS,
            CONSOLATION_MATCH.topSourcePosition
          );
          const bottomLoser = getMatchLoser(
            ROUNDS.SEMIS,
            CONSOLATION_MATCH.bottomSourcePosition
          );
          return { topSeed: topLoser, bottomSeed: bottomLoser };
        }

        default:
          return { topSeed: null, bottomSeed: null };
      }
    },
    [getMatchWinner, getMatchLoser]
  );

  // Handle picking a winner - clears downstream picks if the old winner was selected elsewhere
  const handlePick = useCallback(
    (round: number, position: number, winnerSeed: number) => {
      if (isLocked || !isLoggedIn) return;

      const key = getPickKey(round, position);
      const oldWinner = picks.get(key);

      if (oldWinner === winnerSeed) return; // No change

      const newPicks = new Map(picks);
      newPicks.set(key, winnerSeed);

      // Clear downstream picks that contained the old winner
      if (oldWinner !== undefined) {
        for (let r = round + 1; r <= ROUNDS.CONSOLATION; r++) {
          for (let p = 0; p < MATCHES_PER_ROUND[r]; p++) {
            const downstreamKey = getPickKey(r, p);
            if (newPicks.get(downstreamKey) === oldWinner) {
              newPicks.delete(downstreamKey);
            }
          }
        }
      }

      setPicks(newPicks);
      setIsDirty(true);
      setSaveMessage(null);
    },
    [picks, isLocked, isLoggedIn]
  );

  // Build match data for each round (with display order for opening round)
  const buildRoundMatches = (round: number) => {
    const matches = [];
    const matchCount = MATCHES_PER_ROUND[round];

    for (let displayIdx = 0; displayIdx < matchCount; displayIdx++) {
      // For opening round, use display order; for other rounds, use sequential order
      const position = round === ROUNDS.OPENING
        ? OPENING_DISPLAY_ORDER[displayIdx]
        : displayIdx;

      const participants = getMatchParticipants(round, position);
      const winner = getMatchWinner(round, position);
      matches.push({
        position,
        topSeed: participants.topSeed,
        bottomSeed: participants.bottomSeed,
        winnerSeed: winner,
      });
    }
    return matches;
  };

  // Get champion (winner of finals)
  const champion = getMatchWinner(ROUNDS.FINALS, 0);
  const championPlayer = champion ? playerMap.get(champion) : null;

  return (
    <div className="w-full">
      {/* Bracket container with horizontal scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          {/* Opening Round */}
          <Round
            round={ROUNDS.OPENING}
            roundName={ROUND_NAMES[ROUNDS.OPENING]}
            matches={buildRoundMatches(ROUNDS.OPENING)}
            playerMap={playerMap}
            onPick={handlePick}
            isLocked={isLocked}
            isLoggedIn={isLoggedIn}
          />

          {/* Round of 16 */}
          <Round
            round={ROUNDS.ROUND_OF_16}
            roundName={ROUND_NAMES[ROUNDS.ROUND_OF_16]}
            matches={buildRoundMatches(ROUNDS.ROUND_OF_16)}
            playerMap={playerMap}
            onPick={handlePick}
            isLocked={isLocked}
            isLoggedIn={isLoggedIn}
          />

          {/* Quarterfinals */}
          <Round
            round={ROUNDS.QUARTERS}
            roundName={ROUND_NAMES[ROUNDS.QUARTERS]}
            matches={buildRoundMatches(ROUNDS.QUARTERS)}
            playerMap={playerMap}
            onPick={handlePick}
            isLocked={isLocked}
            isLoggedIn={isLoggedIn}
          />

          {/* Semifinals */}
          <Round
            round={ROUNDS.SEMIS}
            roundName={ROUND_NAMES[ROUNDS.SEMIS]}
            matches={buildRoundMatches(ROUNDS.SEMIS)}
            playerMap={playerMap}
            onPick={handlePick}
            isLocked={isLocked}
            isLoggedIn={isLoggedIn}
          />

          {/* Finals + Champion */}
          <div className="flex flex-col">
            <Round
              round={ROUNDS.FINALS}
              roundName={ROUND_NAMES[ROUNDS.FINALS]}
              matches={buildRoundMatches(ROUNDS.FINALS)}
              playerMap={playerMap}
              onPick={handlePick}
              isLocked={isLocked}
              isLoggedIn={isLoggedIn}
            />

            {/* Champion display */}
            {championPlayer && (
              <div className="mt-4 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-center">
                <div className="text-xs text-yellow-700 font-medium">
                  CHAMPION
                </div>
                <div className="font-bold text-lg">{championPlayer.name}</div>
              </div>
            )}

            {/* Consolation (3rd place) */}
            <div className="mt-8">
              <Round
                round={ROUNDS.CONSOLATION}
                roundName={ROUND_NAMES[ROUNDS.CONSOLATION]}
                matches={buildRoundMatches(ROUNDS.CONSOLATION)}
                playerMap={playerMap}
                onPick={handlePick}
                isLocked={isLocked}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls (save, public/private) - only for logged in users */}
      {isLoggedIn && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg flex flex-wrap items-center gap-4">
          {/* Public/Private toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => {
                setIsPublic(e.target.checked);
                setIsDirty(true);
                setSaveMessage(null);
              }}
              disabled={isLocked}
              className="w-4 h-4"
            />
            <span className="text-sm">
              {isPublic ? "Public bracket" : "Private bracket"}
            </span>
          </label>

          {/* Save button */}
          <button
            onClick={async () => {
              setIsSaving(true);
              setSaveMessage(null);

              // Import and call save action
              const { saveBracket } = await import(
                "@/app/tournament/[id]/actions"
              );

              const picksArray = Array.from(picks.entries()).map(
                ([key, winnerSeed]) => {
                  const [round, matchPosition] = key.split("-").map(Number);
                  return { round, matchPosition, winnerSeed };
                }
              );

              const result = await saveBracket({
                tournamentId: tournament.id,
                bracketId: existingBracket?.id ?? null,
                isPublic,
                bracketName: "",
                picks: picksArray,
                finalWinnerGames,
                finalLoserGames,
              });

              setIsSaving(false);

              if (result.error) {
                setSaveMessage(`Error: ${result.error}`);
              } else {
                setSaveMessage("Bracket saved!");
                setIsDirty(false);
              }
            }}
            disabled={isLocked || isSaving}
            className={`px-6 py-2 rounded-lg font-medium ${
              isLocked
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isDirty
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {isSaving ? "Saving..." : "Save Bracket"}
          </button>

          {/* Status message */}
          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.startsWith("Error")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {saveMessage}
            </span>
          )}

          {isLocked && (
            <span className="text-sm text-red-600">
              Predictions are locked
            </span>
          )}
        </div>
      )}
    </div>
  );
}
