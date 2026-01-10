"use client";

import type { PlayerMap } from "@/lib/types";

interface PlayerSlotProps {
  seed: number | null;
  playerMap: PlayerMap;
  isPicked: boolean; // User picked this player as winner
  isClickable: boolean;
  onClick: () => void;
  position: "top" | "bottom";
  isAffected?: boolean;
  isActualWinner?: boolean; // This player actually won (from results)
  isUnexpectedWinner?: boolean; // This player won but user expected someone else entirely
  isCorrect?: boolean | null; // undefined = not picked, null = no result yet, true/false = correct/incorrect
}

export default function PlayerSlot({
  seed,
  playerMap,
  isPicked,
  isClickable,
  onClick,
  isAffected,
  isActualWinner,
  isUnexpectedWinner,
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

  // Background: orange if unexpected winner, green if expected winner, otherwise default
  const bgClass = isUnexpectedWinner
    ? "bg-[rgb(var(--color-warning-bg))]"
    : isActualWinner
    ? "bg-[rgb(var(--color-success-bg))]"
    : "bg-[rgb(var(--color-bg-primary))]";

  const baseClasses = `px-3 py-2 h-9 flex items-center gap-2 text-sm transition-colors ${bgClass} relative overflow-hidden`;
  const pickedClasses = isPicked ? "font-semibold" : "";
  const clickableClasses = isClickable
    ? "cursor-pointer hover:bg-[rgb(var(--color-accent-light))]"
    : "";

  // Determine pick indicator visibility and color
  // Green bar: picked and (no result yet OR correct)
  // Red bar: picked and incorrect
  const showPickIndicator = isPicked;
  const pickIndicatorIsRed = isPicked && isCorrect === false;

  return (
    <div
      className={`${baseClasses} ${pickedClasses} ${clickableClasses}`}
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
      {/* Pick indicator - bar on right edge showing user's pick */}
      {showPickIndicator && (
        <span
          className={`absolute right-0 top-0 bottom-0 w-1 ${
            pickIndicatorIsRed
              ? "bg-[rgb(var(--color-error-icon))]"
              : "bg-[rgb(var(--color-pick-bg))]"
          }`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
