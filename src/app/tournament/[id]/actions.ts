"use server";

import { createClient } from "@/lib/supabase/server";
import type { SaveBracketInput, LoadBracketResult, Bracket, Pick } from "@/lib/types";

/**
 * Load the current user's bracket and picks for a tournament
 */
export async function loadUserBracket(
  tournamentId: string
): Promise<LoadBracketResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bracket: null, picks: [] };
  }

  // Get bracket
  const { data: bracket } = await supabase
    .from("brackets")
    .select("*")
    .eq("user_id", user.id)
    .eq("tournament_id", tournamentId)
    .single();

  if (!bracket) {
    return { bracket: null, picks: [] };
  }

  // Get picks
  const { data: picks } = await supabase
    .from("picks")
    .select("*")
    .eq("bracket_id", bracket.id);

  return {
    bracket: bracket as Bracket,
    picks: (picks || []) as Pick[],
  };
}

/**
 * Save or update a bracket with picks
 */
export async function saveBracket(
  data: SaveBracketInput
): Promise<{ bracket: Bracket | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bracket: null, error: "Not authenticated" };
  }

  // Check lock status
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("lock_date")
    .eq("id", data.tournamentId)
    .single();

  if (!tournament) {
    return { bracket: null, error: "Tournament not found" };
  }

  if (new Date(tournament.lock_date) <= new Date()) {
    return { bracket: null, error: "Predictions are locked" };
  }

  // Check if bracket already exists
  const { data: existingBracket } = await supabase
    .from("brackets")
    .select("id")
    .eq("user_id", user.id)
    .eq("tournament_id", data.tournamentId)
    .single();

  let bracketId: string;

  if (existingBracket) {
    // Update existing bracket
    const { data: updatedBracket, error: updateError } = await supabase
      .from("brackets")
      .update({
        name: data.bracketName || null,
        is_public: data.isPublic,
        final_winner_games: data.finalWinnerGames,
        final_loser_games: data.finalLoserGames,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingBracket.id)
      .select()
      .single();

    if (updateError) {
      return { bracket: null, error: updateError.message };
    }

    bracketId = updatedBracket.id;
  } else {
    // Insert new bracket
    const { data: newBracket, error: insertError } = await supabase
      .from("brackets")
      .insert({
        user_id: user.id,
        tournament_id: data.tournamentId,
        name: data.bracketName || null,
        is_public: data.isPublic,
        final_winner_games: data.finalWinnerGames,
        final_loser_games: data.finalLoserGames,
      })
      .select()
      .single();

    if (insertError) {
      return { bracket: null, error: insertError.message };
    }

    bracketId = newBracket.id;
  }

  // Delete existing picks for this bracket
  await supabase.from("picks").delete().eq("bracket_id", bracketId);

  // Insert new picks
  if (data.picks.length > 0) {
    const picksToInsert = data.picks.map((p) => ({
      bracket_id: bracketId,
      round: p.round,
      match_position: p.matchPosition,
      winner_seed: p.winnerSeed,
    }));

    const { error: picksError } = await supabase
      .from("picks")
      .insert(picksToInsert);

    if (picksError) {
      return { bracket: null, error: picksError.message };
    }
  }

  // Fetch and return the complete bracket
  const { data: finalBracket } = await supabase
    .from("brackets")
    .select("*")
    .eq("id", bracketId)
    .single();

  return { bracket: finalBracket as Bracket, error: null };
}

/**
 * Check if predictions are locked for a tournament
 */
export async function checkLockStatus(
  tournamentId: string
): Promise<{ locked: boolean; lockDate: string | null }> {
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("lock_date")
    .eq("id", tournamentId)
    .single();

  if (!tournament) {
    return { locked: true, lockDate: null };
  }

  const isLocked = new Date(tournament.lock_date) <= new Date();
  return { locked: isLocked, lockDate: tournament.lock_date };
}
