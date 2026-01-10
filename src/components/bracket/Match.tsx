"use client";

import type { PlayerMap } from "@/lib/types";
import type { PickResultInfo } from "./Round";
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
  pickResultInfo?: PickResultInfo;
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
  pickResultInfo,
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

  // User's pick (who they selected as winner)
  const isTopPicked = winnerSeed === topSeed && topSeed !== null;
  const isBottomPicked = winnerSeed === bottomSeed && bottomSeed !== null;

  // Actual result info
  const hasResult = pickResultInfo?.actualWinner !== null && pickResultInfo?.actualWinner !== undefined;
  const actualWinner = pickResultInfo?.actualWinner ?? null;
  const actualLoser = pickResultInfo?.actualLoser ?? null;
  const isCorrect = pickResultInfo?.isCorrect ?? null;
  const pickedWinner = pickResultInfo?.pickedWinner ?? null;

  // Determine result bar content and whether winner was expected
  let resultBarText: string | null = null;
  let resultBarColor: "green" | "red" | "orange" | null = null;
  let winnerWasUnexpected = false; // True if actual winner wasn't expected to be in this match

  if (hasResult && pickedWinner !== null) {
    if (isCorrect) {
      // User picked correctly
      resultBarText = "Correct pick!";
      resultBarColor = "green";
    } else if (pickedWinner === actualLoser) {
      // User picked someone who was in the match but lost
      const pickedPlayer = playerMap.get(pickedWinner);
      resultBarText = `You picked ${pickedPlayer?.name || `Seed ${pickedWinner}`}`;
      resultBarColor = "red";
    } else {
      // User expected a different player entirely (their pick lost earlier)
      const pickedPlayer = playerMap.get(pickedWinner);
      resultBarText = `Expected ${pickedPlayer?.name || `Seed ${pickedWinner}`}`;
      resultBarColor = "orange";
      winnerWasUnexpected = true;
    }
  }

  // Determine border and rounding based on whether result bar is shown
  const hasResultBar = !!resultBarText;
  const matchContainerClasses = hasResultBar
    ? `rounded-t-lg overflow-hidden bg-[rgb(var(--color-bg-primary))] shadow-sm ${
        isAffected ? 'border-2 border-b-0 border-[rgb(var(--color-warning-border))]' : 'border border-b-0 border-[rgb(var(--color-border-secondary))]'
      }`
    : `rounded-lg overflow-hidden bg-[rgb(var(--color-bg-primary))] shadow-sm ${
        isAffected ? 'border-2 border-[rgb(var(--color-warning-border))]' : 'border border-[rgb(var(--color-border-secondary))]'
      }`;

  return (
    <div className="flex flex-col">
      <div className={matchContainerClasses}>
        <PlayerSlot
          seed={topSeed}
          playerMap={playerMap}
          isPicked={isTopPicked}
          isClickable={!isLocked && isLoggedIn && topSeed !== null}
          onClick={handlePickTop}
          position="top"
          isAffected={topSeed !== null && affectedSeeds?.includes(topSeed)}
          isActualWinner={hasResult && topSeed === actualWinner}
          isUnexpectedWinner={hasResult && topSeed === actualWinner && winnerWasUnexpected}
          isCorrect={isTopPicked ? isCorrect : undefined}
        />
        <div className="border-t border-[rgb(var(--color-border-primary))]" />
        <PlayerSlot
          seed={bottomSeed}
          playerMap={playerMap}
          isPicked={isBottomPicked}
          isClickable={!isLocked && isLoggedIn && bottomSeed !== null}
          onClick={handlePickBottom}
          position="bottom"
          isAffected={bottomSeed !== null && affectedSeeds?.includes(bottomSeed)}
          isActualWinner={hasResult && bottomSeed === actualWinner}
          isUnexpectedWinner={hasResult && bottomSeed === actualWinner && winnerWasUnexpected}
          isCorrect={isBottomPicked ? isCorrect : undefined}
        />
      </div>
      {/* Result bar - shows pick outcome after results are in */}
      {resultBarText && (
        <div className={`px-3 py-1 text-xs font-medium rounded-b-lg ${
          resultBarColor === "green"
            ? "bg-[rgb(var(--color-success-bg))] text-[rgb(var(--color-success-text))] border border-t-0 border-[rgb(var(--color-border-secondary))]"
            : resultBarColor === "red"
            ? "bg-[rgb(var(--color-error-bg))] text-[rgb(var(--color-error-text))] border border-t-0 border-[rgb(var(--color-border-secondary))]"
            : "bg-[rgb(var(--color-warning-bg))] text-[rgb(var(--color-warning-text))] border border-t-0 border-[rgb(var(--color-border-secondary))]"
        }`}>
          {resultBarText}
        </div>
      )}
    </div>
  );
}
