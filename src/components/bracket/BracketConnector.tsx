"use client";

import { ROUNDS } from "@/lib/bracket/constants";

interface BracketConnectorProps {
  sourceRound: number;
  sourceMatchCount: number;
  destMatchCount: number;
}

// Match height is 72px, base gap is 8px
const MATCH_HEIGHT = 72;
const BASE_GAP = 8;
const BASE_UNIT = MATCH_HEIGHT + BASE_GAP; // 80px

// Round header height (title + match count + margins + padding + border)
// This offset aligns the connector with the matches, not the round container
const HEADER_HEIGHT = 53;

/**
 * Calculate the Y center position of a match given its index and round
 */
function getMatchCenterY(round: number, matchIndex: number): number {
  const matchCenter = MATCH_HEIGHT / 2; // 36px from top of match

  switch (round) {
    case ROUNDS.OPENING:
    case ROUNDS.ROUND_OF_16:
      // No padding, 8px gaps
      // Match n center = n * (72 + 8) + 36 = n * 80 + 36
      return matchIndex * BASE_UNIT + matchCenter;

    case ROUNDS.QUARTERS:
      // 40px padding, 80px gaps
      // Match n center = 40 + n * (72 + 80) + 36 = 40 + n * 152 + 36
      return 40 + matchIndex * (MATCH_HEIGHT + BASE_UNIT) + matchCenter;

    case ROUNDS.SEMIS:
      // 120px padding, 240px gaps
      // Match n center = 120 + n * (72 + 240) + 36 = 120 + n * 312 + 36
      return 120 + matchIndex * (MATCH_HEIGHT + BASE_UNIT * 3) + matchCenter;

    case ROUNDS.FINALS:
      // 280px padding
      return 280 + matchCenter;

    case ROUNDS.CONSOLATION:
      // Consolation is positioned separately, not in main flow
      return matchCenter;

    default:
      return matchIndex * BASE_UNIT + matchCenter;
  }
}

/**
 * BracketConnector draws SVG lines connecting matches between rounds
 */
export default function BracketConnector({
  sourceRound,
  sourceMatchCount,
  destMatchCount,
}: BracketConnectorProps) {
  const destRound = sourceRound + 1;

  // Calculate SVG dimensions
  // Width: enough for horizontal lines and curves
  const svgWidth = 32;

  // Height: needs to encompass all source matches
  // Use the bottom of the last source match + some buffer
  const lastSourceY = getMatchCenterY(sourceRound, sourceMatchCount - 1);
  const svgHeight = lastSourceY + MATCH_HEIGHT;

  // Generate connector paths
  const paths: string[] = [];

  // Determine how source matches map to destination matches
  const matchesPerDest = sourceMatchCount / destMatchCount;

  for (let destIdx = 0; destIdx < destMatchCount; destIdx++) {
    const destY = getMatchCenterY(destRound, destIdx);

    // Get source matches that feed into this destination
    const sourceStartIdx = destIdx * matchesPerDest;
    const sourceEndIdx = sourceStartIdx + matchesPerDest;

    for (let srcIdx = sourceStartIdx; srcIdx < sourceEndIdx; srcIdx++) {
      const srcY = getMatchCenterY(sourceRound, srcIdx);

      // Draw line from source to destination
      // Horizontal from source, then vertical, then horizontal to dest
      const midX = svgWidth / 2;

      if (matchesPerDest === 1) {
        // 1:1 mapping - simple horizontal line
        paths.push(`M 0 ${srcY} L ${svgWidth} ${srcY}`);
      } else {
        // Multiple sources merge into one dest
        // Draw: horizontal → vertical → horizontal
        paths.push(`M 0 ${srcY} L ${midX} ${srcY} L ${midX} ${destY} L ${svgWidth} ${destY}`);
      }
    }
  }

  // Remove duplicate destination lines (when multiple sources merge)
  // We only need one line going into each destination
  const uniquePaths = [...new Set(paths)];

  return (
    <div
      className="flex items-start"
      style={{ width: svgWidth, paddingTop: HEADER_HEIGHT }}
      data-testid="round-arrow-connector"
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        className="text-[rgb(var(--color-border-primary))]"
      >
        {uniquePaths.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
