"use client";

import { MATCH_HEIGHT, HEADER_HEIGHT, getMatchCenterY } from "@/lib/bracket/layout";

interface BracketConnectorProps {
  sourceRound: number;
  sourceMatchCount: number;
  destMatchCount: number;
}

/**
 * BracketConnector draws SVG lines connecting matches between rounds.
 * Uses shared layout constants to ensure alignment with Round component.
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
        // Draw: horizontal -> vertical -> horizontal
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
        {uniquePaths.map((d) => (
          <path
            key={d}
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
