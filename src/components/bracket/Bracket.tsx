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
        <div className="bg-[rgb(var(--color-warning-bg-light))] border border-[rgb(var(--color-warning-border))] rounded-lg p-3 mb-4 flex items-center gap-2">
          <span className="text-[rgb(var(--color-warning-icon))] text-lg">&#9888;</span>
          <span className="text-[rgb(var(--color-warning-text))]">
            Seeding changed {seedingChangeCount} {seedingChangeCount === 1 ? 'time' : 'times'} since you last saved. Review your picks.
          </span>
        </div>
      )}

      {/* Controls bar - only for logged in users */}
      {isLoggedIn && (
        <div className="mb-4 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg flex flex-wrap items-center gap-3">
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
            className="flex-1 min-w-[200px] max-w-sm px-3 py-2 border border-[rgb(var(--color-border-secondary))] rounded-md focus:ring-2 focus:ring-[rgb(var(--color-accent-primary))] focus:border-[rgb(var(--color-accent-primary))] text-sm bg-[rgb(var(--color-bg-primary))]"
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
            <span className="text-sm">Public</span>
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
                ? "bg-[rgb(var(--color-border-secondary))] text-[rgb(var(--color-text-muted))] cursor-not-allowed"
                : isDirty
                ? "bg-[rgb(var(--color-accent-primary))] text-white hover:bg-[rgb(var(--color-accent-hover))]"
                : "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-border-secondary))]"
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          {/* Status message */}
          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.startsWith("Error")
                  ? "text-[rgb(var(--color-error-icon))]"
                  : "text-[rgb(var(--color-success-icon))]"
              }`}
            >
              {saveMessage}
            </span>
          )}

          {isLocked && (
            <span className="text-sm text-[rgb(var(--color-error-icon))]">Locked</span>
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
              <div className="mt-4 p-3 bg-[rgb(var(--color-warning-bg))] border-2 border-[rgb(var(--color-warning-border))] rounded-lg text-center">
                <div className="text-xs text-[rgb(var(--color-warning-text))] font-medium">
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
        <div className="mt-4 p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
          <div className="text-sm font-medium mb-2">Share Your Bracket</div>
          {isPublic ? (
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl || ""}
                className="flex-1 px-3 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))] text-sm text-[rgb(var(--color-text-primary))]"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopyUrl}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? "bg-[rgb(var(--color-success-icon))] text-white"
                    : "bg-[rgb(var(--color-accent-primary))] text-white hover:bg-[rgb(var(--color-accent-hover))]"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[rgb(var(--color-text-muted))]">
              Make your bracket public to share it with others.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
