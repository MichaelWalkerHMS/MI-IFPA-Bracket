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
  isCorrect?: boolean | null; // undefined = not winner, null = no result yet, true/false = correct/incorrect
}

export default function PlayerSlot({
  seed,
  playerMap,
  isWinner,
  isClickable,
  onClick,
  isAffected,
  isCorrect,
}: PlayerSlotProps) {
  const player = seed !== null ? playerMap.get(seed) : null;

  if (seed === null) {
    // TBD slot - waiting for previous match result
    return (
      <div className="px-3 py-2 h-9 flex items-center text-[rgb(var(--color-text-muted))] text-sm italic bg-[rgb(var(--color-bg-secondary))]">
        TBD
      </div>
    );
  }

  const baseClasses = "px-3 py-2 h-9 flex items-center gap-2 text-sm transition-colors bg-[rgb(var(--color-bg-primary))]";
  const winnerClasses = isWinner ? "font-semibold" : "";
  const clickableClasses = isClickable
    ? "cursor-pointer hover:bg-[rgb(var(--color-accent-light))]"
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
      <span className="text-[rgb(var(--color-text-muted))] font-mono text-xs w-5">
        {seed}
      </span>
      {isAffected && (
        <span className="text-[rgb(var(--color-warning-icon))] text-xs" title="Seeding changed">&#9888;</span>
      )}
      <span className="text-[rgb(var(--color-text-primary))]">
        {player?.name || `Seed ${seed}`}
      </span>
      {/* Score badge - only show on winner when result exists */}
      {isWinner && isCorrect !== undefined && isCorrect !== null && (
        <span
          className={`ml-auto text-xs font-bold px-1 rounded ${
            isCorrect
              ? "bg-[rgb(var(--color-success-icon))] text-white"
              : "bg-[rgb(var(--color-error-icon))] text-white"
          }`}
          title={isCorrect ? "Correct prediction" : "Incorrect prediction"}
        >
          {isCorrect ? "✓" : "✗"}
        </span>
      )}
    </div>
  );
}
