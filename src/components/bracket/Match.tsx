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

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <PlayerSlot
        seed={topSeed}
        playerMap={playerMap}
        isWinner={winnerSeed === topSeed && topSeed !== null}
        isClickable={!isLocked && isLoggedIn && topSeed !== null}
        onClick={handlePickTop}
        position="top"
      />
      <div className="border-t border-gray-200" />
      <PlayerSlot
        seed={bottomSeed}
        playerMap={playerMap}
        isWinner={winnerSeed === bottomSeed && bottomSeed !== null}
        isClickable={!isLocked && isLoggedIn && bottomSeed !== null}
        onClick={handlePickBottom}
        position="bottom"
      />
    </div>
  );
}
