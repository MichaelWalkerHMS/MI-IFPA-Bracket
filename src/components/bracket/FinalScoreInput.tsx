"use client";

interface FinalScoreInputProps {
  championName: string;
  runnerUpName: string;
  winnerGames: number | null;
  loserGames: number | null;
  onScoreChange: (winnerGames: number, loserGames: number) => void;
  isLocked: boolean;
  isLoggedIn: boolean;
}

const SCORE_OPTIONS = [
  { winnerGames: 4, loserGames: 0, label: "4-0" },
  { winnerGames: 4, loserGames: 1, label: "4-1" },
  { winnerGames: 4, loserGames: 2, label: "4-2" },
  { winnerGames: 4, loserGames: 3, label: "4-3" },
];

export default function FinalScoreInput({
  championName,
  runnerUpName,
  winnerGames,
  loserGames,
  onScoreChange,
  isLocked,
  isLoggedIn,
}: FinalScoreInputProps) {
  const isDisabled = isLocked || !isLoggedIn;

  return (
    <div className="mt-3 p-3 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg">
      <div className="text-xs text-[rgb(var(--color-text-secondary))] mb-2 font-medium">
        Predict final score (Best of 7)
      </div>
      <div className="text-xs text-[rgb(var(--color-text-muted))] mb-2">
        {championName} vs {runnerUpName}
      </div>
      <div className="flex gap-2">
        {SCORE_OPTIONS.map((option) => {
          const isSelected =
            winnerGames === option.winnerGames &&
            loserGames === option.loserGames;

          return (
            <button
              key={option.label}
              onClick={() => onScoreChange(option.winnerGames, option.loserGames)}
              disabled={isDisabled}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                isSelected
                  ? "bg-[rgb(var(--color-accent-primary))] text-white"
                  : isDisabled
                  ? "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-muted))] cursor-not-allowed"
                  : "bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-secondary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
