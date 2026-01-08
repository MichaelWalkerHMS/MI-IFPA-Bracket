"use client";

import type { PlayerMap } from "@/lib/types";
import Match from "./Match";
import { ROUNDS } from "@/lib/bracket/constants";
import { ROUND_PADDING, ROUND_GAP, MATCH_GAP } from "@/lib/bracket/layout";

interface MatchData {
  position: number;
  topSeed: number | null;
  bottomSeed: number | null;
  winnerSeed: number | null;
}

interface RoundProps {
  round: number;
  roundName: string;
  matches: MatchData[];
  playerMap: PlayerMap;
  onPick: (round: number, position: number, winnerSeed: number) => void;
  isLocked: boolean;
  isLoggedIn: boolean;
  affectedSeeds?: number[];
  pickCorrectnessMap?: Map<string, boolean | null>; // key: "round-position", value: is_correct
  subtotal?: { earned: number; max: number }; // Points earned / max for this round
}

export default function Round({
  round,
  roundName,
  matches,
  playerMap,
  onPick,
  isLocked,
  isLoggedIn,
  affectedSeeds,
  pickCorrectnessMap,
  subtotal,
}: RoundProps) {
  // Get gap and padding from shared layout constants
  const getGapStyle = (): React.CSSProperties => {
    const gap = ROUND_GAP[round] ?? MATCH_GAP;
    return { gap: `${gap}px` };
  };

  const getPaddingStyle = (): React.CSSProperties => {
    const padding = ROUND_PADDING[round] ?? 0;
    return { paddingTop: `${padding}px` };
  };

  // Check if any picks in this round have been scored (is_correct is not null)
  const hasAnyScored = pickCorrectnessMap && matches.some(m => {
    const key = `${round}-${m.position}`;
    const isCorrect = pickCorrectnessMap.get(key);
    return isCorrect !== undefined && isCorrect !== null;
  });

  return (
    <div className="flex flex-col w-48">
      {/* Round header */}
      <div className="text-center mb-2 pb-2 border-b border-[rgb(var(--color-border-primary))]">
        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{roundName}</h3>
        <p className="text-xs text-[rgb(var(--color-text-muted))]">{matches.length} match{matches.length !== 1 ? 'es' : ''}</p>
        {/* Round subtotal - only show when any picks have been scored */}
        {hasAnyScored && subtotal && (
          <p className="text-xs font-medium mt-1 text-[rgb(var(--color-text-secondary))]">
            {subtotal.earned}/{subtotal.max} pts
          </p>
        )}
      </div>

      {/* Matches container */}
      <div
        className="flex flex-col"
        style={{ ...getGapStyle(), ...getPaddingStyle() }}
      >
        {matches.map((match) => (
          <Match
            key={`${round}-${match.position}`}
            round={round}
            position={match.position}
            topSeed={match.topSeed}
            bottomSeed={match.bottomSeed}
            winnerSeed={match.winnerSeed}
            playerMap={playerMap}
            onPick={onPick}
            isLocked={isLocked}
            isLoggedIn={isLoggedIn}
            affectedSeeds={affectedSeeds}
            isCorrect={pickCorrectnessMap?.get(`${round}-${match.position}`)}
          />
        ))}
      </div>
    </div>
  );
}
