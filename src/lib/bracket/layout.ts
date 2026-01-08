import { ROUNDS } from "./constants";

// Base layout units for bracket display
export const MATCH_HEIGHT = 72; // Each match card is 72px tall (two 36px player slots)
export const MATCH_GAP = 8; // Small gap between adjacent matches
export const BASE_UNIT = MATCH_HEIGHT + MATCH_GAP; // 80px - fundamental spacing unit

// Round header height (title + match count + margins + padding + border)
// Calculated from: py-2 (16px) + text-sm title (~20px) + text-xs count (~16px) + border (1px)
export const HEADER_HEIGHT = 53;

// Top padding for each round to center matches with their source matches from the previous round
export const ROUND_PADDING: Record<number, number> = {
  [ROUNDS.OPENING]: 0,
  [ROUNDS.ROUND_OF_16]: 0,
  [ROUNDS.QUARTERS]: BASE_UNIT / 2, // 40px - center between pairs
  [ROUNDS.SEMIS]: BASE_UNIT / 2 + BASE_UNIT, // 120px - center between QF pairs
  [ROUNDS.FINALS]: BASE_UNIT / 2 + BASE_UNIT + BASE_UNIT * 2, // 280px - center between SF pairs
  [ROUNDS.CONSOLATION]: 0,
};

// Gap between matches for each round
// Each round's gap increases to maintain alignment with previous round's match pairs
export const ROUND_GAP: Record<number, number> = {
  [ROUNDS.OPENING]: MATCH_GAP, // 8px
  [ROUNDS.ROUND_OF_16]: MATCH_GAP, // 8px
  [ROUNDS.QUARTERS]: BASE_UNIT, // 80px - gap = 1 base unit
  [ROUNDS.SEMIS]: BASE_UNIT * 3, // 240px - gap = 3 base units
  [ROUNDS.FINALS]: MATCH_GAP, // 8px (single match)
  [ROUNDS.CONSOLATION]: MATCH_GAP, // 8px (single match)
};

/**
 * Calculate the Y center position of a match given its index and round.
 * Used by BracketConnector to draw lines between matches.
 */
export function getMatchCenterY(round: number, matchIndex: number): number {
  const matchCenter = MATCH_HEIGHT / 2; // 36px from top of match
  const padding = ROUND_PADDING[round] ?? 0;
  const gap = ROUND_GAP[round] ?? MATCH_GAP;

  // Match n center = padding + n * (matchHeight + gap) + matchCenter
  return padding + matchIndex * (MATCH_HEIGHT + gap) + matchCenter;
}
