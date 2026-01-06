"use client";

import { useState, useCallback } from "react";
import type { Tournament, Player, Bracket, Pick, PlayerMap } from "@/lib/types";

// Get base URL for share links
function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
import {
  ROUNDS,
  ROUND_NAMES,
  MATCHES_PER_ROUND,
  OPENING_DISPLAY_ORDER,
  getPickKey,
} from "@/lib/bracket/constants";
import {
  getMatchWinner as getWinner,
  getMatchLoser as getLoser,
  getMatchParticipants as getParticipants,
  applyPick,
} from "@/lib/bracket/logic";
import Round from "./Round";
import FinalScoreInput from "./FinalScoreInput";

interface BracketViewProps {
  tournament: Tournament;
  players: Player[];
  existingBracket: Bracket | null;
  existingPicks: Pick[];
  isLocked: boolean;
  isLoggedIn: boolean;
  // Optional props for shared bracket view
  bracketName?: string | null;
  ownerName?: string;
  // Seeding change warning props
  affectedSeeds?: number[];
  seedingChangeCount?: number;
}

export default function BracketView({
  tournament,
  players,
  existingBracket,
  existingPicks,
  isLocked,
  isLoggedIn,
  bracketName,
  ownerName,
  affectedSeeds,
  seedingChangeCount,
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
  const [editableBracketName, setEditableBracketName] = useState(existingBracket?.name || "");
  const [finalWinnerGames, setFinalWinnerGames] = useState<number | null>(
    existingBracket?.final_winner_games ?? null
  );
  const [finalLoserGames, setFinalLoserGames] = useState<number | null>(
    existingBracket?.final_loser_games ?? null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Track bracket ID in state so it updates after first save
  const [bracketId, setBracketId] = useState<string | null>(existingBracket?.id ?? null);

  // Share URL (available when bracket is saved - uses state to update after first save)
  const shareUrl = bracketId
    ? `${getBaseUrl()}/bracket/${bracketId}`
    : null;

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Wrapper functions that pass current picks state to pure logic functions
  const getMatchWinner = useCallback(
    (round: number, position: number): number | null => {
      return getWinner(picks, round, position);
    },
    [picks]
  );

  const getMatchLoser = useCallback(
    (round: number, position: number): number | null => {
      return getLoser(picks, round, position);
    },
    [picks]
  );

  const getMatchParticipants = useCallback(
    (
      round: number,
      position: number
    ): { topSeed: number | null; bottomSeed: number | null } => {
      return getParticipants(picks, round, position);
    },
    [picks]
  );

  // Handle picking a winner - uses pure logic function for cascade behavior
  const handlePick = useCallback(
    (round: number, position: number, winnerSeed: number) => {
      if (isLocked || !isLoggedIn) return;

      const newPicks = applyPick(picks, round, position, winnerSeed);
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

  // Get champion (winner of finals) and runner-up (loser of finals)
  const champion = getMatchWinner(ROUNDS.FINALS, 0);
  const championPlayer = champion ? playerMap.get(champion) : null;
  const runnerUp = getMatchLoser(ROUNDS.FINALS, 0);
  const runnerUpPlayer = runnerUp ? playerMap.get(runnerUp) : null;

  // Handle final score change
  const handleFinalScoreChange = (winnerGames: number, loserGames: number) => {
    if (isLocked || !isLoggedIn) return;
    setFinalWinnerGames(winnerGames);
    setFinalLoserGames(loserGames);
    setIsDirty(true);
    setSaveMessage(null);
  };

  return (
    <div className="w-full">
      {/* Seeding change warning banner */}
      {(seedingChangeCount ?? 0) > 0 && (
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-3 mb-4 flex items-center gap-2">
          <span className="text-yellow-600 text-lg">&#9888;</span>
          <span className="text-yellow-800">
            Seeding changed {seedingChangeCount} {seedingChangeCount === 1 ? 'time' : 'times'} since you last saved. Review your picks.
          </span>
        </div>
      )}

      {/* Controls bar - only for logged in users */}
      {isLoggedIn && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex flex-wrap items-center gap-3">
          {/* Bracket name input */}
          <input
            type="text"
            value={editableBracketName}
            onChange={(e) => {
              setEditableBracketName(e.target.value);
              setIsDirty(true);
              setSaveMessage(null);
            }}
            placeholder="Bracket name (optional)"
            maxLength={50}
            disabled={isLocked}
            className="flex-1 min-w-[200px] max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />

          {/* Public/Private toggle */}
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
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
              {isPublic ? "Public" : "Private"}
            </span>
          </label>

          {/* Save button */}
          <button
            onClick={async () => {
              setIsSaving(true);
              setSaveMessage(null);

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
                bracketName: editableBracketName.trim(),
                picks: picksArray,
                finalWinnerGames,
                finalLoserGames,
              });

              setIsSaving(false);

              if (result.error) {
                setSaveMessage(`Error: ${result.error}`);
              } else {
                setSaveMessage("Saved!");
                setIsDirty(false);
                if (result.bracket?.id) {
                  setBracketId(result.bracket.id);
                }
              }
            }}
            disabled={isLocked || isSaving}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              isLocked
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isDirty
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
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
            <span className="text-sm text-red-600">Locked</span>
          )}
        </div>
      )}

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
            affectedSeeds={affectedSeeds}
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
            affectedSeeds={affectedSeeds}
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
            affectedSeeds={affectedSeeds}
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
            affectedSeeds={affectedSeeds}
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
              affectedSeeds={affectedSeeds}
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

            {/* Final score prediction */}
            {championPlayer && runnerUpPlayer && (
              <FinalScoreInput
                championName={championPlayer.name}
                runnerUpName={runnerUpPlayer.name}
                winnerGames={finalWinnerGames}
                loserGames={finalLoserGames}
                onScoreChange={handleFinalScoreChange}
                isLocked={isLocked}
                isLoggedIn={isLoggedIn}
              />
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
                affectedSeeds={affectedSeeds}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Share URL - only for logged in users with saved brackets */}
      {isLoggedIn && bracketId && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium mb-2">Share Your Bracket</div>
          {isPublic ? (
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl || ""}
                className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm text-gray-700"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopyUrl}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Make your bracket public to share it with others.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
