"use client";

import type { PlayerMap } from "@/lib/types";

interface PlayerSlotProps {
  seed: number | null;
  playerMap: PlayerMap;
  isWinner: boolean;
  isClickable: boolean;
  onClick: () => void;
  position: "top" | "bottom";
  isAffected?: boolean;
}

export default function PlayerSlot({
  seed,
  playerMap,
  isWinner,
  isClickable,
  onClick,
  isAffected,
}: PlayerSlotProps) {
  const player = seed !== null ? playerMap.get(seed) : null;

  if (seed === null) {
    // TBD slot - waiting for previous match result
    return (
      <div className="px-3 py-2 h-9 flex items-center text-gray-400 text-sm italic bg-gray-50">
        TBD
      </div>
    );
  }

  const baseClasses = "px-3 py-2 h-9 flex items-center gap-2 text-sm transition-colors";
  const winnerClasses = isWinner
    ? "bg-green-100 font-semibold"
    : "bg-white";
  const clickableClasses = isClickable
    ? "cursor-pointer hover:bg-blue-50"
    : "";

  return (
    <div
      className={`${baseClasses} ${winnerClasses} ${clickableClasses}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span className="text-gray-500 font-mono text-xs w-5">
        {seed}
      </span>
      {isAffected && (
        <span className="text-yellow-500 text-xs" title="Seeding changed">&#9888;</span>
      )}
      <span className={isWinner ? "text-green-800" : "text-gray-900"}>
        {player?.name || `Seed ${seed}`}
      </span>
      {isWinner && (
        <span className="ml-auto text-green-600 text-xs">&#10003;</span>
      )}
    </div>
  );
}
