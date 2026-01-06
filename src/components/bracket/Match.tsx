"use client";

import type { PlayerMap } from "@/lib/types";
import PlayerSlot from "./PlayerSlot";

interface MatchProps {
  round: number;
  position: number;
  topSeed: number | null;
  bottomSeed: number | null;
  winnerSeed: number | null;
  playerMap: PlayerMap;
  onPick: (round: number, position: number, winnerSeed: number) => void;
  isLocked: boolean;
  isLoggedIn: boolean;
  affectedSeeds?: number[];
  isCorrect?: boolean | null; // null = no result yet, true/false = correct/incorrect prediction
}

export default function Match({
  round,
  position,
  topSeed,
  bottomSeed,
  winnerSeed,
  playerMap,
  onPick,
  isLocked,
  isLoggedIn,
  affectedSeeds,
  isCorrect,
}: MatchProps) {
  const handlePickTop = () => {
    if (topSeed !== null) {
      onPick(round, position, topSeed);
    }
  };

  const handlePickBottom = () => {
    if (bottomSeed !== null) {
      onPick(round, position, bottomSeed);
    }
  };

  // Check if this match involves any affected seeds
  const isAffected = affectedSeeds?.some(
    (seed) => seed === topSeed || seed === bottomSeed
  );

  const isTopWinner = winnerSeed === topSeed && topSeed !== null;
  const isBottomWinner = winnerSeed === bottomSeed && bottomSeed !== null;

  return (
    <div className={`rounded-lg overflow-hidden bg-[rgb(var(--color-bg-primary))] shadow-sm ${
      isAffected ? 'border-2 border-[rgb(var(--color-warning-border))]' : 'border border-[rgb(var(--color-border-secondary))]'
    }`}>
      <PlayerSlot
        seed={topSeed}
        playerMap={playerMap}
        isWinner={isTopWinner}
        isClickable={!isLocked && isLoggedIn && topSeed !== null}
        onClick={handlePickTop}
        position="top"
        isAffected={topSeed !== null && affectedSeeds?.includes(topSeed)}
        isCorrect={isTopWinner ? isCorrect : undefined}
      />
      <div className="border-t border-[rgb(var(--color-border-primary))]" />
      <PlayerSlot
        seed={bottomSeed}
        playerMap={playerMap}
        isWinner={isBottomWinner}
        isClickable={!isLocked && isLoggedIn && bottomSeed !== null}
        onClick={handlePickBottom}
        position="bottom"
        isAffected={bottomSeed !== null && affectedSeeds?.includes(bottomSeed)}
        isCorrect={isBottomWinner ? isCorrect : undefined}
      />
    </div>
  );
}
