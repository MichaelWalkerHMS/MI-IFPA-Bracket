"use client";

import type { PlayerMap } from "@/lib/types";
import Match from "./Match";
import { ROUNDS } from "@/lib/bracket/constants";

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
}

// Match height + gap = spacing unit
// Each match is h-[72px] (two 36px player slots)
// We use consistent spacing based on this unit

export default function Round({
  round,
  roundName,
  matches,
  playerMap,
  onPick,
  isLocked,
  isLoggedIn,
  affectedSeeds,
}: RoundProps) {
  // Calculate gap between matches based on round
  // Each round doubles the gap to center between pairs from previous round
  const getGapStyle = (): React.CSSProperties => {
    // Base unit: match height (72px) + small gap (8px) = 80px
    const baseUnit = 80;

    switch (round) {
      case ROUNDS.OPENING:
      case ROUNDS.ROUND_OF_16:
        return { gap: '8px' };
      case ROUNDS.QUARTERS:
        // Gap = 1 match height + 2 small gaps = 88px
        return { gap: `${baseUnit}px` };
      case ROUNDS.SEMIS:
        // Gap = 3 match heights + 4 small gaps = 248px
        return { gap: `${baseUnit * 2 + baseUnit}px` };
      case ROUNDS.FINALS:
      case ROUNDS.CONSOLATION:
        return { gap: '8px' };
      default:
        return { gap: '8px' };
    }
  };

  // Calculate top padding to center matches with their source matches
  const getPaddingStyle = (): React.CSSProperties => {
    const baseUnit = 80; // match height + gap

    switch (round) {
      case ROUNDS.OPENING:
      case ROUNDS.ROUND_OF_16:
        return { paddingTop: '0px' };
      case ROUNDS.QUARTERS:
        // Center between pairs: (baseUnit) / 2 = 40px
        return { paddingTop: `${baseUnit / 2}px` };
      case ROUNDS.SEMIS:
        // Center between pairs of QF: paddingTop = QF padding + (QF gap + baseUnit) / 2
        // = 40 + (80 + 80) / 2 = 40 + 80 = 120px
        return { paddingTop: `${baseUnit / 2 + baseUnit}px` };
      case ROUNDS.FINALS:
        // Center between semis: paddingTop = Semis padding + (Semis gap + baseUnit) / 2
        // = 120 + (240 + 80) / 2 = 120 + 160 = 280px
        return { paddingTop: `${baseUnit / 2 + baseUnit + baseUnit * 2}px` };
      case ROUNDS.CONSOLATION:
        return { paddingTop: '0px' };
      default:
        return { paddingTop: '0px' };
    }
  };

  return (
    <div className="flex flex-col w-48">
      {/* Round header */}
      <div className="text-center mb-2 pb-2 border-b border-[rgb(var(--color-border-primary))]">
        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">{roundName}</h3>
        <p className="text-xs text-[rgb(var(--color-text-muted))]">{matches.length} match{matches.length !== 1 ? 'es' : ''}</p>
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
          />
        ))}
      </div>
    </div>
  );
}
